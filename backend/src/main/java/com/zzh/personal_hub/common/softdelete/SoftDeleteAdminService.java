package com.zzh.personal_hub.common.softdelete;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Objects;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.zzh.personal_hub.article.entity.Article;
import com.zzh.personal_hub.article.repository.ArticleRepository;
import com.zzh.personal_hub.common.exception.BusinessException;
import com.zzh.personal_hub.common.security.CurrentUserService;
import com.zzh.personal_hub.common.softdelete.dto.AdminDeletedContentDto;
import com.zzh.personal_hub.project.entity.Project;
import com.zzh.personal_hub.project.entity.ProjectMedia;
import com.zzh.personal_hub.project.repository.ProjectMediaRepository;
import com.zzh.personal_hub.project.repository.ProjectRepository;
import com.zzh.personal_hub.user.entity.User;
import com.zzh.personal_hub.user.entity.UserProfile;
import com.zzh.personal_hub.user.repository.UserProfileRepository;
import com.zzh.personal_hub.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SoftDeleteAdminService {

    private final SoftDeleteProperties properties;
    private final SoftDeletePurgeService purgeService;
    private final CurrentUserService currentUserService;
    private final ArticleRepository articleRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMediaRepository projectMediaRepository;
    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;

    @Transactional(readOnly = true)
    public List<AdminDeletedContentDto> listDeletedArticles() {
        currentUserService.requireAdmin();
        return articleRepository.findByDeletedAtNotNullOrderByDeletedAtDesc().stream()
                .map(this::toArticleDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public AdminDeletedContentDto getDeletedArticle(Long id) {
        currentUserService.requireAdmin();
        return toArticleDto(requireDeletedArticle(id), true);
    }

    @Transactional
    public AdminDeletedContentDto restoreArticle(Long id) {
        currentUserService.requireAdmin();
        Article article = requireDeletedArticle(id);
        article.setDeletedAt(null);
        article.setUpdatedAt(Instant.now());
        return toArticleDto(articleRepository.save(article));
    }

    @Transactional
    public void purgeArticle(Long id) {
        currentUserService.requireAdmin();
        purgeService.purgeArticleNow(requireDeletedArticle(id));
    }

    @Transactional(readOnly = true)
    public List<AdminDeletedContentDto> listDeletedProjects() {
        currentUserService.requireAdmin();
        return projectRepository.findByDeletedAtNotNullOrderByDeletedAtDesc().stream()
                .map(this::toProjectDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public AdminDeletedContentDto getDeletedProject(Long id) {
        currentUserService.requireAdmin();
        return toProjectDto(requireDeletedProject(id), true);
    }

    @Transactional(readOnly = true)
    public List<ProjectMedia> listDeletedProjectMedia(Long id) {
        currentUserService.requireAdmin();
        requireDeletedProject(id);
        return projectMediaRepository.findByProjectIdOrderBySortOrderAscIdAsc(id);
    }

    @Transactional
    public AdminDeletedContentDto restoreProject(Long id) {
        currentUserService.requireAdmin();
        Project project = requireDeletedProject(id);
        project.setDeletedAt(null);
        project.setUpdatedAt(Instant.now());
        return toProjectDto(projectRepository.save(project));
    }

    @Transactional
    public void purgeProject(Long id) {
        currentUserService.requireAdmin();
        purgeService.purgeProjectNow(requireDeletedProject(id));
    }

    private Article requireDeletedArticle(Long id) {
        Article article = articleRepository
                .findById(id)
                .orElseThrow(() -> new BusinessException(404, "文章不存在"));
        if (article.getDeletedAt() == null) {
            throw new BusinessException(400, "该文章未在回收站中");
        }
        return article;
    }

    private Project requireDeletedProject(Long id) {
        Project project = projectRepository
                .findById(id)
                .orElseThrow(() -> new BusinessException(404, "项目不存在"));
        if (project.getDeletedAt() == null) {
            throw new BusinessException(400, "该项目未在回收站中");
        }
        return project;
    }

    private AdminDeletedContentDto toArticleDto(Article article) {
        return toArticleDto(article, false);
    }

    private AdminDeletedContentDto toArticleDto(Article article, boolean withBody) {
        AdminDeletedContentDto dto = baseDto(
                article.getId(),
                article.getTitle(),
                article.getAuthorId(),
                article.getDeletedAt(),
                article.getPublished(),
                article.getCoverUrl(),
                article.getCreatedAt(),
                article.getUpdatedAt());
        dto.setRelatedProjectId(article.getRelatedProjectId());
        if (withBody) {
            dto.setBody(article.getContent());
        }
        return dto;
    }

    private AdminDeletedContentDto toProjectDto(Project project) {
        return toProjectDto(project, false);
    }

    private AdminDeletedContentDto toProjectDto(Project project, boolean withBody) {
        AdminDeletedContentDto dto = baseDto(
                project.getId(),
                project.getName(),
                project.getAuthorId(),
                project.getDeletedAt(),
                project.getPublished(),
                project.getCoverUrl(),
                project.getCreatedAt(),
                project.getUpdatedAt());
        dto.setTechStack(project.getTechStack());
        dto.setRepoUrl(project.getRepoUrl());
        dto.setDemoUrl(project.getDemoUrl());
        if (withBody) {
            dto.setBody(project.getDescription());
        }
        return dto;
    }

    private AdminDeletedContentDto baseDto(
            Long id,
            String title,
            Long authorId,
            Instant deletedAt,
            Boolean published,
            String coverUrl,
            Instant createdAt,
            Instant updatedAt) {
        AdminDeletedContentDto dto = new AdminDeletedContentDto();
        dto.setId(id);
        dto.setTitle(title);
        dto.setAuthorId(authorId);
        dto.setAuthorName(resolveAuthorName(authorId));
        dto.setDeletedAt(deletedAt);
        dto.setPurgeAt(purgeAt(deletedAt));
        dto.setRetainDays(properties.getRetainDays());
        dto.setPublished(published);
        dto.setCoverUrl(coverUrl);
        dto.setCreatedAt(createdAt);
        dto.setUpdatedAt(updatedAt);
        return dto;
    }

    private Instant purgeAt(Instant deletedAt) {
        if (deletedAt == null) return null;
        return deletedAt.plus(Duration.ofDays(properties.getRetainDays()));
    }

    private String resolveAuthorName(Long authorId) {
        if (authorId == null) return "未知作者";
        User user = userRepository.findById(authorId).orElse(null);
        if (user == null) return "用户#" + authorId;
        UserProfile profile = userProfileRepository.findById(authorId).orElse(null);
        if (profile != null && profile.getNickname() != null && !profile.getNickname().isBlank()) {
            return profile.getNickname().trim();
        }
        return Objects.requireNonNullElse(user.getUsername(), "用户#" + authorId);
    }
}
