# Personal Hub 部署说明（无 Docker）

## 架构

浏览器 → Nginx（静态前端 + 反代 /api）→ Spring Boot jar → MySQL

## 本机构建

### 后端
cd backend
./mvnw -DskipTests package
产物：target/personal-hub-0.0.1-SNAPSHOT.jar

### 前端
cd frontend
npm run build
产物：dist/

## 生产环境变量（后端）

| 变量 | 说明 |
|------|------|
| DB_URL | JDBC 连接串 |
| DB_USERNAME | 数据库用户 |
| DB_PASSWORD | 数据库密码 |
| JWT_SECRET | ≥32 字符密钥 |
| CORS_ALLOWED_ORIGINS | 前端源，多个逗号分隔 |
| ADMIN_BOOTSTRAP_PASSWORD | 仅首次初始化管理员时需要 |
| SPRING_PROFILES_ACTIVE | 设为 prod |

启动示例：
java -jar personal-hub-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod

## 服务器待办（下一步）

- [ ] 购买/准备 Linux 云主机
- [ ] 安装 JRE 21、MySQL、Nginx
- [ ] 上传 jar 与 dist
- [ ] Nginx 配置静态站点与 /api 反代
- [ ] systemd 托管 jar 开机自启