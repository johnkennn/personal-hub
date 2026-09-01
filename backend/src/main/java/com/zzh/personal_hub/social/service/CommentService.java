package com.zzh.personal_hub.social.service;

import lombok.RequiredArgsConstructor;

import com.zzh.personal_hub.social.repository.CommentRepository;
import com.zzh.personal_hub.social.entity.Comment;
import com.zzh.personal_hub.social.ContentTargetType;
import com.zzh.personal_hub.social.dto.CommentResponse;
import com.zzh.personal_hub.common.security.CurrentUserService;
import com.zzh.personal_hub.user.entity.User;
import com.zzh.personal_hub.user.repository.UserRepository;
import com.zzh.personal_hub.notification.service.NotificationService;
import com.zzh.personal_hub.common.exception.BusinessException;
import com.zzh.personal_hub.blog.service.ArticleService;
import com.zzh.personal_hub.project.service.ProjectService;

import java.util.List;
import java.time.Instant;

import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CommentService {
    private final CommentRepository commentRepository;
    private final CurrentUserService currentUserService;
    private final UserRepository userRepository;
    private final ArticleService articleService;
    private final ProjectService projectService;
    private final NotificationService notificationService;

    public List<CommentResponse> list(ContentTargetType type, Long targetId) {
        assertPublishedTarget(type, targetId);
        return commentRepository
                .findByTargetTypeAndTargetIdAndDeletedAtIsNullOrderByCreatedAtDesc(type, targetId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public CommentResponse create(ContentTargetType type, Long targetId,  String body) {
        assertPublishedTarget(type, targetId);
        Comment comment = new Comment();
        User me = currentUserService.requireUser();
        comment.setUserId(me.getId());
        comment.setTargetType(type);
        comment.setTargetId(targetId);
        comment.setBody(body);
        comment.setCreatedAt(Instant.now());
        comment.setUpdatedAt(Instant.now());
        comment.setDeletedAt(null);
        comment = commentRepository.save(comment);
        Long authorId = resolveAuthorId(type, targetId);
        notificationService.notifyComment(me.getId(), authorId, type.name(), targetId);
        return toResponse(comment);
    }

    private Long resolveAuthorId(ContentTargetType type, Long targetId) {
        if (type == ContentTargetType.ARTICLE) {
            return articleService.getPublishedById(targetId).getAuthorId();
        }
        return projectService.getPublishedById(targetId).getAuthorId();
    }

    @Transactional
    public Comment update(Long id, String body) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new BusinessException(404, "评论不存在"));
        currentUserService.assertOwner(comment.getUserId(), "无权修改该评论");
        comment.setBody(body);
        comment.setUpdatedAt(Instant.now());
        commentRepository.save(comment);
        return comment;
    }

    @Transactional
    public void delete(Long id) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new BusinessException(404, "评论不存在"));
        currentUserService.assertOwner(comment.getUserId(), "无权删除该评论");
        comment.setDeletedAt(Instant.now());
        commentRepository.save(comment);
    }

    private void assertPublishedTarget(ContentTargetType type, Long targetId) {
        if (type == ContentTargetType.ARTICLE) {
            articleService.getPublishedById(targetId);
        }
        if (type == ContentTargetType.PROJECT) {
            projectService.getPublishedById(targetId);
        }
    }

    private CommentResponse toResponse(Comment c) {
        String username = userRepository.findById(c.getUserId())
                .map(User::getUsername)
                .orElse("unknown");
        return new CommentResponse(c.getId(), c.getBody(), c.getCreatedAt(), c.getUpdatedAt(), c.getUserId(), username);
    }
}
