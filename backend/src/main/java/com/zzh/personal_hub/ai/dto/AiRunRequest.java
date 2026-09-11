package com.zzh.personal_hub.ai.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AiRunRequest {
    @NotBlank(message = "请输入内容")
    @Size(max = 4000, message = "内容过长")
    private String prompt;
}
