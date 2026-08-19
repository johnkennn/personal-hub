package com.zzh.personal_hub.user.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

import com.zzh.personal_hub.user.repository.UserRepository;
import com.zzh.personal_hub.common.security.CurrentUserService;
import com.zzh.personal_hub.user.dto.AdminUserResponse;
import com.zzh.personal_hub.user.entity.UserStatus;
import com.zzh.personal_hub.user.entity.User;
import com.zzh.personal_hub.common.exception.BusinessException;

import java.time.Instant;
import java.util.Objects;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminUserService {
    private final UserRepository userRepository;
    private final CurrentUserService currentUserService;

    public List<AdminUserResponse> listAll() {
        currentUserService.requireAdmin();
        return userRepository.findAllByOrderByCreatedAtDesc()
        .stream()
        .map(this::toResponse)
        .toList();
    }

    @Transactional
    public AdminUserResponse disable(Long id) {
        User me = currentUserService.requireAdmin();
        User target = getUser(id);
        if (Objects.equals(me.getId(), target.getId())) {
            throw new BusinessException(400, "不能禁用自己");
        }
        target.setStatus(UserStatus.DISABLED);
        target.setUpdatedAt(Instant.now());
        userRepository.save(target);
        return toResponse(target);
    }

    @Transactional
    public AdminUserResponse enable(Long id) {
        currentUserService.requireAdmin();
        User target = getUser(id);
        target.setStatus(UserStatus.ACTIVE);
        target.setUpdatedAt(Instant.now());
        userRepository.save(target);
        return toResponse(target);
    }

    private User getUser(Long id) {
        return userRepository.findById(id)
        .orElseThrow(() -> new BusinessException(404, "用户不存在"));
    }

    private AdminUserResponse toResponse(User user) {
        return new AdminUserResponse(
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.getRole(),
            user.getCreatedAt(),
            user.getStatus()
        );
    }
}
