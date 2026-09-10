package com.zzh.personal_hub.tool.controller;

import com.zzh.personal_hub.common.response.ApiResponse;
import com.zzh.personal_hub.tool.dto.ToolResponse;
import com.zzh.personal_hub.tool.dto.ToolUpsertRequest;
import com.zzh.personal_hub.tool.service.ToolService;
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
@RequestMapping("/api/admin/tools")
@RequiredArgsConstructor
public class AdminToolController {

    private final ToolService toolService;

    @GetMapping
    public ApiResponse<List<ToolResponse>> list() {
        return ApiResponse.success(toolService.listForAdmin());
    }

    @GetMapping("/{id}")
    public ApiResponse<ToolResponse> detail(@PathVariable Long id) {
        return ApiResponse.success(toolService.getForAdmin(id));
    }

    @PostMapping
    public ApiResponse<ToolResponse> create(@Valid @RequestBody ToolUpsertRequest request) {
        return ApiResponse.success(toolService.create(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<ToolResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody ToolUpsertRequest request) {
        return ApiResponse.success(toolService.update(id, request));
    }

    @PostMapping("/{id}/unpublish")
    public ApiResponse<ToolResponse> unpublish(@PathVariable Long id) {
        return ApiResponse.success(toolService.unpublish(id));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        toolService.softDelete(id);
        return ApiResponse.success(null);
    }
}
