package com.zzh.personal_hub.ai.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateChatConversationRequest {
    @Size(max = 80)
    private String title;
}
