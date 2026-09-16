package com.zzh.personal_hub.article.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class ArticleUpdateRequest {

    @NotBlank(message = "标题不能为空")
    @Size(max = 200, message = "标题最长 200 字")
    private String title;

    @NotBlank(message = "正文不能为空")
    private String content;

    /** true 发布 / false 下架；必填，避免误保持旧值时说不清 */
    @NotNull(message = "请指定发布状态")
    private Boolean published;

    /** 可选：关联项目 id；传 null 表示清空 */
    private Long relatedProjectId;

    /** 关联的 AI 工具 slug 列表 */
    private List<String> relatedToolSlugs;
}
