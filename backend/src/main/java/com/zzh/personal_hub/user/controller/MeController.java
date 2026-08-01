package com.zzh.personal_hub.user.controller;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import lombok.RequiredArgsConstructor;
import com.zzh.personal_hub.user.service.ProfileService;
import com.zzh.personal_hub.user.dto.ProfileResponse;
import com.zzh.personal_hub.user.dto.ProfileRequest;
import com.zzh.personal_hub.common.response.ApiResponse;


@RestController
@RequestMapping("/api/me")
@RequiredArgsConstructor
public class MeController {

    private final ProfileService profileService;

    @GetMapping("/profile")
    public ApiResponse<ProfileResponse> myProfile() {
        return ApiResponse.success(profileService.getMyProfile());
    }

    @PutMapping("/profile")
    public ApiResponse<ProfileResponse> updateMyProfile(@RequestBody ProfileRequest request) {
        return ApiResponse.success(profileService.updateMyProfile(request));
    }
}