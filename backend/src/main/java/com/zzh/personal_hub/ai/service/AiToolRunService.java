package com.zzh.personal_hub.ai.service;

import com.zzh.personal_hub.ai.client.AiChatTurn;
import com.zzh.personal_hub.ai.client.AiClient;
import com.zzh.personal_hub.ai.config.AiProperties;
import com.zzh.personal_hub.ai.dto.AiRunResponse;
import com.zzh.personal_hub.ai.dto.ChatHistoryItem;
import com.zzh.personal_hub.ai.dto.ChatQuotaResponse;
import com.zzh.personal_hub.ai.entity.AiRunLog;
import com.zzh.personal_hub.ai.repository.AiRunLogRepository;
import com.zzh.personal_hub.common.exception.BusinessException;
import com.zzh.personal_hub.common.security.CurrentUserService;
import com.zzh.personal_hub.media.ChatTempTextExtractor;
import com.zzh.personal_hub.user.entity.User;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

import com.zzh.personal_hub.media.ChatTempImageLoader;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Service
@RequiredArgsConstructor
public class AiToolRunService {

    private final ChatTempImageLoader chatTempImageLoader;
    private final AiQuotaRedisService aiQuotaRedisService;
    private static final ZoneId ZONE = ZoneId.of("Asia/Shanghai");

    /** 统一大模型人设；旧技能 slug 会归一到 chat */
    private static final String CHAT_SYSTEM_PROMPT =
            "你是「小智」，小智AI 的站内助手。自称用「小智」而不是「我」，语气友好、略可爱但不油腻。"
                    + "可回答一般问题，也可协助翻译、文案、总结、简历润色、合同风险提示等。"
                    + "回答简洁准确；不确定就说明。若用户消息里带有本地日期参考，回答日期问题时以该日期为准。"
                    + "推荐 AI 产品时：优先依据对话里已给出的站内检索结果；若没有站内命中，先说明本站暂无直接匹配，"
                    + "再基于通用知识给简要建议，并提醒以官网为准，不要假装某产品已收录在本站。";

    /** 上下文双限制：最多保留若干条历史（约 N 轮），且总字符有上限 */
    private static final int MAX_HISTORY_MESSAGES = 16;
    private static final int MAX_HISTORY_CHARS = 10_000;

    /** 历史多技能入口，全部走同一套 chat 提示词 */
    private static final Set<String> LEGACY_SKILL_SLUGS = Set.of(
            "copywriting", "translate", "resume", "summary", "contract"
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
        String text = aiClient.complete(CHAT_SYSTEM_PROMPT, ctx.prompt());
        saveLog(ctx);
        return new AiRunResponse(text, remainingAfterUse(ctx), ctx.dailyQuota());
    }

    /**
     * SSE 流式：先校验配额，再异步推送 delta / done / error。
     * 事件名：delta（text）、done（remainingQuota/dailyQuota）、error（message）
     */
    public SseEmitter runStream(String slug, String prompt, java.util.List<String> attachmentUrls, HttpServletRequest request) {
        return runStream(slug, prompt, attachmentUrls, null, request);
    }

