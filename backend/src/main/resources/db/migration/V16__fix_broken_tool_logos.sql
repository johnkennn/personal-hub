-- 三个站外 favicon 失效/占位图：改用前端同域名静态 Logo
UPDATE tool
SET logo_url = '/logos/qwen.png'
WHERE slug = 'qwen'
  AND deleted_at IS NULL;

UPDATE tool
SET logo_url = '/logos/copilot.png'
WHERE slug = 'copilot'
  AND deleted_at IS NULL;

UPDATE tool
SET logo_url = '/logos/tome.png'
WHERE slug = 'tome'
  AND deleted_at IS NULL;
