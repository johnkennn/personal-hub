package com.zzh.personal_hub.ai.config;

import com.zzh.personal_hub.ai.client.AiClient;
import com.zzh.personal_hub.ai.client.MockAiClient;
import com.zzh.personal_hub.ai.client.OpenAiCompatibleAiClient;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import tools.jackson.databind.json.JsonMapper;

@Configuration
@RequiredArgsConstructor
public class AiClientConfig {

    private final AiProperties aiProperties;
    private final JsonMapper jsonMapper;

    @Bean
    public AiClient aiClient() {
        String provider = aiProperties.getProvider() == null
                ? "mock"
                : aiProperties.getProvider().trim().toLowerCase();
        if ("openai-compatible".equals(provider) || "openai".equals(provider)) {
            return new OpenAiCompatibleAiClient(aiProperties, jsonMapper);
        }
        return new MockAiClient();
    }
}