    public SseEmitter runStream(
            String slug,
            String prompt,
            java.util.List<String> attachmentUrls,
            java.util.List<ChatHistoryItem> history,
            HttpServletRequest request) {
        final List<String> dataUrls;
        final RunContext ctx;
        final List<AiChatTurn> turns;
        try {
            var images = chatTempImageLoader.loadImages(attachmentUrls);
            dataUrls = images.stream().map(ChatTempImageLoader.ImagePart::dataUrl).toList();
            String fullPrompt = buildPrompt(prompt, attachmentUrls);
            if (!dataUrls.isEmpty()) {
                String base = prompt == null ? "" : prompt.trim();
                if (!StringUtils.hasText(base)) {
                    base = "请描述这张图片的主要内容。";
                }
                String textPart = chatTempTextExtractor.extractAll(attachmentUrls);
                fullPrompt = StringUtils.hasText(textPart)
                        ? "用户说明：\n" + base + "\n\n【附件文字】\n" + textPart
                        : base;
            }
            // 配额等业务错误：不要抛出打断 SSE 协商（易变成 HTTP 500），改为 error 事件
            ctx = prepare(slug, fullPrompt, request);
            turns = sanitizeHistory(history);
        } catch (BusinessException e) {
            return failedSse(e.getCode(), e.getMessage());
        }

        long timeout = Math.max(30_000L, aiProperties.getTimeoutMs() + 15_000L);
        SseEmitter emitter = new SseEmitter(timeout);

        STREAM_EXECUTOR.execute(() -> {
            try {
                aiClient.stream(CHAT_SYSTEM_PROMPT, turns, ctx.prompt(), dataUrls, delta -> {
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
                String detail = e.getMessage();
                if (detail != null && detail.length() > 160) {
                    detail = detail.substring(0, 160) + "…";
                }
                String msg = (detail != null && !detail.isBlank())
                        ? "生成失败：" + detail
                        : "生成失败，请稍后重试";
                try {
                    sendJson(emitter, "error", Map.of("message", msg, "code", 502));
                    emitter.complete();
                } catch (Exception ignored) {
                    emitter.completeWithError(e);
                }
            }
        });

        return emitter;
    }

    /** 同步失败（如额度用尽）时仍返回 SSE，方便前端统一解析 error 事件 */
    private SseEmitter failedSse(int code, String message) {
        SseEmitter emitter = new SseEmitter(15_000L);
        STREAM_EXECUTOR.execute(() -> {
            try {
                sendJson(emitter, "error", Map.of(
                        "message", message == null ? "请求失败" : message,
                        "code", code
                ));
                emitter.complete();
            } catch (Exception e) {
                emitter.completeWithError(e);
            }
        });
        return emitter;
    }

    private RunContext prepare(String slug, String prompt, HttpServletRequest request) {
        String normalized = normalizeToChatSlug(slug);
        if (!StringUtils.hasText(prompt)) {
            throw new BusinessException(400, "请输入内容");
        }

        Optional<User> user = currentUserService.findUser();
        Long userId = user.map(User::getId).orElse(null);
        String clientKey = userId != null ? "u:" + userId : "ip:" + clientIp(request);
        int dailyQuota = userId != null
                ? aiProperties.getUserDailyQuota()
                : aiProperties.getGuestDailyQuota();

        // Instant dayStart = LocalDate.now(ZONE).atStartOfDay(ZONE).toInstant();
        // long used = aiRunLogRepository.countByClientKeyAndCreatedAtGreaterThanEqual(
        //         clientKey, dayStart);
        long used = aiQuotaRedisService.getUsed(clientKey);
        if (aiProperties.isQuotaEnabled() && used >= dailyQuota) {
            throw new BusinessException(429, "今日额度已用完，登录或明天再试");
        }

        return new RunContext(normalized, prompt.trim(), userId, clientKey, dailyQuota, used);
    }

    /** chat 与历史技能 slug 一律记为 chat，配额统一按 chat 计 */
    private static String normalizeToChatSlug(String slug) {
        String normalized = slug == null ? "" : slug.trim().toLowerCase();
        if ("chat".equals(normalized) || LEGACY_SKILL_SLUGS.contains(normalized)) {
            return "chat";
        }
        throw new BusinessException(404, "该能力暂未开放");
    }

    private void saveLog(RunContext ctx) {
        AiRunLog log = new AiRunLog();
        log.setSlug(ctx.slug());
        log.setUserId(ctx.userId());
        log.setClientKey(ctx.clientKey());
        log.setCreatedAt(Instant.now());
        aiRunLogRepository.save(log);
        aiQuotaRedisService.increment(ctx.clientKey());
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

    /** 从最新往旧截断：最多 MAX_HISTORY_MESSAGES 条，且总字符 ≤ MAX_HISTORY_CHARS */
    private List<AiChatTurn> sanitizeHistory(List<ChatHistoryItem> raw) {
        if (raw == null || raw.isEmpty()) {
            return List.of();
        }
        List<AiChatTurn> cleaned = new ArrayList<>();
        for (ChatHistoryItem item : raw) {
            if (item == null || !StringUtils.hasText(item.getContent())) {
                continue;
            }
            String role = item.getRole() == null ? "" : item.getRole().trim().toLowerCase();
            if (!"user".equals(role) && !"assistant".equals(role)) {
                continue;
            }
            String content = item.getContent().trim();
            if (content.length() > 2000) {
                content = content.substring(0, 2000) + "…";
            }
            cleaned.add(new AiChatTurn(role, content));
        }
        if (cleaned.isEmpty()) {
            return List.of();
        }
        List<AiChatTurn> recent = cleaned.size() <= MAX_HISTORY_MESSAGES
                ? cleaned
                : cleaned.subList(cleaned.size() - MAX_HISTORY_MESSAGES, cleaned.size());
        int total = 0;
        int from = recent.size();
        for (int i = recent.size() - 1; i >= 0; i--) {
            int len = recent.get(i).content().length();
            if (total + len > MAX_HISTORY_CHARS) {
                break;
            }
            total += len;
            from = i;
        }
        if (from >= recent.size()) {
            return List.of();
        }
        return new ArrayList<>(recent.subList(from, recent.size()));
    }

    private record RunContext(
            String slug,
            String prompt,
            Long userId,
            String clientKey,
            int dailyQuota,
            long usedBefore
    ) {}

    public ChatQuotaResponse quotaStatus(HttpServletRequest request) {
        Optional<User> user = currentUserService.findUser();
        Long userId = user.map(User::getId).orElse(null);
        String clientKey = userId != null ? "u:" + userId : "ip:" + clientIp(request);
        int dailyQuota = userId != null
                ? aiProperties.getUserDailyQuota()
                : aiProperties.getGuestDailyQuota();
        // Instant dayStart = LocalDate.now(ZONE).atStartOfDay(ZONE).toInstant();
        // long used = aiRunLogRepository.countByClientKeyAndCreatedAtGreaterThanEqual(
        //         clientKey, dayStart);
        long used = aiQuotaRedisService.getUsed(clientKey);
        int remaining = (int) Math.max(0, dailyQuota - used);
        return new ChatQuotaResponse(remaining, dailyQuota, aiProperties.isQuotaEnabled());
    }
}
