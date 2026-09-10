package com.zzh.personal_hub.tool.controller;

import com.zzh.personal_hub.common.response.ApiResponse;
import com.zzh.personal_hub.tool.dto.ToolResponse;
import com.zzh.personal_hub.tool.service.ToolService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/tools")
@RequiredArgsConstructor
public class ToolController {

    private final ToolService toolService;

    @GetMapping
    public ApiResponse<List<ToolResponse>> list(
            @RequestParam(required = false) String category) {
        return ApiResponse.success(toolService.listPublished(category));
    }

    @GetMapping("/{slug}")
    public ApiResponse<ToolResponse> detail(@PathVariable String slug) {
        return ApiResponse.success(toolService.getPublishedBySlug(slug));
    }
}
