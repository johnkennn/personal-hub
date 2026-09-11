package com.zzh.personal_hub.deal.service;

import com.zzh.personal_hub.common.exception.BusinessException;
import com.zzh.personal_hub.common.security.CurrentUserService;
import com.zzh.personal_hub.deal.dto.DealResponse;
import com.zzh.personal_hub.deal.dto.DealUpsertRequest;
import com.zzh.personal_hub.deal.entity.Deal;
import com.zzh.personal_hub.deal.repository.DealRepository;
import com.zzh.personal_hub.tool.entity.Tool;
import com.zzh.personal_hub.tool.repository.ToolRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DealService {

    private static final Set<String> STATUSES = Set.of("DRAFT", "ACTIVE", "ENDED", "OFFLINE");

    private final DealRepository dealRepository;
    private final ToolRepository toolRepository;
    private final CurrentUserService currentUserService;

    public List<DealResponse> listActive() {
        Instant now = Instant.now();
        List<Deal> deals = dealRepository
                .findByDeletedAtIsNullAndStatusAndStartsAtLessThanEqualAndEndsAtGreaterThanEqualOrderByEndsAtAsc(
                        "ACTIVE", now, now);
        return toResponses(deals);
    }

    public List<DealResponse> listForAdmin() {
        currentUserService.requireAdmin();
        return toResponses(dealRepository.findByDeletedAtIsNullOrderByUpdatedAtDesc());
    }

    @Transactional
    public DealResponse create(DealUpsertRequest request) {
        currentUserService.requireAdmin();
        Deal row = new Deal();
        apply(row, request);
        row.setCreatedAt(Instant.now());
        row.setUpdatedAt(Instant.now());
        return toResponse(dealRepository.save(row), toolMap(List.of(row)));
    }

    @Transactional
    public DealResponse update(Long id, DealUpsertRequest request) {
        currentUserService.requireAdmin();
        Deal row = requireAlive(id);
        apply(row, request);
        row.setUpdatedAt(Instant.now());
        return toResponse(dealRepository.save(row), toolMap(List.of(row)));
    }

    @Transactional
    public void softDelete(Long id) {
        currentUserService.requireAdmin();
        Deal row = requireAlive(id);
        row.setDeletedAt(Instant.now());
        row.setUpdatedAt(Instant.now());
        dealRepository.save(row);
    }

    private void apply(Deal row, DealUpsertRequest request) {
        String status = normalizeStatus(request.getStatus());
        if (request.getEndsAt().isBefore(request.getStartsAt())) {
            throw new BusinessException(400, "结束时间不能早于开始时间");
        }
        Long toolId = request.getToolId();
        if (toolId != null) {
            Tool tool = toolRepository.findById(toolId)
                    .filter(t -> t.getDeletedAt() == null)
                    .orElseThrow(() -> new BusinessException(400, "关联产品不存在"));
            row.setToolId(tool.getId());
        } else {
            row.setToolId(null);
        }
        row.setTitle(request.getTitle().trim());
        row.setDescription(request.getDescription().trim());
        row.setPromoCode(StringUtils.hasText(request.getPromoCode())
                ? request.getPromoCode().trim()
                : null);
        row.setUrl(StringUtils.hasText(request.getUrl()) ? request.getUrl().trim() : null);
        row.setStartsAt(request.getStartsAt());
        row.setEndsAt(request.getEndsAt());
        row.setStatus(status);
    }

    private String normalizeStatus(String raw) {
        String status = raw == null ? "" : raw.trim().toUpperCase();
        if (!STATUSES.contains(status)) {
            throw new BusinessException(400, "无效状态，请使用 DRAFT/ACTIVE/ENDED/OFFLINE");
        }
        return status;
    }

    private Deal requireAlive(Long id) {
        return dealRepository.findById(id)
                .filter(d -> d.getDeletedAt() == null)
                .orElseThrow(() -> new BusinessException(404, "优惠不存在"));
    }

    private List<DealResponse> toResponses(List<Deal> deals) {
        Map<Long, Tool> tools = toolMap(deals);
        return deals.stream().map(d -> toResponse(d, tools)).toList();
    }

    private Map<Long, Tool> toolMap(List<Deal> deals) {
        Set<Long> ids = deals.stream()
                .map(Deal::getToolId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        if (ids.isEmpty()) {
            return Map.of();
        }
        Map<Long, Tool> map = new HashMap<>();
        for (Tool t : toolRepository.findAllById(ids)) {
            if (t.getDeletedAt() == null) {
                map.put(t.getId(), t);
            }
        }
        return map;
    }

    private DealResponse toResponse(Deal d, Map<Long, Tool> tools) {
        Tool tool = d.getToolId() == null ? null : tools.get(d.getToolId());
        return new DealResponse(
                d.getId(),
                d.getTitle(),
                d.getDescription(),
                d.getPromoCode(),
                d.getUrl(),
                d.getStartsAt(),
                d.getEndsAt(),
                d.getStatus(),
                d.getToolId(),
                tool == null ? null : tool.getSlug(),
                tool == null ? null : tool.getName(),
                d.getCreatedAt(),
                d.getUpdatedAt()
        );
    }
}
