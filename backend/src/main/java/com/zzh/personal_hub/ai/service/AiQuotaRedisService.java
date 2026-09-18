package com.zzh.personal_hub.ai.service;

import org.springframework.stereotype.Service;
import java.time.ZoneId;
import java.time.LocalDate;
import java.time.Duration;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import org.springframework.data.redis.core.StringRedisTemplate;
import lombok.RequiredArgsConstructor;

@Service 
@RequiredArgsConstructor 
public class AiQuotaRedisService {

    private static final ZoneId ZONE = ZoneId.of("Asia/Shanghai");
    private static final DateTimeFormatter DAY = DateTimeFormatter.BASIC_ISO_DATE; // yyyyMMdd

    private final StringRedisTemplate redis;

    private String key(String clientKey) {
        String day = LocalDate.now(ZONE).format(DAY);
        return "ai:quota:" + clientKey + ":" + day;
    }

    // 今日已用次数；没有key当0
    public long getUsed(String clientKey) {
        String v = redis.opsForValue().get(key(clientKey));
        if(v == null || v.isBlank()) {
            return 0L;
        }
        try {
            return Long.parseLong(v.trim());
        } catch (NumberFormatException e) {
            return 0L;
        }
    }

    // 成功消耗1次，返回增加后的值
    public long increment(String clientKey) {
        String k = key(clientKey);
        Long after = redis.opsForValue().increment(k);
        if(after !=null && after ==1L) {
            // 第一次创建：过期到明天 0 点
            redis.expire(k, ttlUntilNextMidnight());
        }
        return after == null ? 0L : after;
    }

    private Duration ttlUntilNextMidnight() {
        ZonedDateTime now = ZonedDateTime.now(ZONE);
        ZonedDateTime next = now.toLocalDate().plusDays(1).atStartOfDay(ZONE);
        Duration d = Duration.between(now, next);
        // 至少 1 分钟，避免极端情况 0
        return d.isNegative() || d.isZero() ? Duration.ofMinutes(1) : d;
    }
}