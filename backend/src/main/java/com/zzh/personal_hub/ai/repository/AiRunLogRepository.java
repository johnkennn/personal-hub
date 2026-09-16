package com.zzh.personal_hub.ai.repository;

import com.zzh.personal_hub.ai.entity.AiRunLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;

public interface AiRunLogRepository extends JpaRepository<AiRunLog, Long> {
    /** 统一按客户端计日配额（不区分历史技能 slug） */
    long countByClientKeyAndCreatedAtGreaterThanEqual(String clientKey, Instant createdAt);
}
