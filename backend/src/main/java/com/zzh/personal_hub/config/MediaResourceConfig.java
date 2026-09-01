package com.zzh.personal_hub.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import com.zzh.personal_hub.media.MediaProperties;

import lombok.RequiredArgsConstructor;
import java.nio.file.Path;

@Configuration
@RequiredArgsConstructor
public class MediaResourceConfig implements WebMvcConfigurer {
    private final MediaProperties mediaProperties;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String location = Path.of(mediaProperties.getRootDir())
            .toAbsolutePath()
            .normalize()
            .toUri()
            .toString();
        if (!location.endsWith("/")) {
            location = location + "/";
        }
        registry.addResourceHandler(mediaProperties.getPublicPrefix() + "/**")
            .addResourceLocations(location);
           
    }
}
