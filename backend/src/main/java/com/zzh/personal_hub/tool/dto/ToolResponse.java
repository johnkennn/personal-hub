package com.zzh.personal_hub.tool.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ToolResponse {
    private Long id;
    private String slug;
    private String name;
    private Long categoryId;
    private String categoryName;
    private String categorySlug;
    private String summary;
    private String intro;
    private String audience;
    private String pricing;
    private String websiteUrl;
    private String affiliateUrl;
    private String keywordsJson;
    private String tagsJson;
    private String useCasesJson;
    private String prosJson;
    private String consJson;
    private Boolean featured;
    private Integer weight;
    private Boolean published;
    private Instant createdAt;
    private Instant updatedAt;
}
