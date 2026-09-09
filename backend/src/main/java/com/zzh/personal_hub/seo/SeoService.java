package com.zzh.personal_hub.seo;

import com.zzh.personal_hub.article.entity.Article;
import com.zzh.personal_hub.article.repository.ArticleRepository;
import com.zzh.personal_hub.project.entity.Project;
import com.zzh.personal_hub.project.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SeoService {

    private static final DateTimeFormatter LASTMOD =
            DateTimeFormatter.ISO_LOCAL_DATE.withZone(ZoneOffset.UTC);

    private final SeoProperties seoProperties;
    private final ArticleRepository articleRepository;
    private final ProjectRepository projectRepository;

    public String buildSitemapXml() {
        String base = normalizeBase(seoProperties.getPublicBaseUrl());
        List<UrlEntry> urls = new ArrayList<>();

        Instant now = Instant.now();
        urls.add(new UrlEntry(base + "/", now, "1.0"));
        urls.add(new UrlEntry(base + "/articles", now, "0.8"));
        urls.add(new UrlEntry(base + "/projects", now, "0.8"));
        urls.add(new UrlEntry(base + "/about", now, "0.5"));

        for (Article a : articleRepository.findByPublishedTrueAndDeletedAtIsNullOrderByCreatedAtDesc()) {
            Instant at = a.getUpdatedAt() != null ? a.getUpdatedAt() : a.getCreatedAt();
            urls.add(new UrlEntry(base + "/articles/" + a.getId(), at, "0.7"));
        }
        for (Project p : projectRepository.findByPublishedTrueAndDeletedAtIsNullOrderByCreatedAtDesc()) {
            Instant at = p.getUpdatedAt() != null ? p.getUpdatedAt() : p.getCreatedAt();
            urls.add(new UrlEntry(base + "/projects/" + p.getId(), at, "0.7"));
        }

        urls.sort(Comparator.comparing(UrlEntry::loc));

        StringBuilder sb = new StringBuilder(2048);
        sb.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
        sb.append("<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n");
        for (UrlEntry u : urls) {
            sb.append("  <url>\n");
            sb.append("    <loc>").append(xmlEscape(u.loc())).append("</loc>\n");
            if (u.lastmod() != null) {
                sb.append("    <lastmod>").append(LASTMOD.format(u.lastmod())).append("</lastmod>\n");
            }
            if (u.priority() != null) {
                sb.append("    <priority>").append(u.priority()).append("</priority>\n");
            }
            sb.append("  </url>\n");
        }
        sb.append("</urlset>\n");
        return sb.toString();
    }

    public String buildRobotsTxt() {
        String base = normalizeBase(seoProperties.getPublicBaseUrl());
        return """
                User-agent: *
                Allow: /
                Disallow: /studio
                Disallow: /admin
                Disallow: /login
                Disallow: /register
                Disallow: /forgot-password
                Disallow: /articles/new
                Disallow: /projects/new

                Sitemap: %s/sitemap.xml
                """.formatted(base);
    }

    private static String normalizeBase(String raw) {
        if (raw == null || raw.isBlank()) {
            return "http://localhost:5173";
        }
        String base = raw.trim();
        while (base.endsWith("/")) {
            base = base.substring(0, base.length() - 1);
        }
        return base;
    }

    private static String xmlEscape(String s) {
        return s.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&apos;");
    }

    private record UrlEntry(String loc, Instant lastmod, String priority) {}
}
