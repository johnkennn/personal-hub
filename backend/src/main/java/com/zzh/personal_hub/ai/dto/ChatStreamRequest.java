package com.zzh.personal_hub.ai.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ChatStreamRequest {
    /** 内部技能：copywriting / translate / resume 等 */
    @NotBlank(message = "请指定意图")
    @Size(max = 64)
    private String intent;

    @NotBlank(message = "请输入内容")
    @Size(max = 4000, message = "内容过长")
    private String message;
}