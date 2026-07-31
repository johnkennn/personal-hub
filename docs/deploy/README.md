# Personal Hub 部署说明（无 Docker）

> 目标环境：Linux 云主机（已在阿里云 ECS / Alibaba Cloud Linux 验证）  
> 架构：浏览器 → Nginx（静态前端 + `/api` 反代）→ Spring Boot jar → MySQL（本机）

**不要把真实密码、JWT 密钥提交到 git。** 下文一律用占位符。

---

## 1. 架构与端口

```
Internet
   │
   ▼
:80  Nginx
   ├─ /          → /var/www/personal-hub   (前端 dist)
   └─ /api/      → http://127.0.0.1:8080   (jar)
                      │
                      ▼
                   :3306 MySQL (仅 127.0.0.1)
```

| 端口 | 是否对公网开放 | 说明 |
|------|----------------|------|
| 22 | 是 | SSH |
| 80 | 是 | HTTP（Nginx） |
| 443 | 以后 | HTTPS |
| 8080 | **否** | 仅本机，经 Nginx 反代 |
| 3306 | **否** | 仅本机 |

安全组建议：放行 22、80；删除无用的 3389；不要放行 8080/3306。

---

## 2. 目录约定

| 路径 | 用途 |
|------|------|
| `/var/www/personal-hub/` | 前端静态文件（`dist` 内容） |
| `/opt/personal-hub/personal-hub-*.jar` | 后端 jar |
| `/opt/personal-hub/personal-hub.env` | 生产环境变量（权限 `600`） |
| `/etc/nginx/conf.d/personal-hub.conf` | 站点配置 |
| `/etc/systemd/system/personal-hub.service` | 后端守护进程 |

---

## 3. 本机构建产物

### 后端

```bash
cd backend
./mvnw -DskipTests package
# 产物：target/personal-hub-0.0.1-SNAPSHOT.jar
```

### 前端（同源部署）

`frontend/.env.production`：

```env
VITE_API_BASE_URL=
```

空字符串表示请求走当前站点的 `/api/...`（由 Nginx 反代）。

```bash
cd frontend
npm run build
# 产物：dist/
```

---

## 4. 服务器软件安装

以 Alibaba Cloud Linux / RHEL 系为例（`dnf`）。Ubuntu 则改用 `apt`。

### 4.1 Java 21

```bash
dnf search java-21 | head -40
# 阿里云常见包名：
dnf install -y java-21-alibaba-dragonwell-headless
java -version   # 应显示 21
```

### 4.2 MySQL

```bash
dnf install -y mysql-server
systemctl enable --now mysqld
# 查看服务名（写 systemd 时要用）：
systemctl list-units --type=service --all | grep -iE 'mysql|mariadb'
```

首次进入并建库（密码自定，勿提交 git）：

```bash
mysql -u root
# 若有临时密码：grep 'temporary password' /var/log/mysqld.log
```

```sql
ALTER USER 'root'@'localhost' IDENTIFIED BY 'YOUR_ROOT_PASSWORD';
CREATE DATABASE personal_hub DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'hub'@'localhost' IDENTIFIED BY 'YOUR_HUB_PASSWORD';
GRANT ALL PRIVILEGES ON personal_hub.* TO 'hub'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

确认只监听本机：

```bash
ss -lntp | grep 3306
# 期望看到 127.0.0.1:3306，不要是 0.0.0.0:3306
```

### 4.3 Nginx

```bash
dnf install -y nginx
systemctl enable --now nginx
```

### 4.4 可选：rsync

低配机可只用 `scp`。若要用 rsync，服务器也需安装：

```bash
dnf install -y rsync
```

---

## 5. SSH 登录（多电脑）

本机已有密钥时（例：`~/.ssh/id_ed25519`）：

```bash
# 本机
cat ~/.ssh/id_ed25519.pub
ssh-copy-id -i ~/.ssh/id_ed25519.pub root@YOUR_PUBLIC_IP
```

`~/.ssh/config` 示例：

```sshconfig
Host personal-hub
  HostName YOUR_PUBLIC_IP
  User root
  Port 22
  IdentityFile ~/.ssh/id_ed25519
```

之后：`ssh personal-hub`。

换电脑：在新电脑生成密钥，把**公钥**追加到服务器 `~/.ssh/authorized_keys`（不要覆盖旧行）。

---

## 6. Nginx 站点配置

### 6.1 写入站点

```bash
mkdir -p /var/www/personal-hub

