package com.zzh.personal_hub.user.service;

import com.zzh.personal_hub.common.security.CurrentUserService;
import com.zzh.personal_hub.project.repository.ProjectRepository;
import com.zzh.personal_hub.social.repository.CommentRepository;

import org.springframework.stereotype.Service;

import com.zzh.personal_hub.article.repository.ArticleRepository;
import com.zzh.personal_hub.suggestion.repository.SuggestionRepository;
import com.zzh.personal_hub.user.repository.UserRepository;
import com.zzh.personal_hub.user.entity.UserStatus;
import com.zzh.personal_hub.user.dto.AdminStatsResponse;

import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminStatsService {

    private final CurrentUserService currentUserService;
    private final UserRepository userRepository;
    private final ArticleRepository articleRepository;
    private final ProjectRepository projectRepository;
    private final CommentRepository commentRepository;
    private final SuggestionRepository suggestionRepository;

    @Transactional(readOnly = true)
    public AdminStatsResponse overview() {
        currentUserService.requireAdmin();
        return new AdminStatsResponse(
            userRepository.count(),
            userRepository.countByStatus(UserStatus.DISABLED),
            articleRepository.countByPublishedTrueAndDeletedAtIsNull(),
            projectRepository.countByPublishedTrueAndDeletedAtIsNull(),
            commentRepository.countByDeletedAtIsNull(),
            suggestionRepository.count(),
            articleRepository.countByDeletedAtNotNull(),
            projectRepository.countByDeletedAtNotNull()
        );
    }

}
