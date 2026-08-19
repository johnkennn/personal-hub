package com.zzh.personal_hub.project.controller;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;

import lombok.RequiredArgsConstructor;

import com.zzh.personal_hub.common.response.ApiResponse;
import com.zzh.personal_hub.project.service.ProjectService;
import com.zzh.personal_hub.project.entity.Project;

import java.util.List;

@RestController
@RequestMapping("/api/admin/projects")
@RequiredArgsConstructor
public class AdminProjectController {
    private final ProjectService projectService;

    @GetMapping
    public ApiResponse<List<Project>> listAll() {
        return ApiResponse.success(projectService.listAllForAdmin());
    }

    @PostMapping("/{id}/unpublish")
    public ApiResponse<Project> unpublish(@PathVariable Long id) {
        return ApiResponse.success(projectService.unpublishByAdmin(id));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        projectService.deleteByAdmin(id);
        return ApiResponse.success(null);
    }
}
