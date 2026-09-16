package com.zzh.personal_hub.ai.service;

import com.zzh.personal_hub.ai.client.AiClient;
import com.zzh.personal_hub.common.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class ChatIntentRouterService {

    /** 站内意图；生成类需求统一为 chat（大模型） */
    private static final Set<String> INTENTS = Set.of(
            "search", "chat", "clarify",
            "deals", "articles", "tools", "discover", "about"
    );

    /** 旧分类器可能仍返回这些，映射为 chat */
    private static final Set<String> LEGACY_GENERATIVE = Set.of(
            "translate", "copywriting", "resume", "summary", "contract"
    );

    private static final String SYSTEM = """
            你是意图分类器。根据用户一句话，只输出一行 JSON（不要 markdown）：
            {"intent":"search|chat|clarify|deals|articles|tools|discover|about","query":"可选，搜产品时的关键词"}
            规则：想找站内 AI 产品/评测 → search；闲聊、问答、翻译、文案、简历、总结、合同等生成类 → chat；打开优惠/评测/导览/发现/关于 → 对应板块；实在不清 → clarify。
            """;

    private final AiClient aiClient;
    private final JsonMapper jsonMapper;

    public Map<String, Object> route(String message) {
        if (!StringUtils.hasText(message)) {
            throw new BusinessException(400, "请输入内容");
        }
        String raw = aiClient.complete(SYSTEM, message.trim());
        String json = extractJson(raw);
        try {
            JsonNode node = jsonMapper.readTree(json);
            String intent = node.path("intent").asString("chat").trim().toLowerCase();
            if (LEGACY_GENERATIVE.contains(intent)) {
                intent = "chat";
            }
            if (!INTENTS.contains(intent)) {
                intent = "chat";
            }
            String query = node.path("query").asString(null);
            Map<String, Object> data = new LinkedHashMap<>();
            data.put("intent", intent);
            if (StringUtils.hasText(query)) {
                data.put("query", query.trim());
            }
            return data;
        } catch (Exception e) {
            throw new BusinessException(502, "意图解析失败");
        }
    }

    private static String extractJson(String raw) {
        if (raw == null) return "{}";
        String s = raw.trim();
        int a = s.indexOf('{');
        int b = s.lastIndexOf('}');
        if (a >= 0 && b > a) return s.substring(a, b + 1);
        return s;
    }
}
