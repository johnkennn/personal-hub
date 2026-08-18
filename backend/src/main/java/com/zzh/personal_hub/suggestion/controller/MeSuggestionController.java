package com.zzh.personal_hub.suggestion.controller;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.zzh.personal_hub.suggestion.service.SuggestionService;
import com.zzh.personal_hub.suggestion.dto.SuggestionResponse;
import com.zzh.personal_hub.common.response.ApiResponse;
import com.zzh.personal_hub.suggestion.dto.SuggestionCreateRequest;

import java.util.List;
import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/me/suggestions")
@RequiredArgsConstructor
public class MeSuggestionController {
    
    private final SuggestionService suggestionService;

    @GetMapping
    public ApiResponse<List<SuggestionResponse>> list() {
        return ApiResponse.success(suggestionService.listMine());
    }

    @PostMapping
    public ApiResponse<SuggestionResponse> create(@Valid @RequestBody SuggestionCreateRequest request) {
        return ApiResponse.success(suggestionService.create(request.getContent()));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        suggestionService.delete(id);
        return ApiResponse.success(null);
    }
}
