package com.zzh.personal_hub.notification.dto;

import lombok.Data;
import com.zzh.personal_hub.notification.NotificationType;
import java.time.Instant;

@Data
public class NotificationResponse {
    private Long id;
    private Long actorId;
    private String actorUsername;
    private NotificationType type;
    private String targetType;
    private Long targetId;
    private Instant createdAt;
    private Boolean read;
}
