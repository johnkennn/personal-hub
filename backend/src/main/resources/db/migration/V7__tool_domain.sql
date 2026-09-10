-- AI导航：分类 + 工具

CREATE TABLE IF NOT EXISTS tool_category (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(64) NOT NULL,
    slug VARCHAR(64) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_tool_category_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tool (
    id BIGINT NOT NULL AUTO_INCREMENT,
    slug VARCHAR(64) NOT NULL,
    name VARCHAR(120) NOT NULL,
    category_id BIGINT NOT NULL,
    summary VARCHAR(500) NOT NULL,
    intro TEXT NOT NULL,
    audience VARCHAR(500) NULL,
    pricing VARCHAR(120) NOT NULL,
    website_url VARCHAR(500) NOT NULL,
    affiliate_url VARCHAR(500) NULL,
    keywords_json TEXT NULL,
    tags_json TEXT NULL,
    use_cases_json TEXT NULL,
    pros_json TEXT NULL,
    cons_json TEXT NULL,
    featured BIT(1) NOT NULL DEFAULT 0,
    weight INT NOT NULL DEFAULT 0,
    published BIT(1) NOT NULL DEFAULT 0,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    deleted_at DATETIME(6) NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_tool_slug (slug),
    KEY idx_tool_category (category_id),
    KEY idx_tool_published (published, deleted_at),
    CONSTRAINT fk_tool_category
        FOREIGN KEY (category_id) REFERENCES tool_category (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO tool_category (name, slug, sort_order, created_at, updated_at) VALUES
('AI对话', 'ai-chat', 10, NOW(6), NOW(6)),
('AI编程', 'ai-code', 20, NOW(6), NOW(6)),
('AI绘画', 'ai-image', 30, NOW(6), NOW(6)),
('AI视频', 'ai-video', 40, NOW(6), NOW(6)),
('AI办公', 'ai-office', 50, NOW(6), NOW(6));