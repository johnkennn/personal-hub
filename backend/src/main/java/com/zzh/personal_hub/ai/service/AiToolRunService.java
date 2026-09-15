package com.zzh.personal_hub.ai.service;

import com.zzh.personal_hub.ai.client.AiClient;
import com.zzh.personal_hub.ai.config.AiProperties;
import com.zzh.personal_hub.ai.dto.AiRunResponse;
import com.zzh.personal_hub.ai.entity.AiRunLog;
import com.zzh.personal_hub.ai.repository.AiRunLogRepository;
import com.zzh.personal_hub.common.exception.BusinessException;
import com.zzh.personal_hub.common.security.CurrentUserService;
import com.zzh.personal_hub.media.ChatTempTextExtractor;
import com.zzh.personal_hub.user.entity.User;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Service
@RequiredArgsConstructor
public class AiToolRunService {

    private static final ZoneId ZONE = ZoneId.of("Asia/Shanghai");
    private static final Map<String, String> SYSTEM_PROMPTS = Map.of(
        "chat",
        "你是 AI Tools Hub 的站内助手。可回答一般问题，也可协助翻译、文案、总结等。"
        + "回答简洁准确；不确定就说明。若用户消息里带有本地日期参考，回答日期问题时以该日期为准。"
        + "不要编造站内不存在的产品。",
        "copywriting",
        "你是电商与营销文案助手。根据用户给出的卖点、受众与语气，生成可直接使用的商品描述草稿。"
                + "结构清晰，避免空话；不要编造无法从输入推断的参数。",
        "translate",
        "你是专业翻译助手。根据用户指定的目标语言翻译文本；若未说明目标语言，默认译为英文。"
                + "只输出译文（必要时可加一行极短的语言说明），不要扩写、不要评论原文。",
        "resume",
        "你是简历优化助手。在保留事实的前提下润色结构与措辞，给出可直接粘贴的改写建议。"
        + "不要编造经历；可简短免责：仅供参考、非求职保证。",
        "summary",
        "你是文档总结助手。根据用户说明与提供的正文，提炼条理清晰的要点摘要。"
        + "不要编造原文没有的信息；若材料过短，如实说明。"
    );

    private static final ExecutorService STREAM_EXECUTOR = Executors.newFixedThreadPool(8, r -> {
        Thread t = new Thread(r, "ai-stream");
        t.setDaemon(true);
        return t;
    });

    private final ChatTempTextExtractor chatTempTextExtractor;
    private final AiClient aiClient;
    private final AiRunLogRepository aiRunLogRepository;
    private final AiProperties aiProperties;
    private final CurrentUserService currentUserService;

    public AiRunResponse run(String slug, String prompt, HttpServletRequest request) {
        RunContext ctx = prepare(slug, prompt, request);
        String text = aiClient.complete(SYSTEM_PROMPTS.get(ctx.slug()), ctx.prompt());
        saveLog(ctx);
        return new AiRunResponse(text, remainingAfterUse(ctx), ctx.dailyQuota());
    }

    /**
     * SSE 流式：先校验配额，再异步推送 delta / done / error。
     * 事件名：delta（text）、done（remainingQuota/dailyQuota）、error（message）
     */
    public SseEmitter runStream(String slug, String prompt, java.util.List<String> attachmentUrls, HttpServletRequest request) {
        String fullPrompt = buildPrompt(prompt, attachmentUrls);
        RunContext ctx = prepare(slug, fullPrompt, request);
        long timeout = Math.max(30_000L, aiProperties.getTimeoutMs() + 15_000L);
        SseEmitter emitter = new SseEmitter(timeout);

        STREAM_EXECUTOR.execute(() -> {
            try {
                aiClient.stream(SYSTEM_PROMPTS.get(ctx.slug()), ctx.prompt(), delta -> {
                    try {
                        sendJson(emitter, "delta", Map.of("text", delta));
                    } catch (IOException e) {
                        throw new IllegalStateException(e);
                    }
                });
                saveLog(ctx);
                Map<String, Object> done = new LinkedHashMap<>();
                done.put("remainingQuota", remainingAfterUse(ctx));
                done.put("dailyQuota", ctx.dailyQuota());
                sendJson(emitter, "done", done);
                emitter.complete();
            } catch (BusinessException e) {
                try {
                    sendJson(emitter, "error", Map.of("message", e.getMessage(), "code", e.getCode()));
                    emitter.complete();
                } catch (Exception ignored) {
                    emitter.completeWithError(e);
                }
            } catch (Exception e) {
                try {
                    sendJson(emitter, "error", Map.of("message", "生成失败，请稍后重试", "code", 502));
                    emitter.complete();
                } catch (Exception ignored) {
                    emitter.completeWithError(e);
                }
            }
        });

        return emitter;
    }

    private RunContext prepare(String slug, String prompt, HttpServletRequest request) {
        String normalized = slug == null ? "" : slug.trim().toLowerCase();
        if (!SYSTEM_PROMPTS.containsKey(normalized)) {
            throw new BusinessException(404, "该技能暂未开放");
        }
        if (!StringUtils.hasText(prompt)) {
            throw new BusinessException(400, "请输入内容");
        }

        Optional<User> user = currentUserService.findUser();
        Long userId = user.map(User::getId).orElse(null);
        String clientKey = userId != null ? "u:" + userId : "ip:" + clientIp(request);
        int dailyQuota = userId != null
                ? aiProperties.getUserDailyQuota()
                : aiProperties.getGuestDailyQuota();

        Instant dayStart = LocalDate.now(ZONE).atStartOfDay(ZONE).toInstant();
        long used = aiRunLogRepository.countBySlugAndClientKeyAndCreatedAtGreaterThanEqual(
                normalized, clientKey, dayStart);
        if (aiProperties.isQuotaEnabled() && used >= dailyQuota) {
            throw new BusinessException(429, "今日额度已用完，登录或明天再试");
        }

        return new RunContext(normalized, prompt.trim(), userId, clientKey, dailyQuota, used);
    }

    private void saveLog(RunContext ctx) {
        AiRunLog log = new AiRunLog();
        log.setSlug(ctx.slug());
        log.setUserId(ctx.userId());
        log.setClientKey(ctx.clientKey());
        log.setCreatedAt(Instant.now());
        aiRunLogRepository.save(log);
    }

    private String buildPrompt(String prompt, java.util.List<String> attachmentUrls) {
        String base = prompt == null ? "" : prompt.trim();
        if (attachmentUrls == null || attachmentUrls.isEmpty()) {
            return base;
        }
        String extracted = chatTempTextExtractor.extractAll(attachmentUrls);
        if (!StringUtils.hasText(extracted)) {
            return base;
        }
        return "用户说明：\n" + base + "\n\n【附件内容】\n" + extracted;
    }

    private int remainingAfterUse(RunContext ctx) {
        return (int) Math.max(0, ctx.dailyQuota() - ctx.usedBefore() - 1);
    }

    private void sendJson(SseEmitter emitter, String event, Map<String, ?> data) throws IOException {
        emitter.send(SseEmitter.event().name(event).data(data, MediaType.APPLICATION_JSON));
    }

    private String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (StringUtils.hasText(forwarded)) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr() == null ? "unknown" : request.getRemoteAddr();
    }

    private record RunContext(
            String slug,
            String prompt,
            Long userId,
            String clientKey,
            int dailyQuota,
            long usedBefore
    ) {}
}
