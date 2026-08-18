package com.zzh.personal_hub.suggestion.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AdminSuggestionResponse {
    private Long id;
    private String content;
    private Instant createdAt;
    private String userName;
    private Long userId;
}
