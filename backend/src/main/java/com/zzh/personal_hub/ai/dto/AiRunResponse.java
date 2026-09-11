package com.zzh.personal_hub.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AiRunResponse {
    private String text;
    private int remainingQuota;
    private int dailyQuota;
}
