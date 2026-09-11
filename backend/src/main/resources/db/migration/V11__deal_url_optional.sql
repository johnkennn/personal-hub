-- 活动链接改为可选：无链接时前台不展示
ALTER TABLE deal MODIFY COLUMN url VARCHAR(500) NULL;
