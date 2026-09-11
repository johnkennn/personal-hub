package com.zzh.personal_hub.ai.client;

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
}
