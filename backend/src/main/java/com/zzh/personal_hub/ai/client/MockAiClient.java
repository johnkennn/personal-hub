package com.zzh.personal_hub.ai.client;

import org.springframework.util.StringUtils;

public class MockAiClient implements AiClient {

    @Override
    public String complete(String systemPrompt, String userPrompt) {
        String brief = userPrompt == null ? "" : userPrompt.replaceAll("\\s+", " ").trim();
        if (!StringUtils.hasText(brief)) {
            return "请先描述卖点、受众与语气，我再帮你写文案。";
        }
        String clipped = brief.length() > 180 ? brief.substring(0, 180) + "…" : brief;
        return """
                【商品描述草稿】

                根据你提供的信息：「%s」

                标题建议：一款贴近真实需求的好物，细节看得见。

                正文：
                它把核心卖点说清楚——好用、好懂、好下手。无论你是日常自用还是送礼，都能快速看懂亮点与适用场景。

                卖点速览：
                · 突出你提到的关键优势，减少选择成本
                · 语气可按你的偏好再调得更专业或更亲切
                · 适合详情页首屏与短视频口播提纲

                需要我改成更短 / 更正式 / 更口语，直接继续说即可。

                （当前为演示生成；配置 app.ai.provider=openai-compatible 并设置 API Key 后可接真模型）
                """.formatted(clipped);
    }
}
