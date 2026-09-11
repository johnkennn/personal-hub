package com.zzh.personal_hub.ai.client;

import org.springframework.util.StringUtils;

import java.util.function.Consumer;

public class MockAiClient implements AiClient {

    @Override
    public String complete(String systemPrompt, String userPrompt) {
        return buildDraft(systemPrompt, userPrompt);
    }

    @Override
    public void stream(String systemPrompt, String userPrompt, Consumer<String> onDelta) {
        String full = buildDraft(systemPrompt, userPrompt);
        // 模拟「打字机」：每次吐几个字，方便本地不配 Key 也能验收流式
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

    private String buildDraft(String systemPrompt, String userPrompt) {
        String brief = userPrompt == null ? "" : userPrompt.replaceAll("\\s+", " ").trim();
        String sys = systemPrompt == null ? "" : systemPrompt;

        if (!StringUtils.hasText(brief)) {
            if (sys.contains("翻译")) {
                return "请粘贴要翻译的文本，并说明目标语言（例如：译成英文）。";
            }
            if (sys.contains("简历")) {
                return "请粘贴简历片段或说明目标岗位，我再帮你润色（仅供参考）。";
            }
            if (sys.contains("总结")) {
                return "请粘贴要总结的文字，或上传 .txt / .md 临时附件后再试。";
            }
            return "请先描述卖点、受众与语气，我再帮你写文案。";
        }

        if (sys.contains("简历")) {
            String clipped = brief.length() > 220 ? brief.substring(0, 220) + "…" : brief;
            return """
                    【简历优化演示】（mock，未调真模型）
                    仅供参考，非求职保证。
                    原文摘要：%s
                    建议：用成果量化改写经历；按目标岗对齐关键词；去掉空泛形容词。
                    """.formatted(clipped);
        }

        if (sys.contains("翻译")) {
            String clipped = brief.length() > 220 ? brief.substring(0, 220) + "…" : brief;
            return """
                    【译文演示】
                    （检测到翻译请求；当前为 mock，未调用真模型）
                    原文摘要：%s
                    演示译文：This is a demo translation of your text. Configure app.ai.provider=openai-compatible and set an API key for real results.
                    """.formatted(clipped);
        }

        if (sys.contains("总结")) {
            String clipped = brief.length() > 400 ? brief.substring(0, 400) + "…" : brief;
            return """
                    【内容总结演示】（mock，未调真模型）

                    材料摘要：
                    %s

                    要点：
                    · 已根据你提供的正文做了粗提炼（演示）
                    · 配置 app.ai.provider=openai-compatible 并设置 API Key 后可接真模型出正式摘要
                    """.formatted(clipped);
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
