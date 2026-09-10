package com.zzh.personal_hub.toolcategory.controller;

import com.zzh.personal_hub.common.response.ApiResponse;
import com.zzh.personal_hub.toolcategory.dto.ToolCategoryUpsertRequest;
import com.zzh.personal_hub.toolcategory.entity.ToolCategory;
import com.zzh.personal_hub.toolcategory.service.ToolCategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/tool-categories")
@RequiredArgsConstructor
public class AdminToolCategoryController {

    private final ToolCategoryService toolCategoryService;

    @GetMapping
    public ApiResponse<List<ToolCategory>> list() {
        return ApiResponse.success(toolCategoryService.listAll());
    }

    @PostMapping
    public ApiResponse<ToolCategory> create(@Valid @RequestBody ToolCategoryUpsertRequest request) {
        return ApiResponse.success(toolCategoryService.create(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<ToolCategory> update(
            @PathVariable Long id,
            @Valid @RequestBody ToolCategoryUpsertRequest request) {
        return ApiResponse.success(toolCategoryService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        toolCategoryService.delete(id);
        return ApiResponse.success(null);
    }
}
