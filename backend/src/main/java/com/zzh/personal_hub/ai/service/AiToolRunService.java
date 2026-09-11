package com.zzh.personal_hub.ai.service;

import com.zzh.personal_hub.ai.client.AiClient;
import com.zzh.personal_hub.ai.config.AiProperties;
import com.zzh.personal_hub.ai.dto.AiRunResponse;
import com.zzh.personal_hub.ai.entity.AiRunLog;
import com.zzh.personal_hub.ai.repository.AiRunLogRepository;
import com.zzh.personal_hub.common.exception.BusinessException;
import com.zzh.personal_hub.common.security.CurrentUserService;
import com.zzh.personal_hub.user.entity.User;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AiToolRunService {

    private static final ZoneId ZONE = ZoneId.of("Asia/Shanghai");

    private static final Map<String, String> SYSTEM_PROMPTS = Map.of(
            "copywriting",
            "你是电商与营销文案助手。根据用户给出的卖点、受众与语气，生成可直接使用的商品描述草稿。"
                    + "结构清晰，避免空话；不要编造无法从输入推断的参数。"
    );

    private final AiClient aiClient;
    private final AiRunLogRepository aiRunLogRepository;
    private final AiProperties aiProperties;
    private final CurrentUserService currentUserService;

    @Transactional
    public AiRunResponse run(String slug, String prompt, HttpServletRequest request) {
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
        if (used >= dailyQuota) {
            throw new BusinessException(429, "今日额度已用完，登录或明天再试");
        }

        String text = aiClient.complete(SYSTEM_PROMPTS.get(normalized), prompt.trim());

        AiRunLog log = new AiRunLog();
        log.setSlug(normalized);
        log.setUserId(userId);
        log.setClientKey(clientKey);
        log.setCreatedAt(Instant.now());
        aiRunLogRepository.save(log);

        int remaining = (int) Math.max(0, dailyQuota - used - 1);
        return new AiRunResponse(text, remaining, dailyQuota);
    }

    private String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (StringUtils.hasText(forwarded)) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr() == null ? "unknown" : request.getRemoteAddr();
    }
}
