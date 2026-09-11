package com.zzh.personal_hub.ai.repository;

import com.zzh.personal_hub.ai.entity.AiRunLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;

public interface AiRunLogRepository extends JpaRepository<AiRunLog, Long> {
    long countBySlugAndClientKeyAndCreatedAtGreaterThanEqual(
            String slug, String clientKey, Instant createdAt);
}
