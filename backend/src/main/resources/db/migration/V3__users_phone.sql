ALTER TABLE users ADD COLUMN phone VARCHAR(20) NULL;

-- 给已有账号占位，保证后续 NOT NULL + 唯一（可按你环境改）
UPDATE users SET phone = CONCAT('1000000', LPAD(id, 4, '0')) WHERE phone IS NULL;

ALTER TABLE users MODIFY phone VARCHAR(20) NOT NULL;
CREATE UNIQUE INDEX uk_users_phone ON users (phone);