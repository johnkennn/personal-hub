package com.zzh.personal_hub.tool.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ToolUpsertRequest {
    @NotBlank(message = "slug 不能为空")
    @Size(max = 64)
    private String slug;

    @NotBlank(message = "名称不能为空")
    @Size(max = 120)
    private String name;

    @NotNull(message = "请选择分类")
    private Long categoryId;

    @NotBlank(message = "摘要不能为空")
    @Size(max = 500)
    private String summary;

    @NotBlank(message = "介绍不能为空")
    private String intro;

    @Size(max = 500)
    private String audience;

    @NotBlank(message = "定价说明不能为空")
    @Size(max = 120)
    private String pricing;

    @NotBlank(message = "官网地址不能为空")
    @Size(max = 500)
    private String websiteUrl;

    @Size(max = 500)
    private String affiliateUrl;

    /** JSON 数组字符串，如 ["豆包","字节"] */
    private String keywordsJson;
    private String tagsJson;
    private String useCasesJson;
    private String prosJson;
    private String consJson;

    private Boolean featured = false;
    private Integer weight = 0;
    private Boolean published = false;
}
