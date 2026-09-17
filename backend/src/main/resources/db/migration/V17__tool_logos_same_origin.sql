-- 全部工具 Logo 改为站内静态资源，避免外链 favicon 在国内手机端失败
UPDATE tool
SET logo_url = CONCAT('/logos/', slug, '.png')
WHERE deleted_at IS NULL
  AND slug IS NOT NULL
  AND slug <> '';
