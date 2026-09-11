CREATE TABLE IF NOT EXISTS deal (
    id BIGINT NOT NULL AUTO_INCREMENT,
    tool_id BIGINT NULL,
    title VARCHAR(120) NOT NULL,
    description VARCHAR(1000) NOT NULL,
    promo_code VARCHAR(64) NULL,
    url VARCHAR(500) NOT NULL,
    starts_at DATETIME(6) NOT NULL,
    ends_at DATETIME(6) NOT NULL,
    status VARCHAR(16) NOT NULL,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    deleted_at DATETIME(6) NULL,
    PRIMARY KEY (id),
    KEY idx_deal_active (status, starts_at, ends_at, deleted_at),
    KEY idx_deal_tool (tool_id),
    CONSTRAINT fk_deal_tool FOREIGN KEY (tool_id) REFERENCES tool (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 可选种子（按 slug 挂 tool）
INSERT INTO deal (tool_id, title, description, promo_code, url, starts_at, ends_at, status, created_at, updated_at, deleted_at)
SELECT t.id,
       '豆包会员限时礼遇',
       '新用户开通会员可享限时折扣（以官网为准）。',
       NULL,
       'https://www.doubao.com',
       DATE_SUB(NOW(6), INTERVAL 1 DAY),
       DATE_ADD(NOW(6), INTERVAL 14 DAY),
       'ACTIVE',
       NOW(6), NOW(6), NULL
FROM tool t WHERE t.slug = 'doubao' AND t.deleted_at IS NULL LIMIT 1;