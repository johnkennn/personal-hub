package com.zzh.personal_hub.suggestion.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SuggestionCreateRequest {
    @NotBlank(message = "建议内容不能为空")
    @Size(max = 2000,message = "建议最长2000字")
    private String content;
}
