package com.zzh.personal_hub.seo;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "app.seo")
public class SeoProperties {
    /**
     * 站点对外根地址（不含尾斜杠），写入 sitemap / robots。
     * 本地默认指向 Vite；生产用 PUBLIC_BASE_URL。
     */
    private String publicBaseUrl = "http://localhost:5173";
}
