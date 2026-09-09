package com.zzh.personal_hub.seo;

import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class SeoController {

    private final SeoService seoService;

    @GetMapping(value = "/sitemap.xml", produces = MediaType.APPLICATION_XML_VALUE)
    public ResponseEntity<String> sitemap() {
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_XML)
                .body(seoService.buildSitemapXml());
    }

    @GetMapping(value = "/robots.txt", produces = MediaType.TEXT_PLAIN_VALUE)
    public ResponseEntity<String> robots() {
        return ResponseEntity.ok()
                .contentType(MediaType.TEXT_PLAIN)
                .body(seoService.buildRobotsTxt());
    }
}
