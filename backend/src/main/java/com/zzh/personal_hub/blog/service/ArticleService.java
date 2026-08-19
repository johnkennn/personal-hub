package com.zzh.personal_hub.blog.service;

import com.zzh.personal_hub.blog.dto.ArticleCreateRequest;
import com.zzh.personal_hub.blog.dto.ArticleUpdateRequest;
import com.zzh.personal_hub.blog.entity.Article;
import com.zzh.personal_hub.blog.repository.ArticleRepository;
import com.zzh.personal_hub.common.exception.BusinessException;
import com.zzh.personal_hub.common.security.CurrentUserService;
import com.zzh.personal_hub.user.entity.User;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ArticleService {

    private final ArticleRepository articleRepository;
    private final CurrentUserService currentUserService;

    public List<Article> listPublished() {
        return articleRepository.findByPublishedTrueAndDeletedAtIsNullOrderByCreatedAtDesc();
    }

    public Article getPublishedById(Long id) {
        return articleRepository
                .findByIdAndPublishedTrueAndDeletedAtIsNull(id)
                .orElseThrow(() -> new BusinessException(404, "文章不存在"));
    }

    public Article createArticle(ArticleCreateRequest request) {
        User me = currentUserService.requireUser(); // 谁登录，谁就是作者

        Article article = new Article();
        article.setAuthorId(me.getId());
        article.setTitle(request.getTitle());
        article.setContent(request.getContent());
        article.setPublished(Boolean.TRUE.equals(request.getPublished()));
        article.setCreatedAt(Instant.now());
        article.setUpdatedAt(Instant.now());
        return articleRepository.save(article);
    }

    public Article updateArticle(Long id, ArticleUpdateRequest request) {
        Article article = articleRepository
                .findById(id)
                .orElseThrow(() -> new BusinessException(404, "文章不存在"));
        currentUserService.assertOwner(article.getAuthorId(), "无权操作该文章");
        if (article.getDeletedAt() != null) {
            throw new BusinessException(404, "文章不存在");
        }
        // 已发布：只允许下架，不允许改标题/正文
        if (Boolean.TRUE.equals(article.getPublished())) {
            if (Boolean.TRUE.equals(request.getPublished())) {
                throw new BusinessException(400, "已发布内容不可编辑，请先下架");
            }
            article.setPublished(false);
            article.setUpdatedAt(Instant.now());
            return articleRepository.save(article);
        }
        article.setTitle(request.getTitle());
        article.setContent(request.getContent());
        article.setPublished(request.getPublished());
        article.setUpdatedAt(Instant.now());
        return articleRepository.save(article);
    }

    public void deleteArticle(Long id) {
        Article article = articleRepository
                .findById(id)
                .orElseThrow(() -> new BusinessException(404, "文章不存在"));
        currentUserService.assertOwner(article.getAuthorId(), "无权操作该文章");
        if (article.getDeletedAt() != null) {
            throw new BusinessException(404, "文章不存在");
        }
        article.setDeletedAt(Instant.now());
        article.setUpdatedAt(Instant.now());
        articleRepository.save(article);
    }

    public List<Article> listMyDrafts() {
        User me = currentUserService.requireUser();
        return articleRepository.findByAuthorIdAndPublishedFalseAndDeletedAtIsNullOrderByUpdatedAtDesc(me.getId());
    }
    
    public List<Article> listMyPublished() {
        User me = currentUserService.requireUser();
        return articleRepository.findByAuthorIdAndPublishedTrueAndDeletedAtIsNullOrderByUpdatedAtDesc(me.getId());
    }

    public List<Article> listAll() {
        return articleRepository.findAllByOrderByUpdatedAtDesc();
    }

    public List<Article> listAllForAdmin() {
        currentUserService.requireAdmin();
        return articleRepository.findByPublishedTrueAndDeletedAtIsNullOrderByCreatedAtDesc();
    }

    @Transactional
    public Article unpublishByAdmin(Long id) {
        currentUserService.requireAdmin();
        Article article = getActiveForAdmin(id);
        article.setPublished(false);
        article.setUpdatedAt(Instant.now());
        article = articleRepository.save(article);
        return article;
    }

    @Transactional
    public void deleteByAdmin(Long id) {
        currentUserService.requireAdmin();
        Article article = getActiveForAdmin(id);
        article.setDeletedAt(Instant.now());
        article.setUpdatedAt(Instant.now());
        articleRepository.save(article);
    }

    private Article getActiveForAdmin(Long id) {
        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new BusinessException(404, "文章不存在"));
        if (article.getDeletedAt() != null || !Boolean.TRUE.equals(article.getPublished())) {
            throw new BusinessException(404, "文章不存在");
        }
        return article;
    }

    /** 作者查看自己的文章（含草稿） */
    public Article getMyArticle(Long id) {
        Article article = articleRepository
                .findById(id)
                .orElseThrow(() -> new BusinessException(404, "文章不存在"));
        currentUserService.assertOwner(article.getAuthorId(), "无权操作该文章");
        if (article.getDeletedAt() != null) {
            throw new BusinessException(404, "文章不存在");
        }
        return article;
    }

    public int batchPublish(List<Long> ids) {
        Long meId = currentUserService.requireUser().getId();
        int n = 0;
        for (Long id : ids) {
            Article a = articleRepository.findById(id).orElse(null);
            if (a == null || a.getDeletedAt() != null) continue;
            if (!java.util.Objects.equals(a.getAuthorId(), meId)) continue;
            if (Boolean.TRUE.equals(a.getPublished())) continue; // 已发布跳过
            a.setPublished(true);
            a.setUpdatedAt(Instant.now());
            articleRepository.save(a);
            n++;
        }
        return n;
    }
    // batchUnpublish：仅 published=true → false
    // batchDelete：写 deletedAt（同单条软删）
    public int batchUnpublish(List<Long> ids) {
        Long meId = currentUserService.requireUser().getId();
        int n = 0;
        for (Long id : ids) {
            Article a = articleRepository.findById(id).orElse(null);
            if (a == null || a.getDeletedAt() != null) continue;
            if (!java.util.Objects.equals(a.getAuthorId(), meId)) continue;
            if (!Boolean.TRUE.equals(a.getPublished())) continue; // 未发布跳过
            a.setPublished(false);
            a.setUpdatedAt(Instant.now());
            articleRepository.save(a);
            n++;
        }
        return n;
    }

    public int batchDelete(List<Long> ids) {
        Long meId = currentUserService.requireUser().getId();
        int n = 0;
        for (Long id : ids) {
            Article a = articleRepository.findById(id).orElse(null);
            if (a == null || a.getDeletedAt() != null) continue;
            if (!java.util.Objects.equals(a.getAuthorId(), meId)) continue;
            a.setDeletedAt(Instant.now());
            a.setUpdatedAt(Instant.now());
            articleRepository.save(a);
            n++;
        }
        return n;
    }

    public List<Article> listPublishedByAuthor(Long authorId) {
        return articleRepository
                .findByAuthorIdAndPublishedTrueAndDeletedAtIsNullOrderByUpdatedAtDesc(authorId);
    }
}