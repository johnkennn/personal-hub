package com.zzh.personal_hub.blog.service;

import com.zzh.personal_hub.blog.dto.ArticleCreateRequest;
import com.zzh.personal_hub.blog.dto.ArticleUpdateRequest;
import com.zzh.personal_hub.blog.entity.Article;
import com.zzh.personal_hub.blog.repository.ArticleRepository;
import com.zzh.personal_hub.common.exception.BusinessException;
import com.zzh.personal_hub.user.entity.User;
import com.zzh.personal_hub.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class ArticleService {

    private final ArticleRepository articleRepository;
    private final UserRepository userRepository;

    public List<Article> listPublished() {
        return articleRepository.findByPublishedTrueAndDeletedAtIsNullOrderByCreatedAtDesc();
    }

    public Article getPublishedById(Long id) {
        return articleRepository
                .findByIdAndPublishedTrueAndDeletedAtIsNull(id)
                .orElseThrow(() -> new BusinessException(404, "文章不存在"));
    }

    public Article createArticle(ArticleCreateRequest request) {
        User me = currentUser(); // 谁登录，谁就是作者

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
        User me = currentUser();
        Article article = articleRepository
                .findById(id)
                .orElseThrow(() -> new BusinessException(404, "文章不存在"));
        assertOwner(article, me);
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
        User me = currentUser();
        Article article = articleRepository
                .findById(id)
                .orElseThrow(() -> new BusinessException(404, "文章不存在"));
        assertOwner(article, me);
        if (article.getDeletedAt() != null) {
            throw new BusinessException(404, "文章不存在");
        }
        article.setDeletedAt(Instant.now());
        article.setUpdatedAt(Instant.now());
        articleRepository.save(article);
    }

    public List<Article> listMyDrafts() {
        User me = currentUser();
        return articleRepository.findByAuthorIdAndPublishedFalseAndDeletedAtIsNullOrderByUpdatedAtDesc(me.getId());
    }
    
    public List<Article> listMyPublished() {
        User me = currentUser();
        return articleRepository.findByAuthorIdAndPublishedTrueAndDeletedAtIsNullOrderByUpdatedAtDesc(me.getId());
    }

    public List<Article> listAll() {
        return articleRepository.findAllByOrderByUpdatedAtDesc();
    }

    private User currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getName() == null) {
            throw new BusinessException(401, "未登录或登录已失效");
        }
        return userRepository
                .findByUsername(auth.getName())
                .orElseThrow(() -> new BusinessException(401, "未登录或用户不存在"));
    }

    private void assertOwner(Article article, User me) {
        if (!Objects.equals(article.getAuthorId(), me.getId())) {
            throw new BusinessException(403, "无权操作该文章");
        }
    }

    /** 作者查看自己的文章（含草稿） */
    public Article getMyArticle(Long id) {
        User me = currentUser();
        Article article = articleRepository
                .findById(id)
                .orElseThrow(() -> new BusinessException(404, "文章不存在"));
        assertOwner(article, me);
        if (article.getDeletedAt() != null) {
            throw new BusinessException(404, "文章不存在");
        }
        return article;
    }

    public int batchPublish(List<Long> ids) {
        User me = currentUser();
        int n = 0;
        for (Long id : ids) {
            Article a = articleRepository.findById(id).orElse(null);
            if (a == null || a.getDeletedAt() != null) continue;
            if (!Objects.equals(a.getAuthorId(), me.getId())) continue;
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
        User me = currentUser();
        int n = 0;
        for (Long id : ids) {
            Article a = articleRepository.findById(id).orElse(null);
            if (a == null || a.getDeletedAt() != null) continue;
            if (!Objects.equals(a.getAuthorId(), me.getId())) continue;
            if (!Boolean.TRUE.equals(a.getPublished())) continue; // 未发布跳过
            a.setPublished(false);
            a.setUpdatedAt(Instant.now());
            articleRepository.save(a);
            n++;
        }
        return n;
    }

    public int batchDelete(List<Long> ids) {
        User me = currentUser();
        int n = 0;
        for (Long id : ids) {
            Article a = articleRepository.findById(id).orElse(null);
            if (a == null || a.getDeletedAt() != null) continue;
            if (!Objects.equals(a.getAuthorId(), me.getId())) continue;
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