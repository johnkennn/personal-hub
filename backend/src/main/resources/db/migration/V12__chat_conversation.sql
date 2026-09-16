-- 登录用户云端会话 / 消息（访客仍用浏览器本机）

CREATE TABLE IF NOT EXISTS chat_conversation (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    title VARCHAR(80) NOT NULL,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    KEY idx_chat_conv_user_created (user_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS chat_message (
    id BIGINT NOT NULL AUTO_INCREMENT,
    conversation_id BIGINT NOT NULL,
    client_msg_id VARCHAR(64) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    payload MEDIUMTEXT NOT NULL,
    created_at_ms BIGINT NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_chat_msg_client (conversation_id, client_msg_id),
    KEY idx_chat_msg_conv (conversation_id, sort_order),
    CONSTRAINT fk_chat_msg_conv
        FOREIGN KEY (conversation_id) REFERENCES chat_conversation (id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
