# yuleASR Configurator — 部署指南

## 快速部署 (一键脚本)

```bash
# 1. 进入项目目录
cd /path/to/yuleASR-Configurator

# 2. 设置执行权限并运行部署脚本
chmod +x deploy/deploy.sh
./deploy/deploy.sh
```

部署脚本会自动完成：

1. **检查系统依赖** — Docker 和 Docker Compose
2. **拉取最新代码** — 从 Git 仓库更新
3. **初始化配置** — 将 `.env.example` 复制为 `.env`（如果不存在）
4. **构建镜像** — `docker compose build`
5. **启动服务** — `docker compose up -d`
6. **健康检查** — 等待所有服务就绪
7. **输出部署信息** — API 地址、文档地址等

## 手动部署

### 1. 系统要求

- Docker >= 20.10
- Docker Compose >= 2.0
- Git

### 2. 克隆代码

```bash
git clone <your-repo-url> yuleASR-Configurator
cd yuleASR-Configurator
```

### 3. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 文件，填入实际配置
```

### 4. 构建并启动

```bash
docker compose build
docker compose up -d
```

### 5. 验证部署

```bash
# 检查服务状态
docker compose ps

# 检查 API 健康状态
curl http://localhost:3000/health

# 查看 API 文档
open http://localhost:3000/docs
```

## 环境变量说明

| 变量名                        | 说明                           | 默认值                                         |
| ----------------------------- | ------------------------------ | ---------------------------------------------- |
| `DATABASE_URL`                | PostgreSQL 连接字符串          | `postgres://yuleasr:***@postgres:5432/yuleasr` |
| `DB_PASSWORD`                 | PostgreSQL 密码                | `changeme`                                     |
| `JWT_SECRET`                  | JWT 签名密钥（生产环境请修改） | `change-this-in-production`                    |
| `FRONTEND_URL`                | 前端页面 URL（用于支付跳转）   | `http://localhost:5173`                        |
| `API_PORT`                    | API 服务宿主机端口映射         | `3000`                                         |
| `PAYMENT_MODE`                | 支付模式：`mock` / `live`      | `mock`                                         |
| `LEMONSQUEEZY_API_KEY`        | LemonSqueezy API 密钥          | —                                              |
| `LEMONSQUEEZY_STORE_ID`       | LemonSqueezy 商店 ID           | —                                              |
| `LEMONSQUEEZY_WEBHOOK_SECRET` | LemonSqueezy Webhook 签名密钥  | —                                              |
| `LEMON_VARIANT_ID_MONTHLY`    | 月付方案 Variant ID            | —                                              |
| `LEMON_VARIANT_ID_YEARLY`     | 年付方案 Variant ID            | —                                              |

## 支付配置

### Mock 模式（开发/测试，无需配置）

`PAYMENT_MODE=mock` 时，系统使用模拟支付流程：

- `POST /api/payment/create-checkout` 返回模拟结账链接
- `POST /api/payment/mock-success` 模拟支付成功并激活 Pro 许可

### 生产模式（LemonSqueezy）

国内用户推荐使用
[LemonSqueezy](https://lemonsqueezy.com)，支持支付宝和微信支付，无需 ICP 备案。

配置步骤：

1. 注册 LemonSqueezy 账号并创建商店
2. 创建月付和年付产品 Variant，记录 Variant ID
3. 在 [API Settings](https://app.lemonsqueezy.com/settings/api) 生成 API Key
4. 在 Store Settings → Webhooks 创建 Webhook：
   - URL: `https://your-domain.com/api/payment/webhook`
   - 勾选事件: `order_created`
   - 记录 Webhook Secret
5. 在 `.env` 中设置：
   ```
   PAYMENT_MODE=live
   LEMONSQUEEZY_API_KEY=your-api-key
   LEMONSQUEEZY_STORE_ID=your-store-id
   LEMONSQUEEZY_WEBHOOK_SECRET=your-webhook-secret
   LEMON_VARIANT_ID_MONTHLY=12345
   LEMON_VARIANT_ID_YEARLY=67890
   ```
6. 重启 API 服务：`docker compose up -d api`

## 常用命令

```bash
# 查看服务状态
docker compose ps

# 查看 API 日志
docker compose logs -f api

# 查看数据库日志
docker compose logs -f postgres

# 重启 API 服务
docker compose restart api

# 停止所有服务
docker compose down

# 停止并删除数据卷（会丢失数据）
docker compose down -v

# 重新构建并启动
docker compose up -d --build
```

## 架构

```
┌─────────────┐    ┌──────────────┐    ┌─────────────────┐
│   Client    │───▶│  API Server  │───▶│   PostgreSQL    │
│ (Frontend)  │    │  (Fastify)   │    │   (Docker)      │
└─────────────┘    └──────┬───────┘    └─────────────────┘
                          │
                          ▼
                   ┌──────────────┐
                   │ LemonSqueezy │
                   │  (支付网关)   │
                   └──────────────┘
```

- **API Server**: Node.js (Fastify) 在 Docker 容器中运行
- **PostgreSQL**: 独立 Docker 容器，数据持久化到 named volume
- **LemonSqueezy**: 支付网关（仅生产模式），通过 Webhook 通知支付结果
