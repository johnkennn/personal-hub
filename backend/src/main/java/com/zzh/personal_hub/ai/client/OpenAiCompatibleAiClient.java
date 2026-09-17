package com.zzh.personal_hub.ai.client;

import com.zzh.personal_hub.ai.config.AiProperties;
import com.zzh.personal_hub.common.exception.BusinessException;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;
import org.springframework.http.MediaType;
import org.springframework.util.StringUtils;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Consumer;

/**
 * 对接 OpenAI Chat Completions 兼容协议（OpenAI、DeepSeek、通义兼容模式等）。
 * <p>
 * 非流式：POST /chat/completions → 解析 choices[0].message.content<br>
 * 流式：同一路径加 {@code stream:true}，按 SSE 行解析 choices[0].delta.content
 */
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
        ensureApiKey();
        try {
            HttpResponse<String> response = httpClient.send(
                    buildRequest(systemPrompt, userPrompt, List.of(), false),
                    HttpResponse.BodyHandlers.ofString());
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
        } catch (java.net.http.HttpTimeoutException e) {
            throw new BusinessException(502, "调用模型超时，请稍后重试");
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new BusinessException(502, "调用模型被中断，请稍后重试");
        } catch (Exception e) {
            String detail = e.getMessage();
            if (StringUtils.hasText(detail) && detail.length() > 160) {
                detail = detail.substring(0, 160) + "…";
            }
            throw new BusinessException(502,
                    StringUtils.hasText(detail) ? "调用模型失败：" + detail : "调用模型失败，请稍后重试");
        }
    }

    @Override
    public void stream(String systemPrompt, String userPrompt, Consumer<String> onDelta) {
        stream(systemPrompt, userPrompt, List.of(), onDelta);
    }

    @Override
    public void stream(String systemPrompt, String userPrompt, List<String> imageDataUrls, Consumer<String> onDelta) {
        stream(systemPrompt, List.of(), userPrompt, imageDataUrls, onDelta);
    }

    @Override
    public void stream(
            String systemPrompt,
            List<AiChatTurn> history,
            String userPrompt,
            List<String> imageDataUrls,
            Consumer<String> onDelta) {
        boolean vision = imageDataUrls != null && !imageDataUrls.isEmpty();
        ensureApiKey(vision);
        try {
            HttpResponse<java.io.InputStream> response = httpClient.send(
                    buildRequest(systemPrompt, history, userPrompt, imageDataUrls, true),
                    HttpResponse.BodyHandlers.ofInputStream());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new BusinessException(502, "模型服务暂不可用（HTTP " + response.statusCode() + "）");
            }

            boolean gotAny = false;
            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(response.body(), StandardCharsets.UTF_8))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    if (line.isBlank()) {
                        continue;
                    }
                    if (!line.startsWith("data:")) {
                        continue;
                    }
                    String payload = line.substring(5).trim();
                    if ("[DONE]".equals(payload)) {
                        break;
                    }
                    JsonNode root = jsonMapper.readTree(payload);
                    JsonNode content = root.path("choices").path(0).path("delta").path("content");
                    String piece = content.asString(null);
                    if (StringUtils.hasText(piece)) {
                        gotAny = true;
                        onDelta.accept(piece);
                    }
                }
            }
            if (!gotAny) {
                throw new BusinessException(502, "模型未返回有效内容");
            }
        } catch (BusinessException e) {
            throw e;
        } catch (java.net.http.HttpTimeoutException e) {
            throw new BusinessException(502, "调用模型超时，请稍后重试");
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new BusinessException(502, "调用模型被中断，请稍后重试");
        } catch (Exception e) {
            String detail = e.getMessage();
            if (StringUtils.hasText(detail) && detail.length() > 160) {
                detail = detail.substring(0, 160) + "…";
            }
            throw new BusinessException(502,
                    StringUtils.hasText(detail) ? "调用模型失败：" + detail : "调用模型失败，请稍后重试");
        }
    }

    private void ensureApiKey() {
        ensureApiKey(false);
    }

    private void ensureApiKey(boolean vision) {
        if (vision) {
            boolean hasVisionKey = StringUtils.hasText(aiProperties.getVisionApiKey());
            boolean hasApiKey = StringUtils.hasText(aiProperties.getApiKey());
            if (!hasVisionKey && !hasApiKey) {
                throw new BusinessException(503, "未配置识图 API Key，请设置 app.ai.vision-api-key 或 app.ai.api-key");
            }
            return;
        }
        if (!StringUtils.hasText(aiProperties.getApiKey())) {
            throw new BusinessException(503, "未配置 AI API Key，请使用 mock 或设置 app.ai.api-key");
        }
    }

    private HttpRequest buildRequest(
            String systemPrompt, String userPrompt, List<String> imageDataUrls, boolean stream) throws Exception {
        return buildRequest(systemPrompt, List.of(), userPrompt, imageDataUrls, stream);
    }

    private HttpRequest buildRequest(
            String systemPrompt,
            List<AiChatTurn> history,
            String userPrompt,
            List<String> imageDataUrls,
            boolean stream) throws Exception {
        boolean vision = imageDataUrls != null && !imageDataUrls.isEmpty();
        String model = vision
                ? (StringUtils.hasText(aiProperties.getVisionModel())
                    ? aiProperties.getVisionModel()
                    : aiProperties.getModel())
                : aiProperties.getModel();
        if (vision && !StringUtils.hasText(model)) {
            throw new BusinessException(503, "未配置识图模型，请设置 app.ai.vision-model 或 app.ai.model");
        }

        String base = vision && StringUtils.hasText(aiProperties.getVisionBaseUrl())
                ? aiProperties.getVisionBaseUrl()
                : aiProperties.getBaseUrl();
        String key = vision && StringUtils.hasText(aiProperties.getVisionApiKey())
                ? aiProperties.getVisionApiKey()
                : aiProperties.getApiKey();

        Object userContent;
        if (!vision) {
            userContent = userPrompt;
        } else {
            List<Map<String, Object>> parts = new java.util.ArrayList<>();
            parts.add(Map.of("type", "text", "text", userPrompt));
            for (String dataUrl : imageDataUrls) {
                parts.add(Map.of(
                        "type", "image_url",
                        "image_url", Map.of("url", dataUrl)
                ));
            }
            userContent = parts;
        }

        List<Map<String, Object>> messages = new java.util.ArrayList<>();
        messages.add(Map.of("role", "system", "content", systemPrompt));
        if (history != null) {
            for (AiChatTurn turn : history) {
                if (turn == null || !StringUtils.hasText(turn.content())) {
                    continue;
                }
                String role = turn.role() == null ? "" : turn.role().trim().toLowerCase();
                if (!"user".equals(role) && !"assistant".equals(role)) {
                    continue;
                }
                messages.add(Map.of("role", role, "content", turn.content().trim()));
            }
        }
        messages.add(Map.of("role", "user", "content", userContent));

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("model", model);
        body.put("messages", messages);
        body.put("temperature", 0.7);
        body.put("stream", stream);

        String json = jsonMapper.writeValueAsString(body);
        String url = trimSlash(base) + "/chat/completions";
        return HttpRequest.newBuilder()
                .uri(URI.create(url))
                .timeout(Duration.ofMillis(Math.max(5000, aiProperties.getTimeoutMs())))
                .header("Authorization", "Bearer " + key)
                .header("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                .header("Accept", stream ? "text/event-stream" : MediaType.APPLICATION_JSON_VALUE)
                .POST(HttpRequest.BodyPublishers.ofString(json))
                .build();
    }

    private String trimSlash(String base) {
        if (base == null || base.isBlank()) {
            return "https://api.openai.com/v1";
        }
        return base.endsWith("/") ? base.substring(0, base.length() - 1) : base;
    }
}
