package com.zzh.personal_hub.ai.controller;

import com.zzh.personal_hub.common.response.ApiResponse;
import com.zzh.personal_hub.media.ChatTempStorageService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 聊天临时附件：存磁盘 chat-temp/，带 TTL，供前端上传后引用。
 */
@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatAttachmentController {

    private final ChatTempStorageService chatTempStorageService;

    @PostMapping("/attachments")
    public ApiResponse<Map<String, Object>> upload(
            @RequestParam("file") MultipartFile file,
            HttpServletRequest request) {
        var saved = chatTempStorageService.save(file, clientIp(request));
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("id", saved.id());
        data.put("url", saved.url());
        data.put("originalName", saved.originalName());
        data.put("contentType", saved.contentType());
        data.put("sizeBytes", saved.sizeBytes());
        data.put("expiresAt", saved.expiresAt().toString());
        return ApiResponse.success(data);
    }

    private static String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr() == null ? "unknown" : request.getRemoteAddr();
    }
}