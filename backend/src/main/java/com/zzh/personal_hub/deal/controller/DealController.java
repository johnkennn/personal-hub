package com.zzh.personal_hub.deal.controller;

import com.zzh.personal_hub.common.response.ApiResponse;
import com.zzh.personal_hub.deal.dto.DealResponse;
import com.zzh.personal_hub.deal.service.DealService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/deals")
@RequiredArgsConstructor
public class DealController {

    private final DealService dealService;

    /** 前台：仅进行中（ACTIVE 且在有效期内） */
    @GetMapping
    public ApiResponse<List<DealResponse>> listActive() {
        return ApiResponse.success(dealService.listActive());
    }
}
