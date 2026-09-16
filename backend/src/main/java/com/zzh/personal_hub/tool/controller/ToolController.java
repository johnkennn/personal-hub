package com.zzh.personal_hub.tool.controller;

import com.zzh.personal_hub.article.entity.Article;
import com.zzh.personal_hub.article.service.ArticleService;
import com.zzh.personal_hub.common.response.ApiResponse;
import com.zzh.personal_hub.tool.dto.ToolResponse;
import com.zzh.personal_hub.tool.service.ToolService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/tools")
@RequiredArgsConstructor
public class ToolController {

    private final ToolService toolService;
    private final ArticleService articleService;

    @GetMapping
    public ApiResponse<List<ToolResponse>> list(
            @RequestParam(required = false) String category) {
        return ApiResponse.success(toolService.listPublished(category));
    }

    @GetMapping("/{slug}")
    public ApiResponse<ToolResponse> detail(@PathVariable String slug) {
        return ApiResponse.success(toolService.getPublishedBySlug(slug));
    }

    /** 某 AI 产品下已发布的关联评测 */
    @GetMapping("/{slug}/articles")
    public ApiResponse<List<Article>> relatedArticles(@PathVariable String slug) {
        return ApiResponse.success(articleService.listPublishedByToolSlug(slug));
    }
}
