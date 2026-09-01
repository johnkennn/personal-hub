package com.zzh.personal_hub.social.service;

import com.zzh.personal_hub.social.ContentTargetType;
import com.zzh.personal_hub.social.dto.LikeSummaryDto;
import com.zzh.personal_hub.social.repository.ContentLikeRepository;
import com.zzh.personal_hub.social.entity.ContentLike;
import com.zzh.personal_hub.user.entity.User;
import com.zzh.personal_hub.common.security.CurrentUserService;
import com.zzh.personal_hub.notification.service.NotificationService;
import com.zzh.personal_hub.blog.service.ArticleService;
import com.zzh.personal_hub.project.service.ProjectService;

import java.time.Instant;
import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class LikeService {

    private final ContentLikeRepository contentLikeRepository;
    private final CurrentUserService currentUserService;
    private final ArticleService articleService; // 先只服务文章
    private final ProjectService projectService; // 先只服务项目
    private final NotificationService notificationService;

    public LikeSummaryDto summary(ContentTargetType type, Long targetId) {
        assertPublishedTarget(type, targetId);
        long count = contentLikeRepository.countByTargetTypeAndTargetId(type, targetId);
        boolean liked = false;
        Long meId = currentUserService.findUserIdOrNull(); // 匿名 → null
        if (meId != null) {
            liked = contentLikeRepository.existsByUserIdAndTargetTypeAndTargetId(meId, type, targetId);
        }
        return new LikeSummaryDto(count, liked);
    }

    @Transactional
    public LikeSummaryDto like(ContentTargetType type, Long targetId) {
        assertPublishedTarget(type, targetId);
        User me = currentUserService.requireUser(); // 必须登录
        if (!contentLikeRepository.existsByUserIdAndTargetTypeAndTargetId(me.getId(), type, targetId)) {
            ContentLike row = new ContentLike();
            row.setUserId(me.getId());
            row.setTargetType(type);
            row.setTargetId(targetId);
            row.setCreatedAt(Instant.now());
            contentLikeRepository.save(row);

            Long authorId = resolveAuthorId(type, targetId);
            notificationService.notifyLike(me.getId(), authorId, type.name(), targetId);
        }
        return summary(type, targetId);
    }

    private Long resolveAuthorId(ContentTargetType type, Long targetId) {
        if (type == ContentTargetType.ARTICLE) {
            return articleService.getPublishedById(targetId).getAuthorId();
        }
        return projectService.getPublishedById(targetId).getAuthorId();
    }

    @Transactional
    public LikeSummaryDto unlike(ContentTargetType type, Long targetId) {
        assertPublishedTarget(type, targetId);
        User me = currentUserService.requireUser();
        contentLikeRepository.deleteByUserIdAndTargetTypeAndTargetId(me.getId(), type, targetId);
        return summary(type, targetId);
    }

    private void assertPublishedTarget(ContentTargetType type, Long targetId) {
        if (type == ContentTargetType.ARTICLE) {
            articleService.getPublishedById(targetId);
        }
        if (type == ContentTargetType.PROJECT) {
            projectService.getPublishedById(targetId);
        }
    }
}