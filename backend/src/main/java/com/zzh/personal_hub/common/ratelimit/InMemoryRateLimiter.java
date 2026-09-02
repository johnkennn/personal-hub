package com.zzh.personal_hub.common.ratelimit;

import java.util.concurrent.ConcurrentHashMap;
import java.util.Deque;
import java.util.Map;
import java.util.ArrayDeque;

import org.springframework.stereotype.Component;

@Component
public class InMemoryRateLimiter {

    private final Map<String, Deque<Long>> hits = new ConcurrentHashMap<>();

    /**
     * @param key      维度，如 "login:127.0.0.1"
     * @param limit    窗口内最大次数
     * @param windowMs 窗口长度（毫秒）
     * @return true = 允许；false = 超限
     */
    public boolean tryAcquire(String key, int limit, long windowMs) {
        long now = System.currentTimeMillis();
        Deque<Long> q = hits.computeIfAbsent(key, k -> new ArrayDeque<>());
        synchronized (q) {
            while (!q.isEmpty() && now - q.peekFirst() >= windowMs) {
                q.pollFirst();
            }
            if (q.size() >= limit) {
                return false;
            }
            q.addLast(now);
            return true;
        }
    }
}
