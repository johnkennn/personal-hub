package com.zzh.personal_hub.ai.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class ReplaceChatMessagesRequest {
    @NotNull
    private List<Object> messages;
}
