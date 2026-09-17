-- 将 Google favicon 回填改为 DuckDuckGo（国内移动网络更易加载）
-- 仅改写仍指向 google s2 favicons 的记录；站内 /media 上传不受影响

UPDATE tool
SET logo_url = CONCAT(
        'https://icons.duckduckgo.com/ip3/',
        SUBSTRING_INDEX(
                SUBSTRING_INDEX(
                        REPLACE(REPLACE(TRIM(website_url), 'https://', ''), 'http://', ''),
                        '/',
                        1
                ),
                '?',
                1
        ),
        '.ico'
    )
WHERE deleted_at IS NULL
  AND website_url IS NOT NULL
  AND TRIM(website_url) <> ''
  AND (
        logo_url LIKE '%google.com/s2/favicons%'
     OR logo_url LIKE '%gstatic.com/favicon%'
     OR logo_url IS NULL
     OR logo_url = ''
  );
