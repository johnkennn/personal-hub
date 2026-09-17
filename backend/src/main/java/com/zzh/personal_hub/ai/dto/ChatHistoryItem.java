package com.zzh.personal_hub.ai.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ChatHistoryItem {
    /** user | assistant */
    @NotBlank(message = "history.role 不能为空")
    @Size(max = 16)
    private String role;

    @NotBlank(message = "history.content 不能为空")
    @Size(max = 4000, message = "单条历史过长")
    private String content;
}
