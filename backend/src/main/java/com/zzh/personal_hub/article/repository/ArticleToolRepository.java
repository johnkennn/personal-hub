package com.zzh.personal_hub.article.repository;

import com.zzh.personal_hub.article.entity.ArticleToolEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

public interface ArticleToolRepository extends JpaRepository<ArticleToolEntity, ArticleToolEntity.Pk> {

    List<ArticleToolEntity> findByArticleIdOrderBySortOrderAscToolIdAsc(Long articleId);

    List<ArticleToolEntity> findByArticleIdInOrderBySortOrderAscToolIdAsc(Collection<Long> articleIds);

    List<ArticleToolEntity> findByToolIdOrderBySortOrderAscArticleIdAsc(Long toolId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("delete from ArticleToolEntity t where t.articleId = :articleId")
    void deleteByArticleId(@Param("articleId") Long articleId);
}
