package com.zzh.personal_hub.project.controller;

import com.zzh.personal_hub.common.response.ApiResponse;
import com.zzh.personal_hub.project.entity.Project;
import com.zzh.personal_hub.project.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @GetMapping
    public ApiResponse<List<Project>> list() {
        return ApiResponse.success(projectService.listPublished());
    }

    @GetMapping("/{id}")
    public ApiResponse<Project> get(@PathVariable Long id) {
        return ApiResponse.success(projectService.getPublishedById(id));
    }
}