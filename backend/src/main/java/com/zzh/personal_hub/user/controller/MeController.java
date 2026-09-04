package com.zzh.personal_hub.user.controller;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.multipart.MultipartFile;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import com.zzh.personal_hub.user.service.ProfileService;
import com.zzh.personal_hub.user.dto.ProfileResponse;
import com.zzh.personal_hub.user.dto.ProfileRequest;
import com.zzh.personal_hub.common.response.ApiResponse;
import com.zzh.personal_hub.auth.dto.ChangePasswordRequest;
import com.zzh.personal_hub.auth.service.AuthService;


@RestController
@RequestMapping("/api/me")
@RequiredArgsConstructor
public class MeController {

    private final ProfileService profileService;
    private final AuthService authService;
    @GetMapping("/profile")
    public ApiResponse<ProfileResponse> myProfile() {
        return ApiResponse.success(profileService.getMyProfile());
    }

    @PutMapping("/profile")
    public ApiResponse<ProfileResponse> updateMyProfile(@RequestBody ProfileRequest request) {
        return ApiResponse.success(profileService.updateMyProfile(request));
    }

    @PostMapping("/avatar")
    public ApiResponse<ProfileResponse> uploadAvatar(@RequestParam("file") MultipartFile file) {
        return ApiResponse.success(profileService.uploadAvatar(file));
    }

    @PostMapping("/password")
    public ApiResponse<Void> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(request);
        return ApiResponse.success(null);
    }
}