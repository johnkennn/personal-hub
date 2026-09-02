package com.zzh.personal_hub.auth.controller;

import com.zzh.personal_hub.auth.dto.LoginRequest;
import com.zzh.personal_hub.auth.dto.LoginResponse;
import com.zzh.personal_hub.auth.dto.RegisterRequest;
import com.zzh.personal_hub.auth.service.AuthService;
import com.zzh.personal_hub.common.response.ApiResponse;
import com.zzh.personal_hub.common.ratelimit.InMemoryRateLimiter;
import com.zzh.personal_hub.common.exception.BusinessException;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private static final long WINDOW_MS = 60_000L;
    private final AuthService authService;
    private final InMemoryRateLimiter rateLimiter;

    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(@Valid @RequestBody LoginRequest request, HttpServletRequest httpRequest) {
        String key = "login:" + clientIp(httpRequest);
        if (!rateLimiter.tryAcquire(key, 10, WINDOW_MS)) {
            throw new BusinessException(429, "请求过于频繁，请稍后再试");
        }
        return ApiResponse.success(authService.login(request));
    }

    @PostMapping("/register")
    public ApiResponse<LoginResponse> register(@Valid @RequestBody RegisterRequest request, HttpServletRequest httpRequest) {
        String key = "register:" + clientIp(httpRequest);
        if (!rateLimiter.tryAcquire(key, 5, WINDOW_MS)) {
            throw new BusinessException(429, "请求过于频繁，请稍后再试");
        }
        return ApiResponse.success(authService.register(request));
    }

    private String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            // 经代理时：取第一个（客户端）IP
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}