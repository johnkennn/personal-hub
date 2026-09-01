package com.zzh.personal_hub.media;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import lombok.Data;

@Data
@Component
@ConfigurationProperties(prefix = "app.media")
public class MediaProperties {
    // 磁盘根目录
    private String rootDir = "./data/media";
    // 对外url前缀
    private String publicPrefix = "/media";
}
