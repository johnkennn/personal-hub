package com.zzh.personal_hub.project.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ProjectCreateRequest {

    @NotBlank(message = "项目名称不能为空")
    @Size(max = 200, message = "项目名称最长 200 字")
    private String name;

    @NotBlank(message = "项目描述不能为空")
    private String description;

    @Size(max = 500, message = "技术栈最长 500 字")
    private String techStack;

    @Size(max = 500, message = "仓库地址最长 500 字")
    private String repoUrl;

    @Size(max = 500, message = "演示地址最长 500 字")
    private String demoUrl;

    private Boolean published;
}