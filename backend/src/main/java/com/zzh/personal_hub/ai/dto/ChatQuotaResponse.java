package com.zzh.personal_hub.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ChatQuotaResponse {
    private int remainingQuota;
    private int dailyQuota;
    private boolean quotaEnabled;
}