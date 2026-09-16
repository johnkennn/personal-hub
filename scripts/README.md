# 批量种子数据

生成可重复执行的 SQL（工具 / 评测 / 优惠）：

```bash
python3 scripts/gen_seed_bulk_catalog.py
# 产出 scripts/seed_bulk_catalog.sql
```

本地：

```bash
mysql --defaults-extra-file=<(printf '[client]\nuser=root\npassword=YOUR_PASSWORD\n') personal_hub < scripts/seed_bulk_catalog.sql
```

线上（在服务器上读应用环境变量，勿把密码写进仓库）：

```bash
scp scripts/seed_bulk_catalog.sql root@YOUR_HOST:/tmp/
ssh root@YOUR_HOST 'set -a; source /opt/personal-hub/personal-hub.env; set +a; mysql -u "$DB_USERNAME" -p"$DB_PASSWORD" personal_hub < /tmp/seed_bulk_catalog.sql; rm -f /tmp/seed_bulk_catalog.sql'
```

说明：脚本按 slug / `<!--seed:bulk-v1-->` 标记幂等，重复执行不会重复灌评测与种子优惠。
