package com.zzh.personal_hub.ai.controller;

import com.zzh.personal_hub.common.response.ApiResponse;

import java.util.Map;

import com.zzh.personal_hub.ai.dto.ChatRouteRequest;
import com.zzh.personal_hub.ai.dto.ChatStreamRequest;
import com.zzh.personal_hub.ai.service.AiToolRunService;
import com.zzh.personal_hub.ai.service.ChatIntentRouterService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

/**
 * 统一聊天门面：前端只认 /api/chat；内部仍复用 AiToolRunService。
 * 以后可在此做服务端意图路由，而不改前端协议。
 */
@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final AiToolRunService aiToolRunService;
    private final ChatIntentRouterService chatIntentRouterService;

    @PostMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream(
            @Valid @RequestBody ChatStreamRequest body,
            HttpServletRequest request) {
        return aiToolRunService.runStream(
            body.getIntent(), 
            body.getMessage(), 
            body.getAttachmentUrls(),
            request
        );
    }

    @PostMapping("/route")
    public ApiResponse<Map<String, Object>> route(@Valid @RequestBody ChatRouteRequest body) {
        return ApiResponse.success(chatIntentRouterService.route(body.getMessage()));
    }
}