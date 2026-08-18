package com.zzh.personal_hub.suggestion.service;

import com.zzh.personal_hub.suggestion.repository.SuggestionRepository;
import com.zzh.personal_hub.user.repository.UserRepository;
import com.zzh.personal_hub.suggestion.dto.SuggestionResponse;
import com.zzh.personal_hub.user.entity.User;
import com.zzh.personal_hub.common.exception.BusinessException;
import com.zzh.personal_hub.suggestion.entity.Suggestion;
import com.zzh.personal_hub.suggestion.dto.AdminSuggestionResponse;
import com.zzh.personal_hub.user.entity.UserRole;

import org.springframework.stereotype.Service;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import lombok.RequiredArgsConstructor;

import java.util.List;
import java.time.Instant;
import java.util.Objects;

import jakarta.transaction.Transactional;


@Service
@RequiredArgsConstructor
public class SuggestionService {
    
    private final SuggestionRepository suggestionRepository;
    private final UserRepository userRepository;

    public List<SuggestionResponse> listMine() {
        User me = currentUser();
        return suggestionRepository.findByUserIdOrderByCreatedAtDesc(me.getId()).stream()
            .map(this::toResponse)
            .toList();
    }

    @Transactional
    public SuggestionResponse create(String content) {
        User me = currentUser();
        Suggestion row = new Suggestion();
        row.setUserId(me.getId());
        row.setContent(content.trim());
        row.setCreatedAt(Instant.now());
        suggestionRepository.save(row);
        return toResponse(row);
    }

    @Transactional
    public void delete(Long id) {
        User me = currentUser();
        Suggestion row = suggestionRepository.findById(id)
        .orElseThrow(() -> new BusinessException(404, "建议不存在"));
        if(!Objects.equals(row.getUserId(), me.getId())){
            throw new BusinessException(403, "无权限删除该建议");
        }
        suggestionRepository.delete(row);
    }

    public List<AdminSuggestionResponse> listAllForAdmin() {
        User me = currentUser();
        assertAdmin(me);
        return suggestionRepository.findAllByOrderByCreatedAtDesc().stream()
            .map(this::toAdminResponse)
            .toList();
    }

    @Transactional
    public void deleteByAdmin(Long id) {
        User me = currentUser();
        assertAdmin(me);
        Suggestion row = suggestionRepository.findById(id)
        .orElseThrow(() -> new BusinessException(404, "建议不存在"));
        suggestionRepository.delete(row);
    }

    private void assertAdmin(User me) {
        if (!UserRole.ADMIN.equals(me.getRole())) {
            throw new BusinessException(403, "需要管理员权限");
        }
    }

    private User currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getName() == null || "anonymousUser".equals(auth.getName())) {
            throw new BusinessException(401,"未登录或登录已失效");
        }
        return userRepository.findByUsername(auth.getName())
            .orElseThrow(() -> new BusinessException(401,"用户不存在"));
    }

    private SuggestionResponse toResponse(Suggestion s){
        return new SuggestionResponse(s.getId(), s.getContent(),s.getCreatedAt());
    }

    private AdminSuggestionResponse toAdminResponse(Suggestion s){
        String userName = userRepository.findById(s.getUserId())
        .map(User::getUsername)
        .orElse("unknown");
        return new AdminSuggestionResponse(
            s.getId(), 
            s.getContent(),
            s.getCreatedAt(), 
            userName, 
            s.getUserId());
    }
}
