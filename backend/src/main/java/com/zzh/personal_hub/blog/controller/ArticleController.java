package com.zzh.personal_hub.blog.controller;

import com.zzh.personal_hub.blog.entity.Article;
import com.zzh.personal_hub.blog.service.ArticleService;
import com.zzh.personal_hub.common.response.ApiResponse;
import com.zzh.personal_hub.blog.dto.ArticleCreateRequest;
import com.zzh.personal_hub.social.dto.LikeSummaryDto;
import com.zzh.personal_hub.social.ContentTargetType;
import com.zzh.personal_hub.social.service.LikeService;
import com.zzh.personal_hub.social.service.CommentService;
import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import com.zzh.personal_hub.blog.dto.ArticleUpdateRequest;
import com.zzh.personal_hub.social.dto.CommentResponse;
import com.zzh.personal_hub.social.dto.CommentCreateRequest;
import jakarta.validation.Valid;

import java.util.List;


@RestController
@RequestMapping("/api/articles")
@RequiredArgsConstructor
public class ArticleController {

    private final ArticleService articleService;
    private final LikeService likeService;
    private final CommentService commentService;

    @GetMapping
    public ApiResponse<List<Article>> list() {
        return ApiResponse.success(articleService.listPublished());
    }

    @GetMapping("/manage")
    public ApiResponse<List<Article>> listAll() {
        return ApiResponse.success(articleService.listAll());
    }

    @GetMapping("/{id}")
    public ApiResponse<Article> detail(@PathVariable Long id) {
        return ApiResponse.success(articleService.getPublishedById(id));
    }

    @GetMapping("/{id}/manage")
    public ApiResponse<Article> manageDetail(@PathVariable Long id) {
        return ApiResponse.success(articleService.getMyArticle(id));
    }

    @PostMapping
    public ApiResponse<Article> create(@Valid @RequestBody ArticleCreateRequest request) {
        return ApiResponse.success(articleService.createArticle(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<Article> update(
            @PathVariable Long id,
            @Valid @RequestBody ArticleUpdateRequest request) {
        return ApiResponse.success(articleService.updateArticle(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        articleService.deleteArticle(id);
        return ApiResponse.success(null);
    }

    @PostMapping("/{id}/like")
    public ApiResponse<LikeSummaryDto> like(@PathVariable Long id) {
        return ApiResponse.success(likeService.like(ContentTargetType.ARTICLE, id));
    }

    @GetMapping("/{id}/like")
    public ApiResponse<LikeSummaryDto> likeSummary(@PathVariable Long id) {
        return ApiResponse.success(likeService.summary(ContentTargetType.ARTICLE, id));
    }

    @DeleteMapping("/{id}/like")
    public ApiResponse<LikeSummaryDto> deleteLike(@PathVariable Long id) {
        return ApiResponse.success(likeService.unlike(ContentTargetType.ARTICLE, id));
    }

    @GetMapping("/{id}/comments")
    public ApiResponse<List<CommentResponse>> listComments(@PathVariable Long id) {
        return ApiResponse.success(commentService.list(ContentTargetType.ARTICLE, id));
    }

    @PostMapping("/{id}/comments")
    public ApiResponse<CommentResponse> createComment(@PathVariable Long id, @Valid @RequestBody CommentCreateRequest request) {
        return ApiResponse.success(commentService.create(ContentTargetType.ARTICLE, id, request.getBody()));
    }
}