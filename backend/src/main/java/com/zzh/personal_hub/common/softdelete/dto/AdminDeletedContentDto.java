package com.zzh.personal_hub.common.softdelete.dto;

import java.time.Instant;

import lombok.Data;
import lombok.NoArgsConstructor;

/** 治理后台 · 已删内容列表/详情 */
@Data
@NoArgsConstructor
public class AdminDeletedContentDto {
    private Long id;
    /** 文章标题或项目名 */
    private String title;
    private Long authorId;
    private String authorName;
    private Instant deletedAt;
    /** 到期彻底删除时间 */
    private Instant purgeAt;
    private int retainDays;
    private Boolean published;
    private String coverUrl;
    /** 详情用：正文或项目描述 */
    private String body;
    private Instant createdAt;
    private Instant updatedAt;
    private Long relatedProjectId;
    private String techStack;
    private String repoUrl;
    private String demoUrl;
}
