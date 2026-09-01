package com.zzh.personal_hub.notification.entity;

import com.zzh.personal_hub.notification.NotificationType;
import jakarta.persistence.*;
import lombok.Data;

import java.time.Instant;

@Data
@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 接收者（被通知的人） */
    @Column(name = "receiver_id", nullable = false)
    private Long receiverId;

    /** 动作发起者（点赞/评论/关注的人） */
    @Column(name = "actor_id", nullable = false)
    private Long actorId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private NotificationType type;

    /** 可选：关联内容类型 ARTICLE / PROJECT；关注可为空 */
    @Column(name = "target_type", length = 32)
    private String targetType;

    @Column(name = "target_id")
    private Long targetId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "read_at")
    private Instant readAt; // null = 未读
}