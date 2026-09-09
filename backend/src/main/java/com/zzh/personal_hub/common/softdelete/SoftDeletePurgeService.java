package com.zzh.personal_hub.common.softdelete;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.zzh.personal_hub.article.entity.Article;
import com.zzh.personal_hub.article.repository.ArticleRepository;
import com.zzh.personal_hub.notification.repository.NotificationRepository;
import com.zzh.personal_hub.project.entity.Project;
import com.zzh.personal_hub.project.repository.ProjectMediaRepository;
import com.zzh.personal_hub.project.repository.ProjectRepository;
import com.zzh.personal_hub.social.ContentTargetType;
import com.zzh.personal_hub.social.entity.Comment;
import com.zzh.personal_hub.social.repository.CommentRepository;
import com.zzh.personal_hub.social.repository.ContentLikeRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.time.Duration;
import java.time.Instant;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class SoftDeletePurgeService {

    private final SoftDeleteProperties properties;
    private final ArticleRepository articleRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMediaRepository projectMediaRepository;
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

    /** 管理员立即彻底删除一篇已软删文章 */
    @Transactional
    public void purgeArticleNow(Article article) {
        Long id = article.getId();
        commentRepository.deleteByTargetTypeAndTargetId(ContentTargetType.ARTICLE, id);
        contentLikeRepository.deleteByTargetTypeAndTargetId(ContentTargetType.ARTICLE, id);
        notificationRepository.deleteByTargetTypeAndTargetId("ARTICLE", id);
        articleRepository.delete(article);
    }

    /** 管理员立即彻底删除一个已软删项目 */
    @Transactional
    public void purgeProjectNow(Project project) {
        Long id = project.getId();
        projectMediaRepository.deleteByProjectId(id);
        commentRepository.deleteByTargetTypeAndTargetId(ContentTargetType.PROJECT, id);
        contentLikeRepository.deleteByTargetTypeAndTargetId(ContentTargetType.PROJECT, id);
        notificationRepository.deleteByTargetTypeAndTargetId("PROJECT", id);
        projectRepository.delete(project);
    }

    private int purgeArticles(Instant cutoff) {
        List<Article> rows = articleRepository.findByDeletedAtNotNullAndDeletedAtBefore(cutoff);
        for (Article a : rows) {
            purgeArticleNow(a);
        }
        return rows.size();
    }

    private int purgeProjects(Instant cutoff) {
        List<Project> rows = projectRepository.findByDeletedAtNotNullAndDeletedAtBefore(cutoff);
        for (Project p : rows) {
            purgeProjectNow(p);
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
