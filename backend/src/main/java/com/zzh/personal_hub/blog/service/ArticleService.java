package com.zzh.personal_hub.blog.service;

import com.zzh.personal_hub.blog.entity.Article;
import com.zzh.personal_hub.blog.repository.ArticleRepository;
import com.zzh.personal_hub.common.exception.BusinessException;
import com.zzh.personal_hub.blog.dto.ArticleCreateRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.Instant;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ArticleService {

    private final ArticleRepository articleRepository;

    public List<Article> listPublished() {
        return articleRepository.findByPublishedTrueOrderByCreatedAtDesc();
    }

    public Article getPublishedById(Long id) {
        return articleRepository
                .findByIdAndPublishedTrue(id)
                .orElseThrow(() -> new BusinessException(404, "文章不存在"));
    }

    public Article createArticle(ArticleCreateRequest request) {
        Article article = new Article();
        article.setTitle(request.getTitle());
        article.setContent(request.getContent());
        article.setPublished(Boolean.TRUE.equals(request.getPublished()));
        article.setCreatedAt(Instant.now());
        article.setUpdatedAt(Instant.now());
        return articleRepository.save(article);
    }
}