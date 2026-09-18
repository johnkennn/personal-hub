package com.zzh.personal_hub.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;

/**
 * 供 Spring Security {@code .cors(Customizer.withDefaults())} 使用。
 * 带 X-Request-Id 等自定义头时浏览器会 OPTIONS 预检；必须由此 Bean 明确放行。
 */
@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource(
            @Value("${app.cors.allowed-origins}") String allowedOrigins) {
        CorsConfiguration config = new CorsConfiguration();
        for (String raw : allowedOrigins.split(",")) {
            String origin = raw.trim();
            if (!origin.isEmpty()) {
                config.addAllowedOriginPattern(origin);
            }
        }
        if (config.getAllowedOriginPatterns() == null || config.getAllowedOriginPatterns().isEmpty()) {
            config.addAllowedOriginPattern("http://localhost:5173");
        }
        config.addAllowedMethod(CorsConfiguration.ALL);
        config.addAllowedHeader(CorsConfiguration.ALL);
        config.addExposedHeader("X-Request-Id");
        config.setAllowCredentials(false);
        config.setMaxAge(3600L);

        // Filter 阶段直接返回配置，避免 UrlBased 路径匹配在 Security 链里异常
        return request -> config;
    }
}
