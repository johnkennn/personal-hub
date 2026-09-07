ALTER TABLE notifications
    MODIFY COLUMN type ENUM(
        'LIKE',
        'COMMENT',
        'FOLLOW',
        'UNPUBLISH',
        'SUGGESTION'
    ) NOT NULL;