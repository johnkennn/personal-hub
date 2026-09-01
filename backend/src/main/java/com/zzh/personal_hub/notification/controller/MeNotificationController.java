package com.zzh.personal_hub.notification.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.zzh.personal_hub.notification.service.NotificationService;
import com.zzh.personal_hub.notification.dto.NotificationResponse;
import com.zzh.personal_hub.common.response.ApiResponse;
import java.util.List;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/me/notifications")
@RequiredArgsConstructor
public class MeNotificationController {
    private final NotificationService notificationService;
    
    @GetMapping
    public ApiResponse<List<NotificationResponse>> list() {
        return ApiResponse.success(notificationService.listMine());
    }

    @PostMapping("/{id}/read")
    public ApiResponse<Void> markRead(@PathVariable Long id) {
        notificationService.markRead(id);
        return ApiResponse.success(null);
    }

    @PostMapping("/read-all")
    public ApiResponse<Void> markAllRead() {
        notificationService.markAllRead();
        return ApiResponse.success(null);
    }

    @GetMapping("/unread-count")
    public ApiResponse<Long> unreadCount() {
        return ApiResponse.success(notificationService.unreadCount());
    }
}
