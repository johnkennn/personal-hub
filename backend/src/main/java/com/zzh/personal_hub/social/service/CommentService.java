package com.zzh.personal_hub.social.service;

import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import com.zzh.personal_hub.social.repository.CommentRepository;
import com.zzh.personal_hub.social.entity.Comment;
import com.zzh.personal_hub.social.ContentTargetType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import com.zzh.personal_hub.user.repository.UserRepository;
import com.zzh.personal_hub.user.entity.User;
import com.zzh.personal_hub.common.exception.BusinessException;
import java.util.List;
import com.zzh.personal_hub.blog.service.ArticleService;
import com.zzh.personal_hub.project.service.ProjectService;
import java.time.Instant;
import org.springframework.transaction.annotation.Transactional;
import java.util.Objects;
import com.zzh.personal_hub.social.dto.CommentResponse;

@Service
@RequiredArgsConstructor
public class CommentService {
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final ArticleService articleService;
    private final ProjectService projectService;

    public List<CommentResponse> list(ContentTargetType type, Long targetId) {
        assertPublishedTarget(type, targetId);
        return commentRepository
                .findByTargetTypeAndTargetIdAndDeletedAtIsNullOrderByCreatedAtDesc(type, targetId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public CommentResponse create(ContentTargetType type, Long targetId,  String body) {
        assertPublishedTarget(type, targetId);
        User me = currentUser();
        Comment comment = new Comment();
        comment.setUserId(me.getId());
        comment.setTargetType(type);
        comment.setTargetId(targetId);
        comment.setBody(body);
        comment.setCreatedAt(Instant.now());
        comment.setUpdatedAt(Instant.now());
        comment.setDeletedAt(null);
        comment = commentRepository.save(comment);
        return toResponse(comment);
    }

    @Transactional
    public Comment update(Long id, String body) {
        User me = currentUser();
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new BusinessException(404, "评论不存在"));
        if (comment.getDeletedAt() != null) {
            throw new BusinessException(404, "评论不存在");
        }
        if (!Objects.equals(comment.getUserId(), me.getId())) {
            throw new BusinessException(403, "无权修改该评论");
        }
        comment.setBody(body);
        comment.setUpdatedAt(Instant.now());
        commentRepository.save(comment);
        return comment;
    }

    @Transactional
    public void delete(Long id) {
        User me = currentUser();
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new BusinessException(404, "评论不存在"));
        if (comment.getDeletedAt() != null) {
            throw new BusinessException(404, "评论不存在");
        }
        if (!Objects.equals(comment.getUserId(), me.getId())) {
            throw new BusinessException(403, "无权删除该评论");
        }
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

    private User currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getName() == null
                || "anonymousUser".equals(auth.getName())) {
            throw new BusinessException(401, "未登录或登录已失效");
        }
        return userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new BusinessException(401, "未登录或用户不存在"));
    }

    private CommentResponse toResponse(Comment c) {
        String username = userRepository.findById(c.getUserId())
                .map(User::getUsername)
                .orElse("unknown");
        return new CommentResponse(c.getId(), c.getBody(), c.getCreatedAt(), c.getUpdatedAt(), c.getUserId(), username);
    }
}
