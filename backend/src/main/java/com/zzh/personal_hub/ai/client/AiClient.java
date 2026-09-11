package com.zzh.personal_hub.ai.client;

public interface AiClient {
    String complete(String systemPrompt, String userPrompt);
}
