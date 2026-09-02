package com.zzh.personal_hub.social.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.time.Instant;
import com.zzh.personal_hub.social.ContentTargetType;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CommentResponse {
    private Long id;
    private String body;
    private Instant createdAt;
    private Instant updatedAt;
    private Long userId;
    private String username; // 可选：展示用，不要 password
    private ContentTargetType targetType; // 新增
    private Long targetId;                // 新增    
}
