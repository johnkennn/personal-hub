package com.zzh.personal_hub.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatConversationSummaryDto {
    private Long id;
    private String title;
    /** epoch millis */
    private long createdAt;
    /** epoch millis */
    private long updatedAt;
    private int messageCount;
}
