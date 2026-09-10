package com.zzh.personal_hub.toolcategory.service;

import com.zzh.personal_hub.common.exception.BusinessException;
import com.zzh.personal_hub.common.security.CurrentUserService;
import com.zzh.personal_hub.tool.repository.ToolRepository;
import com.zzh.personal_hub.toolcategory.dto.ToolCategoryUpsertRequest;
import com.zzh.personal_hub.toolcategory.entity.ToolCategory;
import com.zzh.personal_hub.toolcategory.repository.ToolCategoryRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ToolCategoryService {

    private final ToolCategoryRepository toolCategoryRepository;
    private final ToolRepository toolRepository;
    private final CurrentUserService currentUserService;

    public List<ToolCategory> listAll() {
        return toolCategoryRepository.findAllByOrderBySortOrderAscIdAsc();
    }

    public ToolCategory getBySlug(String slug) {
        return toolCategoryRepository.findBySlug(slug)
                .orElseThrow(() -> new BusinessException(404, "分类不存在"));
    }

    public ToolCategory getById(Long id) {
        return toolCategoryRepository.findById(id)
                .orElseThrow(() -> new BusinessException(404, "分类不存在"));
    }

    @Transactional
    public ToolCategory create(ToolCategoryUpsertRequest request) {
        currentUserService.requireAdmin();
        String slug = normalizeSlug(request.getSlug());
        if (toolCategoryRepository.existsBySlug(slug)) {
            throw new BusinessException(400, "分类 slug 已存在");
        }
        ToolCategory row = new ToolCategory();
        apply(row, request, slug);
        row.setCreatedAt(Instant.now());
        row.setUpdatedAt(Instant.now());
        return toolCategoryRepository.save(row);
    }

    @Transactional
    public ToolCategory update(Long id, ToolCategoryUpsertRequest request) {
        currentUserService.requireAdmin();
        ToolCategory row = getById(id);
        String slug = normalizeSlug(request.getSlug());
        if (toolCategoryRepository.existsBySlugAndIdNot(slug, id)) {
            throw new BusinessException(400, "分类 slug 已存在");
        }
        apply(row, request, slug);
        row.setUpdatedAt(Instant.now());
        return toolCategoryRepository.save(row);
    }

    @Transactional
    public void delete(Long id) {
        currentUserService.requireAdmin();
        ToolCategory row = getById(id);
        if (toolRepository.countByCategoryIdAndDeletedAtIsNull(id) > 0) {
            throw new BusinessException(400, "该分类下还有工具，无法删除");
        }
        toolCategoryRepository.delete(row);
    }

    private void apply(ToolCategory row, ToolCategoryUpsertRequest request, String slug) {
        row.setName(request.getName().trim());
        row.setSlug(slug);
        row.setSortOrder(request.getSortOrder() == null ? 0 : request.getSortOrder());
    }

    private String normalizeSlug(String slug) {
        return slug == null ? "" : slug.trim().toLowerCase();
    }
}
