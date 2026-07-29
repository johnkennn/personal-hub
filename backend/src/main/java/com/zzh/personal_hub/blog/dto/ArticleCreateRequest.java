package com.zzh.personal_hub.blog.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import lombok.Data;

@Data
public class ArticleCreateRequest {

    @NotBlank(message = "标题不能为空")
    @Size(max = 200, message = "标题最长 200 字")
    private String title;

    @NotBlank(message = "正文不能为空")
    private String content;

    /** 是否直接发布；不传时按 false（草稿）处理 */
    private Boolean published;
}