package com.zzh.personal_hub.suggestion.service;

import com.zzh.personal_hub.suggestion.repository.SuggestionRepository;
import com.zzh.personal_hub.suggestion.dto.SuggestionResponse;
import com.zzh.personal_hub.user.entity.User;
import com.zzh.personal_hub.common.exception.BusinessException;
import com.zzh.personal_hub.suggestion.entity.Suggestion;
import com.zzh.personal_hub.suggestion.dto.AdminSuggestionResponse;
import com.zzh.personal_hub.common.security.CurrentUserService;
import org.springframework.stereotype.Service;
import com.zzh.personal_hub.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.time.Instant;

import jakarta.transaction.Transactional;


@Service
@RequiredArgsConstructor
public class SuggestionService {
    
    private final SuggestionRepository suggestionRepository;
    private final UserRepository userRepository;
    private final CurrentUserService currentUserService;

    public List<SuggestionResponse> listMine() {
        User me = currentUserService.requireUser();
        return suggestionRepository.findByUserIdOrderByCreatedAtDesc(me.getId()).stream()
            .map(this::toResponse)
            .toList();
    }

    @Transactional
    public SuggestionResponse create(String content) {
        Suggestion row = new Suggestion();
        row.setUserId(currentUserService.requireUser().getId());
        row.setContent(content.trim());
        row.setCreatedAt(Instant.now());
        suggestionRepository.save(row);
        return toResponse(row);
    }

    @Transactional
    public void delete(Long id) {
        Suggestion row = suggestionRepository.findById(id)
        .orElseThrow(() -> new BusinessException(404, "建议不存在"));
        currentUserService.assertOwner(row.getUserId(), "无权限删除该建议");
        suggestionRepository.delete(row);
    }

    public List<AdminSuggestionResponse> listAllForAdmin() {
        currentUserService.requireAdmin();
        return suggestionRepository.findAllByOrderByCreatedAtDesc().stream()
            .map(this::toAdminResponse)
            .toList();
    }

    @Transactional
    public void deleteByAdmin(Long id) {
        currentUserService.requireAdmin();
        Suggestion row = suggestionRepository.findById(id)
        .orElseThrow(() -> new BusinessException(404, "建议不存在"));
        suggestionRepository.delete(row);
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
