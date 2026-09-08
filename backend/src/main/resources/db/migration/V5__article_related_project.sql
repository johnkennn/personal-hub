-- 文章可选关联一个项目（制作特辑 / 构建日志）
ALTER TABLE article
    ADD COLUMN related_project_id BIGINT NULL,
    ADD INDEX idx_article_related_project (related_project_id);