package com.zzh.personal_hub.blog.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ArticleUpdateRequest {

    @NotBlank(message = "标题不能为空")
    @Size(max = 200, message = "标题最长 200 字")
    private String title;

    @NotBlank(message = "正文不能为空")
    private String content;

    /** true 发布 / false 下架；必填，避免误保持旧值时说不清 */
    @jakarta.validation.constraints.NotNull(message = "请指定发布状态")
    private Boolean published;
}