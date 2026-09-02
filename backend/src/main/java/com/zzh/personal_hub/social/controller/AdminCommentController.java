package com.zzh.personal_hub.social.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import com.zzh.personal_hub.common.response.ApiResponse;
import com.zzh.personal_hub.social.dto.CommentResponse;
import com.zzh.personal_hub.social.service.CommentService;

import java.util.List;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/comments")
@RequiredArgsConstructor
public class AdminCommentController {

    private final CommentService commentService;

    @GetMapping
    public ApiResponse<List<CommentResponse>> list() {
        return ApiResponse.success(commentService.listAllForAdmin());
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        commentService.deleteByAdmin(id);
        return ApiResponse.success(null);
    }
}
