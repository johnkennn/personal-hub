package com.zzh.personal_hub.suggestion.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.Data;

@Data
@Entity
@Table(name = "suggestion")
public class Suggestion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "content",nullable = false,columnDefinition = "text")
    private String content;

    @Column(name = "user_id",nullable = false)
    private Long userId;

    @Column(name = "created_at",nullable = false,updatable = false)
    private Instant createdAt = Instant.now();
    
}