cat > /etc/nginx/conf.d/personal-hub.conf << 'EOF'
server {
    listen 80 default_server;
    server_name _;

    root /var/www/personal-hub;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF
```

### 6.2 关掉主配置里默认的 `listen 80`

Alibaba Cloud Linux 的 `/etc/nginx/nginx.conf` 里常自带一个 `server { listen 80; ... }`，会与上面冲突（`conflicting server name "_"`）。

```bash
cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.bak
# 编辑 nginx.conf：把默认 server 块中未注释的 listen 80 整段注释掉
# 保留：include /etc/nginx/conf.d/*.conf;
grep -n 'listen' /etc/nginx/nginx.conf
nginx -t
systemctl reload nginx
```

浏览器访问 `http://YOUR_PUBLIC_IP` 应由本站点响应（先占位页或前端均可）。

---

## 7. 上传前端

本机：

```bash
cd frontend
npm run build

# 低配 / 未装 rsync：
scp -r dist/. root@YOUR_PUBLIC_IP:/var/www/personal-hub/

# 或：
# rsync -avz --delete dist/ root@YOUR_PUBLIC_IP:/var/www/personal-hub/
```

---

## 8. 上传后端与环境变量

### 8.1 上传 jar

```bash
# 本机
scp backend/target/personal-hub-0.0.1-SNAPSHOT.jar root@YOUR_PUBLIC_IP:/opt/personal-hub/
```

服务器：

```bash
mkdir -p /opt/personal-hub
```

### 8.2 环境变量文件

**重要：**

1. Spring Boot **不会**自动读取该文件；靠 systemd 的 `EnvironmentFile=`，或手动 `source` 后再起 `java`。
2. `DB_URL` 中的 `&` 在 `source` 时会被 shell 当成后台符，**必须用引号包住整段 URL**。

```bash
cat > /opt/personal-hub/personal-hub.env << 'EOF'
SPRING_PROFILES_ACTIVE=prod
DB_URL='jdbc:mysql://127.0.0.1:3306/personal_hub?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Shanghai'
DB_USERNAME=hub
DB_PASSWORD=YOUR_HUB_PASSWORD
JWT_SECRET=YOUR_JWT_SECRET_AT_LEAST_32_CHARS
CORS_ALLOWED_ORIGINS=http://YOUR_PUBLIC_IP
ADMIN_BOOTSTRAP_PASSWORD=YOUR_FIRST_ADMIN_PASSWORD
EOF
chmod 600 /opt/personal-hub/personal-hub.env
```

手动验证（应打印完整 jdbc 串，且不应出现 `[1]- Done`）：

```bash
set -a && source /opt/personal-hub/personal-hub.env && set +a
echo "DB_URL=$DB_URL"
```

| 变量 | 说明 |
|------|------|
| `DB_URL` | JDBC；含 `&` 时务必加引号 |
| `DB_USERNAME` / `DB_PASSWORD` | 建议用 `hub`，不要用 root 跑应用 |
| `JWT_SECRET` | ≥32 字符随机串 |
| `CORS_ALLOWED_ORIGINS` | 前端源，如 `http://IP` 或以后的域名；多个逗号分隔 |
| `ADMIN_BOOTSTRAP_PASSWORD` | 仅库中尚无管理员时用于初始化；有管理员后可留空 |
| `SPRING_PROFILES_ACTIVE` | `prod` |

### 8.3 首次启动（建表）

生产配置默认 `ddl-auto: validate`。空库无表会启动失败。  
**第一次**在服务器手动带 `update` 建表：

```bash
cd /opt/personal-hub
set -a && source ./personal-hub.env && set +a

java -Xms128m -Xmx384m -jar personal-hub-0.0.1-SNAPSHOT.jar \
  --spring.jpa.hibernate.ddl-auto=update
```

（2G 内存机器建议限制堆：`-Xmx384m`。）

看到 `Started` 后，另开 SSH：

```bash
curl -s http://127.0.0.1:8080/api/articles
curl -s http://127.0.0.1/api/articles
```

确认 JSON 正常后，用 `Ctrl+C` 停掉前台进程，再交给 systemd（**不要再带** `ddl-auto=update`）。

---

## 9. systemd 开机自启

先确认 MySQL 服务名（常见 `mysqld` / `mysql` / `mariadb`）：

```bash
systemctl list-units --type=service --all | grep -iE 'mysql|mariadb'
```

写入 unit（把 `mysqld.service` 换成你的实际名字）：

```bash
cat > /etc/systemd/system/personal-hub.service << 'EOF'
[Unit]
Description=Personal Hub Backend
After=network.target mysqld.service
Wants=mysqld.service

[Service]
Type=simple
WorkingDirectory=/opt/personal-hub
EnvironmentFile=/opt/personal-hub/personal-hub.env
ExecStart=/usr/bin/java -Xms128m -Xmx384m -jar /opt/personal-hub/personal-hub-0.0.1-SNAPSHOT.jar
Restart=on-failure
RestartSec=5
User=root

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now personal-hub
systemctl status personal-hub --no-pager
```

常用命令：

```bash
systemctl status personal-hub
systemctl restart personal-hub
journalctl -u personal-hub -n 100 --no-pager
journalctl -u personal-hub -f
```

验收：断开 SSH 再连，`curl http://127.0.0.1/api/articles` 仍通；浏览器打开站点 Blog/Projects 正常。

---

## 10. 更新发布（换机后日常）

### 更新前端

```bash
cd frontend
# 确认 .env.production 仍是 VITE_API_BASE_URL=
npm run build
scp -r dist/. root@YOUR_PUBLIC_IP:/var/www/personal-hub/
```

### 更新后端

```bash
cd backend
./mvnw -DskipTests package
scp target/personal-hub-0.0.1-SNAPSHOT.jar root@YOUR_PUBLIC_IP:/opt/personal-hub/
ssh root@YOUR_PUBLIC_IP 'systemctl restart personal-hub'
```

表结构已存在后，**不要**再使用 `ddl-auto=update` 作为常规手段；结构变更应走迁移方案（后续可引入 Flyway 等）。

---

## 11. 踩坑速查

| 现象 | 原因 | 处理 |
|------|------|------|
| 浏览器 `/api/*` 返回 **502** | jar 未运行或未听 8080 | `systemctl status personal-hub`；`ss -lntp \| grep 8080`；看 journalctl |
| 日志：`jdbcUrl, ${DB_URL}` | 环境变量未进入 Java 进程 | 用 systemd `EnvironmentFile=`，或先 `source` 再启动；检查 `echo $DB_URL` |
| `source` 后 `DB_URL` 为空，出现 `[1]- Done` | URL 里的 `&` 被 shell 拆成后台任务 | `DB_URL='jdbc:mysql://...?a=1&b=2'` 加引号 |
| `nginx -t`：`conflicting server name "_"` | `nginx.conf` 与 `conf.d` 两个 server 抢 80 | 注释掉 `nginx.conf` 默认 server |
| 生产启动：validate / 缺表 | 空库尚未建表 | 首次用 `--spring.jpa.hibernate.ddl-auto=update` |
| `rsync: command not found`（远端） | 服务器未装 rsync | `dnf install -y rsync` 或改用 `scp` |
| 本机 `ssh`：`Permission denied (publickey)` | 只开了密钥登录且本机无对应私钥 | 控制台 Workbench / 绑定密钥 / `authorized_keys` |
| 内存紧张、进程消失 | 2G 上 Java+MySQL OOM | 保持 `-Xmx384m`；必要时给 MySQL 降内存或加 swap |

---

## 12. 服务器清单（可勾选）

- [x] 购买/准备 Linux 云主机
- [x] 安全组：22、80；关闭 8080/3306 公网
- [x] 安装 JRE 21、MySQL、Nginx
- [x] SSH 密钥登录
- [x] Nginx 站点 + `/api` 反代
- [x] 上传前端 `dist` 与后端 jar
- [x] `personal-hub.env` + 首次 `update` 建表
- [x] systemd 托管并开机自启
- [ ] 域名解析 + HTTPS（443）
- [ ] 数据库迁移工具（Flyway 等）

---

## 13. 换机最短路径（摘要）

1. 新机：装 Java 21、MySQL、Nginx；建库用户；安全组 22/80  
2. 配 Nginx（注意关掉默认 `listen 80`）  
3. 上传 `dist` → `/var/www/personal-hub`  
4. 上传 jar；写好带引号的 `personal-hub.env`  
5. 首次 `java ... ddl-auto=update` 建表  
6. 启用 `personal-hub.service`  
7. `curl` 本机 8080 与经 80 的 `/api`；浏览器验收  

完成后站点形如：`http://YOUR_PUBLIC_IP`。
