# yuleASR Configurator - 下一步行动指南

> 本文档提供完整的后续行动计划，确保项目顺利交付和运营。

---

## 🚀 立即执行（高优先级）

### 1. GitHub Pages 部署

由于本地环境无法直接推送到 GitHub，请手动执行以下步骤：

```bash
# 1. 进入项目目录
cd /home/admin/yuletech-monorepo

# 2. 确保所有更新已提交
git status

# 3. 在 GitHub 上创建仓库
# - 访问 https://github.com/new
# - 仓库名: yuleASR-Configurator
# - 私有或公开根据需求

# 4. 添加远程仓库
git remote add origin https://github.com/frisky1985/yuleASR-Configurator.git

# 5. 推送代码
git push -u origin main

# 6. 配置 GitHub Pages
# - 进入仓库 Settings > Pages
# - Source 选择 "GitHub Actions"
# - 工作流 `.github/workflows/deploy-web.yml` 会自动触发部署
```

**GitHub Secrets 配置:**
```
Settings > Secrets and variables > Actions > New repository secret
- VSCE_PAT: 用于 VS Code Marketplace 发布的 Personal Access Token
```

---

### 2. 本地测试验证

测试 Web 端应用：

```bash
# 1. 安装依赖
pnpm install

# 2. 构建核心包
pnpm run build --filter=@yuletech/core
pnpm run build --filter=yuleasr-editor-core

# 3. 启动开发服务器
cd apps/yuleasr-web
pnpm dev

# 4. 访问 http://localhost:5173
```

测试 VS Code 扩展：

```bash
# 1. 在 VS Code 中打开项目
code /home/admin/yuletech-monorepo

# 2. 进入调试视图
# 按 F5 或点击 Run > Start Debugging

# 3. 在新窗口中测试扩展功能
```

运行 E2E 测试：

```bash
cd apps/yuleasr-web

# 安装 Playwright 浏览器
npx playwright install

# 运行测试
pnpm test:e2e

# 查看测试报告
pnpm test:e2e:report
```

---

## 📝 待办事项跟进

### P5-T1: yuleCommunity 集成进度

| 子任务 | 状态 | 说明 |
|--------|------|------|
| yuleCommunity-web 路由 | ✅ 已存在 | /yuleasr, /yuleasr/editor/:id |
| YuleASRPage | ✅ 已存在 | 配置列表页面 |
| YuleASREditorPage | ✅ 已存在 | 配置编辑页面 |
| yuleCommunity-cloud API | ⏳ 待完善 | 需添加 /api/yuleasr/* 接口 |
| 用户会话同步 | ⏳ 待完善 | SSO 和配置关联 |

**API 接口需求:**
```typescript
// yuleCommunity-cloud 需添加的接口
POST   /api/yuleasr/configs          // 创建配置
GET    /api/yuleasr/configs          // 获取配置列表
GET    /api/yuleasr/configs/:id      // 获取单个配置
PUT    /api/yuleasr/configs/:id      // 更新配置
DELETE /api/yuleasr/configs/:id      // 删除配置
POST   /api/yuleasr/configs/:id/build // 触发构建
```

---

## 🎯 产品发展路线图

### 阶段一：功能完善（当前 - 2周）

- [ ] 完成所有 API 接口对接
- [ ] 添加更多 AutoSAR 模块支持（35个 → 50+）
- [ ] 代码生成器完整实现
- [ ] 完善错误处理和用户提示

### 阶段二：性能优化（2-4周）

- [ ] 大配置文件性能优化（>1000参数）
- [ ] 虚拟列表渲染
- [ ] Web Worker 离线验证
- [ ] 配置压缩存储

### 阶段三：生态扩展（4-8周）

- [ ] yuleASR 工具链集成
- [ ] Docker 镜像发布
- [ ] 完整的文档和教程
- [ ] 社区贡献者指南

---

## 💼 运营维护

### 日常工作流

```bash
# 每日开发流程
1. git pull origin main
2. pnpm install 如果依赖有更新
3. 开发功能
4. 运行测试 pnpm test
5. 提交代码 git commit && git push
6. 检查 CI 状态
```

### 发布流程

```bash
# 发布新版本
1. 更新版本号
   cd packages/@yuletech/core
   npm version minor  # 或 patch/major

2. 生成 changelog
   pnpm changeset
   pnpm changeset version

3. 构建和测试
   pnpm run build
   pnpm test

4. 创建发布标签
   git tag -a v1.1.0 -m "Release v1.1.0"
   git push origin v1.1.0

5. GitHub Actions 自动执行：
   - 构建并部署到 GitHub Pages
   - 发布 VS Code 扩展到 Marketplace
   - 创建 GitHub Release
```

### 监控指标

| 指标 | 目标值 | 监控方式 |
|------|--------|---------|
| 页面加载时间 | < 3s | Lighthouse CI |
| 测试覆盖率 | > 80% | Codecov |
| 构建成功率 | > 95% | GitHub Actions |
| 用户活跃度 | - | Google Analytics |

---

## 📚 学习资源

### 核心文档

- [Architecture Overview](./architecture.md)
- [API Reference](./api.md)
- [Contributing Guide](../CONTRIBUTING.md)

### 外部资源

- [AutoSAR 官方文档](https://www.autosar.org/standards/)
- [JSON Schema 规范](https://json-schema.org/)
- [Monaco Editor 文档](https://microsoft.github.io/monaco-editor/)

---

## 💡 常见问题解答

### Q: 配置页面打不开怎么办？
A: 检查 yuleasr-editor-core 是否已构建：`pnpm run build --filter=yuleasr-editor-core`

### Q: VS Code 扩展调试失败？
A: 确保已运行 `pnpm install` 并重启 VS Code 窗口

### Q: E2E 测试失败？
A: 运行 `npx playwright install` 安装浏览器驱动

### Q: 如何添加新的 AutoSAR 模块？
A: 编辑 `scripts/sync-schema.ts` 添加模块定义，然后运行 `npx tsx scripts/sync-schema.ts`

---

## 📞 联系支持

- **技术支持**: tech-support@yuletech.io
- **产品反馈**: feedback@yuletech.io
- **Issue 跟踪**: https://github.com/frisky1985/yuleASR-Configurator/issues

---

*本文档最后更新: 2025-05-11*
