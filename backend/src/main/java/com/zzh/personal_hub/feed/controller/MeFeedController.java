package com.zzh.personal_hub.feed.controller;

import com.zzh.personal_hub.common.response.ApiResponse;
import com.zzh.personal_hub.feed.dto.FeedItemDto;
import com.zzh.personal_hub.feed.service.FeedService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/me/feed")
@RequiredArgsConstructor
public class MeFeedController {

    private final FeedService feedService;

    @GetMapping("/following")
    public ApiResponse<List<FeedItemDto>> following() {
        return ApiResponse.success(feedService.listFollowingFeed());
    }
}