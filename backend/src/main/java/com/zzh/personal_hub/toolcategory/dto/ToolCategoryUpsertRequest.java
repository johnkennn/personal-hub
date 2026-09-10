package com.zzh.personal_hub.toolcategory.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ToolCategoryUpsertRequest {
    @NotBlank(message = "分类名称不能为空")
    @Size(max = 64)
    private String name;

    @NotBlank(message = "分类 slug 不能为空")
    @Size(max = 64)
    private String slug;

    @NotNull
    private Integer sortOrder = 0;
}
