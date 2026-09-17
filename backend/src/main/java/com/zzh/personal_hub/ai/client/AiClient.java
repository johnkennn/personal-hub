package com.zzh.personal_hub.ai.client;

import java.util.List;
import java.util.function.Consumer;

/**
 * 大模型调用的统一出口。
 * <p>
 * Service 只依赖本接口，不关心背后是本地假数据还是 OpenAI / DeepSeek。
 * 换实现时改 {@link com.zzh.personal_hub.ai.config.AiClientConfig} 即可。
 */
public interface AiClient {

    /** 一次性拿到完整回复（非流式）。 */
    String complete(String systemPrompt, String userPrompt);

    /**
     * 流式输出：每产生一段文字就回调 {@code onDelta}。
     * <p>
     * 约定：实现可在当前线程阻塞直到结束；调用方负责线程与超时。
     */
    void stream(String systemPrompt, String userPrompt, Consumer<String> onDelta);

    /** imageDataUrls：data:image/...;base64,... ；空列表等同纯文本 */
    default void stream(String systemPrompt, String userPrompt,
                        List<String> imageDataUrls, Consumer<String> onDelta) {
        stream(systemPrompt, List.of(), userPrompt, imageDataUrls, onDelta);
    }

    /**
     * 多轮流式：history 为当前 user 之前的 user/assistant 消息；images 仅挂在当前 user。
     */
    default void stream(
            String systemPrompt,
            List<AiChatTurn> history,
            String userPrompt,
            List<String> imageDataUrls,
            Consumer<String> onDelta) {
        stream(systemPrompt, userPrompt, onDelta);
    }
}
