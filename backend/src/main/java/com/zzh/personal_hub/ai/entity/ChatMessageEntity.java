package com.zzh.personal_hub.ai.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "chat_message")
public class ChatMessageEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "conversation_id", nullable = false)
    private Long conversationId;

    /** 前端消息 id，用于幂等替换 */
    @Column(name = "client_msg_id", nullable = false, length = 64)
    private String clientMsgId;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder;

    /** 前端 ChatMessage JSON */
    @Column(nullable = false, columnDefinition = "MEDIUMTEXT")
    private String payload;

    @Column(name = "created_at_ms", nullable = false)
    private long createdAtMs;
}
