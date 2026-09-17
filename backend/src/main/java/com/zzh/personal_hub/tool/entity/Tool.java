package com.zzh.personal_hub.tool.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "tool")
public class Tool {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 64)
    private String slug;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(name = "category_id", nullable = false)
    private Long categoryId;

    @Column(nullable = false, length = 500)
    private String summary;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String intro;

    @Column(length = 500)
    private String audience;

    @Column(nullable = false, length = 120)
    private String pricing;

    @Column(name = "website_url", nullable = false, length = 500)
    private String websiteUrl;

    /** 产品 Logo，对外路径或绝对 URL */
    @Column(name = "logo_url", length = 512)
    private String logoUrl;

    @Column(name = "affiliate_url", length = 500)
    private String affiliateUrl;

    @Column(name = "keywords_json", columnDefinition = "TEXT")
    private String keywordsJson;

    @Column(name = "tags_json", columnDefinition = "TEXT")
    private String tagsJson;

    @Column(name = "use_cases_json", columnDefinition = "TEXT")
    private String useCasesJson;

    @Column(name = "pros_json", columnDefinition = "TEXT")
    private String prosJson;

    @Column(name = "cons_json", columnDefinition = "TEXT")
    private String consJson;

    @Column(nullable = false)
    private Boolean featured = false;

    @Column(nullable = false)
    private Integer weight = 0;

    /** true = 前台可见 */
    @Column(nullable = false)
    private Boolean published = false;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(nullable = false)
    private Instant updatedAt = Instant.now();

    @Column(name = "deleted_at")
    private Instant deletedAt;
}
