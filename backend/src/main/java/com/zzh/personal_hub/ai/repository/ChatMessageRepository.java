package com.zzh.personal_hub.ai.repository;

import com.zzh.personal_hub.ai.entity.ChatMessageEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ChatMessageRepository extends JpaRepository<ChatMessageEntity, Long> {
    List<ChatMessageEntity> findByConversationIdOrderBySortOrderAscIdAsc(Long conversationId);

    /**
     * 整表替换前先清掉旧消息。必须 bulk delete + flush，
     * 否则同事务里紧接着 insert 会撞上 uk_chat_msg_client。
     */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("delete from ChatMessageEntity m where m.conversationId = :conversationId")
    void deleteByConversationId(@Param("conversationId") Long conversationId);

    long countByConversationId(Long conversationId);

    Optional<ChatMessageEntity> findByConversationIdAndClientMsgId(
        Long conversationId, String clientMsgId);

    @Query("select coalesce(max(m.sortOrder), -1) from ChatMessageEntity m where m.conversationId = :cid")
    int findMaxSortOrder(@Param("cid") Long cid);
}
