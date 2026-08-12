package com.zzh.personal_hub.social.entity;

import lombok.Data;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Column;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import java.time.Instant;
import com.zzh.personal_hub.social.ContentTargetType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.EnumType;

@Data
@Entity
@Table(name = "comments")
public class Comment {
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

    @Column(name = "body", nullable = false, columnDefinition = "TEXT")
    private String body; // body (TEXT, not null)

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = true)
    private Instant updatedAt = Instant.now();

    @Column(name = "deleted_at", nullable = true)
    private Instant deletedAt;
}
