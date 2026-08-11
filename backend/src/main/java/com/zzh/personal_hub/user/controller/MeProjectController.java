package com.zzh.personal_hub.user.controller;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import lombok.RequiredArgsConstructor;
import com.zzh.personal_hub.project.service.ProjectService;
import com.zzh.personal_hub.project.entity.Project;
import com.zzh.personal_hub.common.response.ApiResponse;

import java.util.List;
import java.util.Map;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import com.zzh.personal_hub.blog.dto.BatchIdsRequest;

@RestController
@RequestMapping("/api/me/projects")
@RequiredArgsConstructor
public class MeProjectController {
    
    private final ProjectService projectService;

    @GetMapping("/drafts")
    public ApiResponse<List<Project>> drafts() {
        return ApiResponse.success(projectService.listMyDrafts());
    }

    @GetMapping("/published")
    public ApiResponse<List<Project>> published() {
        return ApiResponse.success(projectService.listMyPublished());
    }

    @GetMapping("/{id}")
    public ApiResponse<Project> detail(@PathVariable Long id) {
        return ApiResponse.success(projectService.getMyProject(id));
    }

    @PostMapping("/batch-publish")
    public ApiResponse<Map<String, Integer>> batchPublish(@Valid @RequestBody BatchIdsRequest req) {
        return ApiResponse.success(Map.of("affected", projectService.batchPublish(req.getIds())));
    }
    // unpublish / delete 同理
    @PostMapping("/batch-unpublish")
    public ApiResponse<Map<String, Integer>> batchUnpublish(@Valid @RequestBody BatchIdsRequest req) {
        return ApiResponse.success(Map.of("affected", projectService.batchUnpublish(req.getIds())));
    }

    @PostMapping("/batch-delete")
    public ApiResponse<Map<String, Integer>> batchDelete(@Valid @RequestBody BatchIdsRequest req) {
        return ApiResponse.success(Map.of("affected", projectService.batchDelete(req.getIds())));
    }
}
