package com.zzh.personal_hub.suggestion.dto;

import java.time.Instant;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SuggestionResponse {
    private Long id;
    private String content;
    private Instant createdAt;
}
