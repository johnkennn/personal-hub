package com.zzh.personal_hub.ai.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

import lombok.Data;

@Data
public class ChatStreamRequest {
    /** 流式意图：主要为 chat；历史技能 slug 后端会归一到 chat */
    @NotBlank(message = "请指定意图")
    @Size(max = 64)
    private String intent;

    @NotBlank(message = "请输入内容")
    @Size(max = 4000, message = "内容过长")
    private String message;

    /** 可选：临时附件公开路径，如 /media/chat-temp/20260911/xxx.txt */
    private List<String> attachmentUrls;

    /**
     * 可选：本轮之前的对话上下文（不含本轮 message）。
     * 服务端会再做轮数/字数双限制。
     */
    @Valid
    @Size(max = 24, message = "上下文条数过多")
    private List<ChatHistoryItem> history;
}
