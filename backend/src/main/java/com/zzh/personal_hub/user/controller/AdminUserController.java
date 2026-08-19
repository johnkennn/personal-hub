package com.zzh.personal_hub.user.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;

import lombok.RequiredArgsConstructor;

import com.zzh.personal_hub.user.service.AdminUserService;
import com.zzh.personal_hub.user.dto.AdminUserResponse;
import com.zzh.personal_hub.common.response.ApiResponse;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/users")
public class AdminUserController {
    private final AdminUserService adminUserService;

    @GetMapping
    public ApiResponse<List<AdminUserResponse>> list() {
        return ApiResponse.success(adminUserService.listAll());
    }

    @PostMapping("/{id}/disable")
    public ApiResponse<AdminUserResponse> disable(@PathVariable Long id) {
        return ApiResponse.success(adminUserService.disable(id));
    }
    
    @PostMapping("/{id}/enable")
    public ApiResponse<AdminUserResponse> enable(@PathVariable Long id) {
        return ApiResponse.success(adminUserService.enable(id));
    }
}
