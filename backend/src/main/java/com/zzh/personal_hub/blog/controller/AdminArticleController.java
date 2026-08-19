package com.zzh.personal_hub.blog.controller;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;

import lombok.RequiredArgsConstructor;
import com.zzh.personal_hub.blog.service.ArticleService;
import com.zzh.personal_hub.blog.entity.Article;
import com.zzh.personal_hub.common.response.ApiResponse;

import java.util.List;

@RestController
@RequestMapping("/api/admin/articles")
@RequiredArgsConstructor
public class AdminArticleController {
    private final ArticleService articleService;

    @GetMapping
    public ApiResponse<List<Article>> list() {
        return ApiResponse.success(articleService.listAllForAdmin());
    }

    @PostMapping("/{id}/unpublish")
    public ApiResponse<Article> unpublish(@PathVariable Long id) {
        return ApiResponse.success(articleService.unpublishByAdmin(id));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        articleService.deleteByAdmin(id);
        return ApiResponse.success(null);
    }
}
