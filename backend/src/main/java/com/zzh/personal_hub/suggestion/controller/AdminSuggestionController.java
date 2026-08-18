package com.zzh.personal_hub.suggestion.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;

import lombok.RequiredArgsConstructor;

import com.zzh.personal_hub.suggestion.service.SuggestionService;
import com.zzh.personal_hub.suggestion.dto.AdminSuggestionResponse;
import com.zzh.personal_hub.common.response.ApiResponse;

import java.util.List;

@RestController
@RequestMapping("/api/admin/suggestions")
@RequiredArgsConstructor
public class AdminSuggestionController {
    
    private final SuggestionService suggestionService;

    @GetMapping
    public ApiResponse<List<AdminSuggestionResponse>> list() {
        return ApiResponse.success(suggestionService.listAllForAdmin());
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        suggestionService.deleteByAdmin(id);
        return ApiResponse.success(null);
    }
}
