package com.zzh.personal_hub.user.controller;

import com.zzh.personal_hub.common.response.ApiResponse;
import com.zzh.personal_hub.user.dto.AdminStatsResponse;
import com.zzh.personal_hub.user.service.AdminStatsService;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/stats")
@RequiredArgsConstructor
public class AdminStatsController {
    private final AdminStatsService adminStatsService;

    @GetMapping
    public ApiResponse<AdminStatsResponse> overview() {
        return ApiResponse.success(adminStatsService.overview());
    }
}
