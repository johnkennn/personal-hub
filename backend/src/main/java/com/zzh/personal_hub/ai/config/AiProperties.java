package com.zzh.personal_hub.ai.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "app.ai")
public class AiProperties {
    /** mock | openai-compatible */
    private String provider = "mock";
    private String baseUrl = "https://api.openai.com/v1";
    private String apiKey = "";
    private String model = "gpt-4o-mini";
    private int guestDailyQuota = 5;
    private int userDailyQuota = 30;
    private int timeoutMs = 45000;
    /** false：暂不限额（演示期）；接真模型后改 true */
    private boolean quotaEnabled = false;
    /** 识图模型；空则回退到 model（DeepSeek-Flash 等可兼用文字+识图） */
    private String visionModel = "";
    /** 识图接口根；空则复用 baseUrl */
    private String visionBaseUrl = "";
    /** 识图 Key；空则复用 apiKey */
    private String visionApiKey = "";
}
