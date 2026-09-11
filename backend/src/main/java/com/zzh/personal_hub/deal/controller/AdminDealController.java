package com.zzh.personal_hub.deal.controller;

import com.zzh.personal_hub.common.response.ApiResponse;
import com.zzh.personal_hub.deal.dto.DealResponse;
import com.zzh.personal_hub.deal.dto.DealUpsertRequest;
import com.zzh.personal_hub.deal.service.DealService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/deals")
@RequiredArgsConstructor
public class AdminDealController {

    private final DealService dealService;

    @GetMapping
    public ApiResponse<List<DealResponse>> list() {
        return ApiResponse.success(dealService.listForAdmin());
    }

    @PostMapping
    public ApiResponse<DealResponse> create(@Valid @RequestBody DealUpsertRequest request) {
        return ApiResponse.success(dealService.create(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<DealResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody DealUpsertRequest request) {
        return ApiResponse.success(dealService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        dealService.softDelete(id);
        return ApiResponse.success(null);
    }
}
