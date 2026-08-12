package com.zzh.personal_hub.project.controller;

import com.zzh.personal_hub.common.response.ApiResponse;
import com.zzh.personal_hub.project.entity.Project;
import com.zzh.personal_hub.project.service.ProjectService;
import com.zzh.personal_hub.project.dto.ProjectCreateRequest;
import com.zzh.personal_hub.project.dto.ProjectUpdateRequest;
import com.zzh.personal_hub.social.dto.LikeSummaryDto;
import com.zzh.personal_hub.social.ContentTargetType;
import com.zzh.personal_hub.social.service.LikeService;
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

import com.zzh.personal_hub.social.dto.CommentCreateRequest;
import com.zzh.personal_hub.social.dto.CommentResponse;
import com.zzh.personal_hub.social.service.CommentService;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;
    private final LikeService likeService;
    private final CommentService commentService;
    @GetMapping
    public ApiResponse<List<Project>> list() {
        return ApiResponse.success(projectService.listPublished());
    }

    @GetMapping("/manage")
    public ApiResponse<List<Project>> listAll() {
        return ApiResponse.success(projectService.listAll());
    }

    @GetMapping("/{id}")
    public ApiResponse<Project> get(@PathVariable Long id) {
        return ApiResponse.success(projectService.getPublishedById(id));
    }

    @GetMapping("/{id}/manage")
    public ApiResponse<Project> manageDetail(@PathVariable Long id) {
        return ApiResponse.success(projectService.getMyProject(id));
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

    @PostMapping("/{id}/like")
    public ApiResponse<LikeSummaryDto> like(@PathVariable Long id) {
        return ApiResponse.success(likeService.like(ContentTargetType.PROJECT, id));
    }

    @GetMapping("/{id}/like")
    public ApiResponse<LikeSummaryDto> likeSummary(@PathVariable Long id) {
        return ApiResponse.success(likeService.summary(ContentTargetType.PROJECT, id));
    }

    @DeleteMapping("/{id}/like")
    public ApiResponse<LikeSummaryDto> deleteLike(@PathVariable Long id) {
        return ApiResponse.success(likeService.unlike(ContentTargetType.PROJECT, id));
    }

    @GetMapping("/{id}/comments")
    public ApiResponse<List<CommentResponse>> listComments(@PathVariable Long id) {
        return ApiResponse.success(commentService.list(ContentTargetType.PROJECT, id));
    }
    @PostMapping("/{id}/comments")
    public ApiResponse<CommentResponse> createComment(
            @PathVariable Long id,
            @Valid @RequestBody CommentCreateRequest request) {
        return ApiResponse.success(
                commentService.create(ContentTargetType.PROJECT, id, request.getBody()));
    }
}