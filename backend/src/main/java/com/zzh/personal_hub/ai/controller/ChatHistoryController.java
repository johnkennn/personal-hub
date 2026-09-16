package com.zzh.personal_hub.ai.controller;

import com.zzh.personal_hub.ai.dto.ChatConversationDetailDto;
import com.zzh.personal_hub.ai.dto.ChatConversationSummaryDto;
import com.zzh.personal_hub.ai.dto.CreateChatConversationRequest;
import com.zzh.personal_hub.ai.dto.RenameChatConversationRequest;
import com.zzh.personal_hub.ai.dto.ReplaceChatMessagesRequest;
import com.zzh.personal_hub.ai.service.ChatHistoryService;
import com.zzh.personal_hub.common.response.ApiResponse;
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

/**
 * 登录用户云端会话历史。访客仍用浏览器本机，不走本接口。
 */
@RestController
@RequestMapping("/api/chat/conversations")
@RequiredArgsConstructor
public class ChatHistoryController {

    private final ChatHistoryService chatHistoryService;

    @GetMapping
    public ApiResponse<List<ChatConversationSummaryDto>> list() {
        return ApiResponse.success(chatHistoryService.listMine());
    }

    @PostMapping
    public ApiResponse<ChatConversationDetailDto> create(
            @RequestBody(required = false) CreateChatConversationRequest body) {
        String title = body == null ? null : body.getTitle();
        return ApiResponse.success(chatHistoryService.create(title));
    }

    @GetMapping("/{id}")
    public ApiResponse<ChatConversationDetailDto> get(@PathVariable Long id) {
        return ApiResponse.success(chatHistoryService.getMine(id));
    }

    @PutMapping("/{id}")
    public ApiResponse<ChatConversationSummaryDto> rename(
            @PathVariable Long id,
            @Valid @RequestBody RenameChatConversationRequest body) {
        return ApiResponse.success(chatHistoryService.rename(id, body.getTitle()));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        chatHistoryService.delete(id);
        return ApiResponse.success(null);
    }

    @PutMapping("/{id}/messages")
    public ApiResponse<ChatConversationDetailDto> replaceMessages(
            @PathVariable Long id,
            @Valid @RequestBody ReplaceChatMessagesRequest body) {
        return ApiResponse.success(chatHistoryService.replaceMessages(id, body.getMessages()));
    }

    @PostMapping("/{id}/messages")
    public ApiResponse<ChatConversationDetailDto> upsertMessages(
            @PathVariable Long id,
            @Valid @RequestBody ReplaceChatMessagesRequest body) {
        return ApiResponse.success(chatHistoryService.upsertMessages(id, body.getMessages()));
    }
}
