package com.zzh.personal_hub.blog.repository;

import com.zzh.personal_hub.blog.entity.Article;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional; // 可选的

public interface ArticleRepository extends JpaRepository<Article, Long> {
    List<Article> findByPublishedTrueAndDeletedAtIsNullOrderByCreatedAtDesc();
    Optional<Article> findByIdAndPublishedTrueAndDeletedAtIsNull(Long id);
    List<Article> findAllByOrderByUpdatedAtDesc();
    /** 某作者的草稿：author + published=false */
    List<Article> findByAuthorIdAndPublishedFalseAndDeletedAtIsNullOrderByUpdatedAtDesc(Long authorId);
    /** 某作者的已发布 */
    List<Article> findByAuthorIdAndPublishedTrueAndDeletedAtIsNullOrderByUpdatedAtDesc(Long authorId);
}