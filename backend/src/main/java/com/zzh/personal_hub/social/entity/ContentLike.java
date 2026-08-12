package com.zzh.personal_hub.social.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Column;
import java.time.Instant;
import jakarta.persistence.Enumerated;
import jakarta.persistence.EnumType;
import com.zzh.personal_hub.social.ContentTargetType;

import lombok.Data;

@Data
@Entity
@Table(name = "content_likes",
       uniqueConstraints = @UniqueConstraint(
           columnNames = {"user_id", "target_type", "target_id"}))
public class ContentLike {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "target_type", nullable = false)
    private ContentTargetType targetType;

    @Column(name = "target_id", nullable = false)
    private Long targetId;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();
}
