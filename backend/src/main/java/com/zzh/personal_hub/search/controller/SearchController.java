package com.zzh.personal_hub.search.controller;

import com.zzh.personal_hub.common.response.ApiResponse;
import com.zzh.personal_hub.feed.dto.FeedItemDto;
import com.zzh.personal_hub.search.service.SearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {

    private final SearchService searchService;

    /**
     * 例：GET /api/search?q=spring
     * required = false：允许不带 q，Service 里当空结果处理
     */
    @GetMapping
    public ApiResponse<List<FeedItemDto>> search(
            @RequestParam(required = false) String q) {
        return ApiResponse.success(searchService.search(q));
    }
}