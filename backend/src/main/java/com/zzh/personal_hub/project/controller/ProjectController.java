package com.zzh.personal_hub.project.controller;

import com.zzh.personal_hub.common.response.ApiResponse;
import com.zzh.personal_hub.project.entity.Project;
import com.zzh.personal_hub.project.service.ProjectService;
import com.zzh.personal_hub.project.dto.ProjectCreateRequest;
import com.zzh.personal_hub.project.dto.ProjectUpdateRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
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

    @GetMapping("/{id}/manage")
    public ApiResponse<Project> manageDetail(@PathVariable Long id) {
        return ApiResponse.success(projectService.getById(id));
    }

    @PostMapping
    public ApiResponse<Project> create(@Valid @RequestBody ProjectCreateRequest request) {
        return ApiResponse.success(projectService.create(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<Project> update(
            @PathVariable Long id,
            @Valid @RequestBody ProjectUpdateRequest request) {
        return ApiResponse.success(projectService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        projectService.delete(id);
        return ApiResponse.success(null);
    }
}