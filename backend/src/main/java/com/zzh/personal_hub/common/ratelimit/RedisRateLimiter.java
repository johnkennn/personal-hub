package com.zzh.personal_hub.common.ratelimit;

import java.time.Duration;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;

/**
 * 基于 Redis 固定窗口的限流：窗口内 INCR，首次设置 TTL。
 */
@Component
@RequiredArgsConstructor
public class RedisRateLimiter {

    private final StringRedisTemplate redis;

    /**
     * @param key      维度，如 "login:127.0.0.1"
     * @param limit    窗口内最大次数
     * @param windowMs 窗口长度（毫秒）
     * @return true = 允许；false = 超限
     */
    public boolean tryAcquire(String key, int limit, long windowMs) {
        String redisKey = "rl:" + key;
        Long count = redis.opsForValue().increment(redisKey);
        if (count == null) {
            return false;
        }
        if (count == 1L) {
            redis.expire(redisKey, Duration.ofMillis(Math.max(windowMs, 1000L)));
        }
        return count <= limit;
    }
}
