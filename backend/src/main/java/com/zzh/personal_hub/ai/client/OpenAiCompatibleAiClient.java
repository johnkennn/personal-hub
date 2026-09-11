package com.zzh.personal_hub.ai.client;

import com.zzh.personal_hub.ai.config.AiProperties;
import com.zzh.personal_hub.common.exception.BusinessException;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;
import org.springframework.http.MediaType;
import org.springframework.util.StringUtils;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class OpenAiCompatibleAiClient implements AiClient {

    private final AiProperties aiProperties;
    private final JsonMapper jsonMapper;
    private final HttpClient httpClient;

    public OpenAiCompatibleAiClient(AiProperties aiProperties, JsonMapper jsonMapper) {
        this.aiProperties = aiProperties;
        this.jsonMapper = jsonMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    @Override
    public String complete(String systemPrompt, String userPrompt) {
        if (!StringUtils.hasText(aiProperties.getApiKey())) {
            throw new BusinessException(503, "未配置 AI API Key，请使用 mock 或设置 app.ai.api-key");
        }
        try {
            Map<String, Object> body = new LinkedHashMap<>();
            body.put("model", aiProperties.getModel());
            body.put("messages", List.of(
                    Map.of("role", "system", "content", systemPrompt),
                    Map.of("role", "user", "content", userPrompt)
            ));
            body.put("temperature", 0.7);

            String json = jsonMapper.writeValueAsString(body);
            String url = trimSlash(aiProperties.getBaseUrl()) + "/chat/completions";
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofMillis(Math.max(5000, aiProperties.getTimeoutMs())))
                    .header("Authorization", "Bearer " + aiProperties.getApiKey())
                    .header("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                    .POST(HttpRequest.BodyPublishers.ofString(json))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new BusinessException(502, "模型服务暂不可用（HTTP " + response.statusCode() + "）");
            }
            JsonNode root = jsonMapper.readTree(response.body());
            JsonNode content = root.path("choices").path(0).path("message").path("content");
            String text = content.asString(null);
            if (!StringUtils.hasText(text)) {
                throw new BusinessException(502, "模型未返回有效内容");
            }
            return text.trim();
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            throw new BusinessException(502, "调用模型失败，请稍后重试");
        }
    }

    private String trimSlash(String base) {
        if (base == null || base.isBlank()) {
            return "https://api.openai.com/v1";
        }
        return base.endsWith("/") ? base.substring(0, base.length() - 1) : base;
    }
}
