package com.zzh.personal_hub.ai.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "ai_run_log")
public class AiRunLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 64)
    private String slug;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "client_key", nullable = false, length = 128)
    private String clientKey;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();
}
