package com.zzh.personal_hub.ai.controller;

import com.zzh.personal_hub.ai.dto.AiRunRequest;
import com.zzh.personal_hub.ai.dto.AiRunResponse;
import com.zzh.personal_hub.ai.service.AiToolRunService;
import com.zzh.personal_hub.common.response.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api/ai-tools")
@RequiredArgsConstructor
public class AiToolRunController {

    private final AiToolRunService aiToolRunService;

    @PostMapping("/{slug}/run")
    public ApiResponse<AiRunResponse> run(
            @PathVariable String slug,
            @Valid @RequestBody AiRunRequest body,
            HttpServletRequest request) {
        return ApiResponse.success(aiToolRunService.run(slug, body.getPrompt(), request));
    }

    /** 流式生成：SSE 事件 delta / done / error（见 AiToolRunService）。 */
    @PostMapping(value = "/{slug}/run/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter runStream(
            @PathVariable String slug,
            @Valid @RequestBody AiRunRequest body,
            HttpServletRequest request) {
        return aiToolRunService.runStream(slug, body.getPrompt(),null, request);
    }
}
