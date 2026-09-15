package com.zzh.personal_hub.ai.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ChatRouteRequest {
    @NotBlank
    private String message;
}