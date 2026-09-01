package com.zzh.personal_hub.user.controller;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import lombok.RequiredArgsConstructor;
import com.zzh.personal_hub.blog.service.ArticleService;
import com.zzh.personal_hub.blog.entity.Article;
import com.zzh.personal_hub.common.response.ApiResponse;
import com.zzh.personal_hub.blog.dto.BatchIdsRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/me/articles")
@RequiredArgsConstructor
public class MeArticleController {

    private final ArticleService articleService;

    @GetMapping("/drafts")
    public ApiResponse<List<Article>> drafts() {
        return ApiResponse.success(articleService.listMyDrafts());
    }

    @GetMapping("/published")
    public ApiResponse<List<Article>> published() {
        return ApiResponse.success(articleService.listMyPublished());
    }

    @GetMapping("/{id}")
    public ApiResponse<Article> detail(@PathVariable Long id) {
        return ApiResponse.success(articleService.getMyArticle(id));
    }

    @PostMapping("/batch-publish")
    public ApiResponse<Map<String, Integer>> batchPublish(@Valid @RequestBody BatchIdsRequest req) {
        return ApiResponse.success(Map.of("affected", articleService.batchPublish(req.getIds())));
    }
    // unpublish / delete 同理
    @PostMapping("/batch-unpublish")
    public ApiResponse<Map<String, Integer>> batchUnpublish(@Valid @RequestBody BatchIdsRequest req) {
        return ApiResponse.success(Map.of("affected", articleService.batchUnpublish(req.getIds())));
    }

    @PostMapping("/batch-delete")
    public ApiResponse<Map<String, Integer>> batchDelete(@Valid @RequestBody BatchIdsRequest req) {
        return ApiResponse.success(Map.of("affected", articleService.batchDelete(req.getIds())));
    }

    @PostMapping("/{id}/cover")
    public ApiResponse<Article> uploadCover(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        return ApiResponse.success(articleService.uploadCover(id, file));
    }
}
