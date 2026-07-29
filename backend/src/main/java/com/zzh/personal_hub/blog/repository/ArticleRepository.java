package com.zzh.personal_hub.blog.repository;

import com.zzh.personal_hub.blog.entity.Article;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional; // 可选的

public interface ArticleRepository extends JpaRepository<Article, Long> {
    List<Article> findByPublishedTrueOrderByCreatedAtDesc();
    Optional<Article> findByIdAndPublishedTrue(Long id);
}