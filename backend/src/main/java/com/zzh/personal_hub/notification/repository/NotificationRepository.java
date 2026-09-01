package com.zzh.personal_hub.notification.repository;

import com.zzh.personal_hub.notification.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByReceiverIdOrderByCreatedAtDesc(Long receiverId);

    @Modifying
    @Query("update Notification n set n.readAt = :now where n.receiverId = :receiverId and n.readAt is null")
    int markAllRead(@Param("receiverId") Long receiverId, @Param("now") Instant now);

    long countByReceiverIdAndReadAtIsNull(Long receiverId);
}