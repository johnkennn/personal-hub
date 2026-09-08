package com.zzh.personal_hub.common.softdelete;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.zzh.personal_hub.article.entity.Article;
import com.zzh.personal_hub.article.repository.ArticleRepository;
import com.zzh.personal_hub.project.entity.Project;
import com.zzh.personal_hub.project.repository.ProjectRepository;
import com.zzh.personal_hub.social.entity.Comment;
import com.zzh.personal_hub.social.repository.CommentRepository;
import com.zzh.personal_hub.social.repository.ContentLikeRepository;
import com.zzh.personal_hub.social.ContentTargetType;
import com.zzh.personal_hub.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import java.time.Instant;
import java.util.List;
import java.time.Duration;

@Slf4j
@Service
@RequiredArgsConstructor
public class SoftDeletePurgeService {

    private final SoftDeleteProperties properties;
    private final ArticleRepository articleRepository;
    private final ProjectRepository projectRepository;
    private final CommentRepository commentRepository;
    private final ContentLikeRepository contentLikeRepository;
    private final NotificationRepository notificationRepository;

    @Transactional
    public void purgeExpired() {
        Instant cutoff = Instant.now().minus(Duration.ofDays(properties.getRetainDays()));
        int articles = purgeArticles(cutoff);
        int projects = purgeProjects(cutoff);
        int comments = purgeComments(cutoff);
        log.info(
            "软删物理清理完成 cutoff={} articles={} projects={} comments={}",
            cutoff,
            articles,
            projects,
            comments);
    }

    private int purgeArticles(Instant cutoff) {
        List<Article> rows = articleRepository.findByDeletedAtNotNullAndDeletedAtBefore(cutoff);
        for (Article a : rows) {
            Long id = a.getId();
            commentRepository.deleteByTargetTypeAndTargetId(ContentTargetType.ARTICLE, id);
            contentLikeRepository.deleteByTargetTypeAndTargetId(ContentTargetType.ARTICLE, id);
            notificationRepository.deleteByTargetTypeAndTargetId("ARTICLE", id);
            articleRepository.delete(a);
        }
        return rows.size();
    }

    private int purgeProjects(Instant cutoff) {
        List<Project> rows = projectRepository.findByDeletedAtNotNullAndDeletedAtBefore(cutoff);
        for (Project p : rows) {
            Long id = p.getId();
            commentRepository.deleteByTargetTypeAndTargetId(ContentTargetType.PROJECT, id);
            contentLikeRepository.deleteByTargetTypeAndTargetId(ContentTargetType.PROJECT, id);
            notificationRepository.deleteByTargetTypeAndTargetId("PROJECT", id);
            projectRepository.delete(p);
        }
        return rows.size();
    }

    private int purgeComments(Instant cutoff) {
        List<Comment> rows = commentRepository.findByDeletedAtNotNullAndDeletedAtBefore(cutoff);
        for (Comment c : rows) {
            commentRepository.delete(c);
        }
        return rows.size();
    }
}
