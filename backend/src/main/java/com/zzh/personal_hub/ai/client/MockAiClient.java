package com.zzh.personal_hub.ai.client;

import org.springframework.util.StringUtils;

import java.util.function.Consumer;

public class MockAiClient implements AiClient {

    @Override
    public String complete(String systemPrompt, String userPrompt) {
        return buildDraft(userPrompt);
    }

    @Override
    public void stream(String systemPrompt, String userPrompt, Consumer<String> onDelta) {
        String full = buildDraft(userPrompt);
        int i = 0;
        while (i < full.length()) {
            int end = Math.min(full.length(), i + 4);
            onDelta.accept(full.substring(i, end));
            i = end;
            try {
                Thread.sleep(18);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                break;
            }
        }
    }

    private String buildDraft(String userPrompt) {
        String brief = userPrompt == null ? "" : userPrompt.replaceAll("\\s+", " ").trim();
        if (!StringUtils.hasText(brief)) {
            return "嗨～小智在呢。说一下你想问什么，或说「搜 + 关键词」找站内产品与评测吧～";
        }
        String clipped = brief.length() > 200 ? brief.substring(0, 200) + "…" : brief;
        return """
                【小智·本地演示】（未调真模型）

                你说：「%s」

                小智先记下来啦～当前是演示回复。配置 app.ai.provider=openai-compatible 并设置 API Key 后，就可以接真大模型啦。
                """.formatted(clipped);
    }
}
