package com.zzh.personal_hub.ai.client;

/**
 * 发给模型的一轮对话（不含 system）。
 */
public record AiChatTurn(String role, String content) {
}
