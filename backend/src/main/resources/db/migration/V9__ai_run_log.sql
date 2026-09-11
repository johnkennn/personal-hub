-- AI 技能运行日志（配额统计）

CREATE TABLE IF NOT EXISTS ai_run_log (
    id BIGINT NOT NULL AUTO_INCREMENT,
    slug VARCHAR(64) NOT NULL,
    user_id BIGINT NULL,
    client_key VARCHAR(128) NOT NULL,
    created_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    KEY idx_ai_run_day (slug, client_key, created_at),
    KEY idx_ai_run_user (user_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
