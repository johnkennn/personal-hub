package com.zzh.personal_hub.tool.service;

import com.zzh.personal_hub.common.exception.BusinessException;
import com.zzh.personal_hub.common.security.CurrentUserService;
import com.zzh.personal_hub.tool.dto.ToolResponse;
import com.zzh.personal_hub.tool.dto.ToolUpsertRequest;
import com.zzh.personal_hub.tool.entity.Tool;
import com.zzh.personal_hub.tool.repository.ToolRepository;
import com.zzh.personal_hub.toolcategory.entity.ToolCategory;
import com.zzh.personal_hub.toolcategory.repository.ToolCategoryRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ToolService {

    private final ToolRepository toolRepository;
    private final ToolCategoryRepository toolCategoryRepository;
    private final CurrentUserService currentUserService;

    public List<ToolResponse> listPublished(String categorySlug) {
        List<Tool> tools;
        if (StringUtils.hasText(categorySlug)) {
            ToolCategory category = toolCategoryRepository.findBySlug(categorySlug.trim())
                    .orElseThrow(() -> new BusinessException(404, "分类不存在"));
            tools = toolRepository
                    .findByCategoryIdAndPublishedTrueAndDeletedAtIsNullOrderByWeightDescUpdatedAtDesc(
                            category.getId());
        } else {
            tools = toolRepository.findByPublishedTrueAndDeletedAtIsNullOrderByWeightDescUpdatedAtDesc();
        }
        return toResponses(tools);
    }

    public ToolResponse getPublishedBySlug(String slug) {
        Tool tool = toolRepository.findBySlugAndPublishedTrueAndDeletedAtIsNull(normalizeSlug(slug))
                .orElseThrow(() -> new BusinessException(404, "工具不存在"));
        return toResponse(tool, categoryMap());
    }

    public List<ToolResponse> listForAdmin() {
        currentUserService.requireAdmin();
        return toResponses(toolRepository.findByDeletedAtIsNullOrderByUpdatedAtDesc());
    }

    public ToolResponse getForAdmin(Long id) {
        currentUserService.requireAdmin();
        Tool tool = toolRepository.findById(id)
                .filter(t -> t.getDeletedAt() == null)
                .orElseThrow(() -> new BusinessException(404, "工具不存在"));
        return toResponse(tool, categoryMap());
    }

    @Transactional
    public ToolResponse create(ToolUpsertRequest request) {
        currentUserService.requireAdmin();
        String slug = normalizeSlug(request.getSlug());
        if (toolRepository.existsBySlug(slug)) {
            throw new BusinessException(400, "工具 slug 已存在");
        }
        ensureCategory(request.getCategoryId());
        Tool row = new Tool();
        apply(row, request, slug);
        row.setCreatedAt(Instant.now());
        row.setUpdatedAt(Instant.now());
        return toResponse(toolRepository.save(row), categoryMap());
    }

    @Transactional
    public ToolResponse update(Long id, ToolUpsertRequest request) {
        currentUserService.requireAdmin();
        Tool row = toolRepository.findById(id)
                .filter(t -> t.getDeletedAt() == null)
                .orElseThrow(() -> new BusinessException(404, "工具不存在"));
        String slug = normalizeSlug(request.getSlug());
        if (toolRepository.existsBySlugAndIdNot(slug, id)) {
            throw new BusinessException(400, "工具 slug 已存在");
        }
        ensureCategory(request.getCategoryId());
        apply(row, request, slug);
        row.setUpdatedAt(Instant.now());
        return toResponse(toolRepository.save(row), categoryMap());
    }

    @Transactional
    public ToolResponse unpublish(Long id) {
        currentUserService.requireAdmin();
        Tool row = toolRepository.findById(id)
                .filter(t -> t.getDeletedAt() == null)
                .orElseThrow(() -> new BusinessException(404, "工具不存在"));
        row.setPublished(false);
        row.setUpdatedAt(Instant.now());
        return toResponse(toolRepository.save(row), categoryMap());
    }

    @Transactional
    public void softDelete(Long id) {
        currentUserService.requireAdmin();
        Tool row = toolRepository.findById(id)
                .filter(t -> t.getDeletedAt() == null)
                .orElseThrow(() -> new BusinessException(404, "工具不存在"));
        row.setDeletedAt(Instant.now());
        row.setPublished(false);
        row.setUpdatedAt(Instant.now());
        toolRepository.save(row);
    }

    private void ensureCategory(Long categoryId) {
        if (!toolCategoryRepository.existsById(categoryId)) {
            throw new BusinessException(400, "分类不存在");
        }
    }

    private void apply(Tool row, ToolUpsertRequest request, String slug) {
        row.setSlug(slug);
        row.setName(request.getName().trim());
        row.setCategoryId(request.getCategoryId());
        row.setSummary(request.getSummary().trim());
        row.setIntro(request.getIntro().trim());
        row.setAudience(blankToNull(request.getAudience()));
        row.setPricing(request.getPricing().trim());
        row.setWebsiteUrl(request.getWebsiteUrl().trim());
        row.setAffiliateUrl(blankToNull(request.getAffiliateUrl()));
        row.setKeywordsJson(blankToNull(request.getKeywordsJson()));
        row.setTagsJson(blankToNull(request.getTagsJson()));
        row.setUseCasesJson(blankToNull(request.getUseCasesJson()));
        row.setProsJson(blankToNull(request.getProsJson()));
        row.setConsJson(blankToNull(request.getConsJson()));
        row.setFeatured(Boolean.TRUE.equals(request.getFeatured()));
        row.setWeight(request.getWeight() == null ? 0 : request.getWeight());
        row.setPublished(Boolean.TRUE.equals(request.getPublished()));
    }

    private List<ToolResponse> toResponses(List<Tool> tools) {
        Map<Long, ToolCategory> categories = categoryMap();
        return tools.stream().map(t -> toResponse(t, categories)).toList();
    }

    private Map<Long, ToolCategory> categoryMap() {
        return toolCategoryRepository.findAll().stream()
                .collect(Collectors.toMap(ToolCategory::getId, Function.identity()));
    }

    private ToolResponse toResponse(Tool t, Map<Long, ToolCategory> categories) {
        ToolCategory cat = categories.get(t.getCategoryId());
        return new ToolResponse(
                t.getId(),
                t.getSlug(),
                t.getName(),
                t.getCategoryId(),
                cat == null ? null : cat.getName(),
                cat == null ? null : cat.getSlug(),
                t.getSummary(),
                t.getIntro(),
                t.getAudience(),
                t.getPricing(),
                t.getWebsiteUrl(),
                t.getAffiliateUrl(),
                t.getKeywordsJson(),
                t.getTagsJson(),
                t.getUseCasesJson(),
                t.getProsJson(),
                t.getConsJson(),
                t.getFeatured(),
                t.getWeight(),
                t.getPublished(),
                t.getCreatedAt(),
                t.getUpdatedAt()
        );
    }

    private String normalizeSlug(String slug) {
        return slug == null ? "" : slug.trim().toLowerCase();
    }

    private String blankToNull(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        return value.trim();
    }
}
