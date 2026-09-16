package com.zzh.personal_hub.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatConversationDetailDto {
    private Long id;
    private String title;
    private long createdAt;
    private long updatedAt;
    /** 前端 ChatMessage JSON 对象列表 */
    private List<Object> messages;
}
