package com.zzh.personal_hub.notification.service;

import java.time.Instant;
import java.util.List;
import java.util.Objects;

import com.zzh.personal_hub.notification.entity.Notification;
import com.zzh.personal_hub.notification.repository.NotificationRepository;
import com.zzh.personal_hub.notification.NotificationType;
import com.zzh.personal_hub.notification.dto.NotificationResponse;
import com.zzh.personal_hub.user.repository.UserRepository;
import com.zzh.personal_hub.common.security.CurrentUserService;
import com.zzh.personal_hub.user.entity.User;
import com.zzh.personal_hub.common.exception.BusinessException;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final CurrentUserService currentUserService;

    @Transactional(readOnly = true)
    public List<NotificationResponse> listMine() {
        User me = currentUserService.requireUser();
        return notificationRepository.findByReceiverIdOrderByCreatedAtDesc(me.getId()).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public long unreadCount() {
        User me = currentUserService.requireUser();
        return notificationRepository.countByReceiverIdAndReadAtIsNull(me.getId());
    }

    @Transactional
    public void markAllRead() {
        User me = currentUserService.requireUser();
        notificationRepository.markAllRead(me.getId(), Instant.now());
    }

    @Transactional
    public void markRead(Long id) {
        User me = currentUserService.requireUser();
        Notification n = notificationRepository.findById(id)
                .orElseThrow(() -> new BusinessException(404, "通知不存在"));
        if(!Objects.equals(n.getReceiverId(), me.getId())) {
            throw new BusinessException(403, "无权操作");
        }
        if(n.getReadAt() != null) return;
        n.setReadAt(Instant.now());
        notificationRepository.save(n);
    }

    @Transactional
    public void notifyFollow(Long actorId, Long followeeId) {
        if(Objects.equals(actorId, followeeId)) return;
        Notification n = new Notification();
        n.setActorId(actorId);
        n.setReceiverId(followeeId);
        n.setType(NotificationType.FOLLOW);
        n.setCreatedAt(Instant.now());
        notificationRepository.save(n);
    }
    
    private NotificationResponse toResponse(Notification n) {
        NotificationResponse dto = new NotificationResponse();
        dto.setId(n.getId());
        dto.setActorId(n.getActorId());
        dto.setCreatedAt(n.getCreatedAt());
        dto.setRead(n.getReadAt() != null);
        dto.setType(n.getType());
        dto.setTargetType(n.getTargetType());
        dto.setTargetId(n.getTargetId());

        userRepository.findById(n.getActorId())
                .ifPresentOrElse(
                    u -> dto.setActorUsername(u.getUsername()),
                    () -> dto.setActorUsername("未知用户")
                );
        return dto;
    }

    @Transactional
    public void notifyLike(Long actorId, Long receiverId, String targetType, Long targetId) {
        if(Objects.equals(actorId, receiverId)) return;
        Notification n = new Notification();
        n.setActorId(actorId);
        n.setReceiverId(receiverId);
        n.setType(NotificationType.LIKE);
        n.setTargetType(targetType);
        n.setTargetId(targetId);
        n.setCreatedAt(Instant.now());
        notificationRepository.save(n);
    }

    @Transactional
    public void notifyComment(Long actorId, Long receiverId, String targetType, Long targetId) {
        if(Objects.equals(actorId, receiverId)) return;
        Notification n = new Notification();
        n.setActorId(actorId);
        n.setReceiverId(receiverId);
        n.setType(NotificationType.COMMENT);
        n.setTargetType(targetType);
        n.setTargetId(targetId);
        n.setCreatedAt(Instant.now());
        notificationRepository.save(n);
    }
}
