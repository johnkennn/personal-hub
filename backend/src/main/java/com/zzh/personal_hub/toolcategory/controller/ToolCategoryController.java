package com.zzh.personal_hub.toolcategory.controller;

import com.zzh.personal_hub.common.response.ApiResponse;
import com.zzh.personal_hub.toolcategory.entity.ToolCategory;
import com.zzh.personal_hub.toolcategory.service.ToolCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/tool-categories")
@RequiredArgsConstructor
public class ToolCategoryController {

    private final ToolCategoryService toolCategoryService;

    @GetMapping
    public ApiResponse<List<ToolCategory>> list() {
        return ApiResponse.success(toolCategoryService.listAll());
    }

    @GetMapping("/{slug}")
    public ApiResponse<ToolCategory> detail(@PathVariable String slug) {
        return ApiResponse.success(toolCategoryService.getBySlug(slug));
    }
}
