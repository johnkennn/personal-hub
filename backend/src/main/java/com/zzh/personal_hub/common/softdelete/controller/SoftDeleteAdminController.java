package com.zzh.personal_hub.common.softdelete.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.zzh.personal_hub.common.response.ApiResponse;
import com.zzh.personal_hub.common.softdelete.SoftDeleteAdminService;
import com.zzh.personal_hub.common.softdelete.dto.AdminDeletedContentDto;
import com.zzh.personal_hub.project.entity.ProjectMedia;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class SoftDeleteAdminController {

    private final SoftDeleteAdminService softDeleteAdminService;

    @GetMapping("/articles/deleted")
    public ApiResponse<List<AdminDeletedContentDto>> listDeletedArticles() {
        return ApiResponse.success(softDeleteAdminService.listDeletedArticles());
    }

    @GetMapping("/articles/deleted/{id}")
    public ApiResponse<AdminDeletedContentDto> getDeletedArticle(@PathVariable Long id) {
        return ApiResponse.success(softDeleteAdminService.getDeletedArticle(id));
    }

    @PostMapping("/articles/deleted/{id}/restore")
    public ApiResponse<AdminDeletedContentDto> restoreArticle(@PathVariable Long id) {
        return ApiResponse.success(softDeleteAdminService.restoreArticle(id));
    }

    @PostMapping("/articles/deleted/{id}/purge")
    public ApiResponse<Void> purgeArticle(@PathVariable Long id) {
        softDeleteAdminService.purgeArticle(id);
        return ApiResponse.success(null);
    }

    @GetMapping("/projects/deleted")
    public ApiResponse<List<AdminDeletedContentDto>> listDeletedProjects() {
        return ApiResponse.success(softDeleteAdminService.listDeletedProjects());
    }

    @GetMapping("/projects/deleted/{id}")
    public ApiResponse<AdminDeletedContentDto> getDeletedProject(@PathVariable Long id) {
        return ApiResponse.success(softDeleteAdminService.getDeletedProject(id));
    }

    @GetMapping("/projects/deleted/{id}/media")
    public ApiResponse<List<ProjectMedia>> listDeletedProjectMedia(@PathVariable Long id) {
        return ApiResponse.success(softDeleteAdminService.listDeletedProjectMedia(id));
    }

    @PostMapping("/projects/deleted/{id}/restore")
    public ApiResponse<AdminDeletedContentDto> restoreProject(@PathVariable Long id) {
        return ApiResponse.success(softDeleteAdminService.restoreProject(id));
    }

    @PostMapping("/projects/deleted/{id}/purge")
    public ApiResponse<Void> purgeProject(@PathVariable Long id) {
        softDeleteAdminService.purgeProject(id);
        return ApiResponse.success(null);
    }
}
