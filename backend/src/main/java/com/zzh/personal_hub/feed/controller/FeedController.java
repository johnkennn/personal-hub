package com.zzh.personal_hub.feed.controller;

import com.zzh.personal_hub.common.response.ApiResponse;
import com.zzh.personal_hub.feed.dto.FeedItemDto;
import com.zzh.personal_hub.feed.service.FeedService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/feed")
@RequiredArgsConstructor
public class FeedController {

    private final FeedService feedService;

    /**
     * 例：GET /api/feed/latest
     *     GET /api/feed/latest?limit=20
     */
    @GetMapping("/latest")
    public ApiResponse<List<FeedItemDto>> latest(
            @RequestParam(required = false, defaultValue = "50") int limit) {
        return ApiResponse.success(feedService.listLatest(limit));
    }

    /**
     * 例：GET /api/feed/hot
     *     GET /api/feed/hot?limit=20
     */
    @GetMapping("/hot")
    public ApiResponse<List<FeedItemDto>> hot(
            @RequestParam(required = false, defaultValue = "50") int limit) {
        return ApiResponse.success(feedService.listHot(limit));
    }
}