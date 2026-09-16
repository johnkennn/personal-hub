-- 评测 ↔ AI 工具（多对多）

CREATE TABLE IF NOT EXISTS article_tool (
    article_id BIGINT NOT NULL,
    tool_id BIGINT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    PRIMARY KEY (article_id, tool_id),
    KEY idx_article_tool_tool (tool_id),
    CONSTRAINT fk_article_tool_article
        FOREIGN KEY (article_id) REFERENCES article (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_article_tool_tool
        FOREIGN KEY (tool_id) REFERENCES tool (id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
