-- AI 工具 Logo

ALTER TABLE tool
    ADD COLUMN logo_url VARCHAR(512) NULL AFTER website_url;

-- 用官网域名回填可读 Logo（管理端仍可改成站内上传图）
UPDATE tool
SET logo_url = CONCAT(
        'https://www.google.com/s2/favicons?domain=',
        SUBSTRING_INDEX(
                SUBSTRING_INDEX(
                        REPLACE(REPLACE(TRIM(website_url), 'https://', ''), 'http://', ''),
                        '/',
                        1
                ),
                '?',
                1
        ),
        '&sz=128'
    )
WHERE deleted_at IS NULL
  AND (logo_url IS NULL OR logo_url = '')
  AND website_url IS NOT NULL
  AND TRIM(website_url) <> '';
