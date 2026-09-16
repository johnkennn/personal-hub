package com.zzh.personal_hub.ai.repository;

import com.zzh.personal_hub.ai.entity.ChatConversationEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChatConversationRepository extends JpaRepository<ChatConversationEntity, Long> {
    List<ChatConversationEntity> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<ChatConversationEntity> findByIdAndUserId(Long id, Long userId);
}
