package com.zzh.personal_hub.user.service;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

import com.zzh.personal_hub.user.dto.ProfileRequest;
import com.zzh.personal_hub.user.dto.ProfileResponse;
import com.zzh.personal_hub.user.entity.User;
import com.zzh.personal_hub.user.entity.UserProfile;
import com.zzh.personal_hub.user.repository.UserRepository;
import com.zzh.personal_hub.user.repository.UserProfileRepository;
import com.zzh.personal_hub.common.exception.BusinessException;

@Service
@RequiredArgsConstructor
public class ProfileService {
    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;

    @Transactional(readOnly = true)
    public ProfileResponse getMyProfile() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new BusinessException(401, "未登录或用户不存在"));
        UserProfile profile = userProfileRepository.findById(user.getId())
            .orElseThrow(() -> new BusinessException(404, "资料不存在"));
        return new ProfileResponse(
            user.getId(),
            user.getUsername(),
            profile.getNickname(),
            profile.getBio(),
            profile.getAvatarUrl(),
            profile.getLinksJson()
        );
    }

    @Transactional
    public ProfileResponse updateMyProfile(ProfileRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new BusinessException(401, "未登录或用户不存在"));
        UserProfile profile = userProfileRepository.findById(user.getId())
            .orElseThrow(() -> new BusinessException(404, "资料不存在"));
        if (request.getNickname() != null) {
            profile.setNickname(request.getNickname());
        }
        if (request.getBio() != null) {
            profile.setBio(request.getBio());
        }
        if (request.getAvatarUrl() != null) {
            profile.setAvatarUrl(request.getAvatarUrl());
        }
        if (request.getLinksJson() != null) {
            profile.setLinksJson(request.getLinksJson());
        }
        userProfileRepository.save(profile);
        return new ProfileResponse(
            user.getId(),
            user.getUsername(),
            profile.getNickname(),
            profile.getBio(),
            profile.getAvatarUrl(),
            profile.getLinksJson()
        );
    }
}
