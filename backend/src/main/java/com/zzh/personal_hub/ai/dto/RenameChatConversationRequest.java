package com.zzh.personal_hub.ai.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RenameChatConversationRequest {
    @NotBlank
    @Size(max = 80)
    private String title;
}
