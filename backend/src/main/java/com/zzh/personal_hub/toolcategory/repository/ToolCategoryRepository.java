package com.zzh.personal_hub.toolcategory.repository;

import com.zzh.personal_hub.toolcategory.entity.ToolCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ToolCategoryRepository extends JpaRepository<ToolCategory, Long> {
    List<ToolCategory> findAllByOrderBySortOrderAscIdAsc();

    Optional<ToolCategory> findBySlug(String slug);

    boolean existsBySlug(String slug);

    boolean existsBySlugAndIdNot(String slug, Long id);
}
