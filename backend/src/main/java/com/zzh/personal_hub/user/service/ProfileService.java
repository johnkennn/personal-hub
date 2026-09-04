package com.zzh.personal_hub.user.service;

import com.zzh.personal_hub.common.exception.BusinessException;
import com.zzh.personal_hub.user.dto.ProfileRequest;
import com.zzh.personal_hub.user.dto.ProfileResponse;
import com.zzh.personal_hub.user.entity.User;
import com.zzh.personal_hub.user.entity.UserProfile;
import com.zzh.personal_hub.user.repository.UserProfileRepository;
import com.zzh.personal_hub.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.zzh.personal_hub.common.security.CurrentUserService;
import com.zzh.personal_hub.media.MediaStorageService;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final UserRepository userRepository;
    private final CurrentUserService currentUserService;
    private final UserProfileRepository userProfileRepository;
    private final FollowService followService;
    private final MediaStorageService mediaStorageService;

    @Transactional(readOnly = true)
    public ProfileResponse getMyProfile() {
        User user = currentUserService.requireUser();
        UserProfile profile = requireProfile(user.getId());
        return toResponse(user, profile, true);
    }

    @Transactional
    public ProfileResponse uploadAvatar(MultipartFile file) {
        User user = currentUserService.requireUser();
        UserProfile profile = requireProfile(user.getId());
        String url = mediaStorageService.saveImage(file, "avatars/" + user.getId());
        profile.setAvatarUrl(url);
        userProfileRepository.save(profile);
        return toResponse(user, profile, true);
    }

    @Transactional
    public ProfileResponse updateMyProfile(ProfileRequest request) {
        User user = currentUserService.requireUser();
        UserProfile profile = requireProfile(user.getId());
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
        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new BusinessException(400, "邮箱已被占用");
            }
            user.setEmail(request.getEmail());
        }
        if (request.getPhone() != null && !request.getPhone().equals(user.getPhone())) {
            if (userRepository.existsByPhone(request.getPhone())) {
                throw new BusinessException(400, "手机号已被占用");
            }
            user.setPhone(request.getPhone());
        }
        userProfileRepository.save(profile);
        userRepository.save(user);
        return toResponse(user, profile, true);
    }

    @Transactional(readOnly = true)
    public ProfileResponse getPublicProfile(Long userId) {
        User user = userRepository
                .findById(userId)
                .orElseThrow(() -> new BusinessException(404, "用户不存在"));
        UserProfile profile = requireProfile(userId);
        return toResponse(user, profile, false);
    }

    private ProfileResponse toResponse(User user, UserProfile profile, boolean includePhone) {
        long followerCount = followService.getFollowerCount(user.getId());
        long followingCount = followService.getFollowingCount(user.getId());
        boolean following = followService.isFollowedByCurrentUser(user.getId());
        return new ProfileResponse(
                user.getId(),
                user.getUsername(),
                profile.getNickname(),
                profile.getBio(),
                profile.getAvatarUrl(),
                profile.getLinksJson(),
                followerCount,
                followingCount,
                following,
                includePhone ? user.getPhone() : null,
                user.getEmail());
    }

    private UserProfile requireProfile(Long userId) {
        return userProfileRepository
                .findById(userId)
                .orElseThrow(() -> new BusinessException(404, "资料不存在"));
    }
}
