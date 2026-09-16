package com.zzh.personal_hub.tool.repository;

import com.zzh.personal_hub.tool.entity.Tool;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface ToolRepository extends JpaRepository<Tool, Long> {
    List<Tool> findByPublishedTrueAndDeletedAtIsNullOrderByWeightDescUpdatedAtDesc();

    List<Tool> findByCategoryIdAndPublishedTrueAndDeletedAtIsNullOrderByWeightDescUpdatedAtDesc(Long categoryId);

    Optional<Tool> findBySlugAndPublishedTrueAndDeletedAtIsNull(String slug);

    Optional<Tool> findBySlugAndDeletedAtIsNull(String slug);

    List<Tool> findBySlugInAndDeletedAtIsNull(Collection<String> slugs);

    List<Tool> findByDeletedAtIsNullOrderByUpdatedAtDesc();

    boolean existsBySlug(String slug);

    boolean existsBySlugAndIdNot(String slug, Long id);

    long countByCategoryIdAndDeletedAtIsNull(Long categoryId);
}
