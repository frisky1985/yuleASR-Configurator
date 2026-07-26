# GitHub Actions CI/CD 配置

此目录包含 yuletech-monorepo 的 CI/CD 工作流配置。

## 工作流说明

### 1. CI 工作流 (`ci.yml`)

在每次推送到 `main` 或 `develop` 分支以及创建 Pull Request 时触发。

包含以下任务：

- **lint-and-format**: 运行 ESLint 检查代码规范，并检查代码格式
- **typecheck**: 运行 TypeScript 类型检查
- **test**: 运行所有测试
- **build**: 构建所有包并上传构建产物
- **build-vscode**: 专门构建 VS Code 扩展并打包为 `.vsix` 文件

### 2. Release 工作流 (`release.yml`)

在推送版本标签 (如 `v1.0.0`) 时触发。

包含以下任务：

- **release**: 创建 GitHub Release 并上传 VS Code 扩展包
- **publish-web**: 构建 Web 应用并上传到 GitHub Pages
- **deploy-web**: 部署 Web 应用到 GitHub Pages
- **publish-vscode**: 发布 VS Code 扩展到 Visual Studio Marketplace

### 3. Desktop Build 工作流 (`build-desktop.yml`)

在推送到 `main`/`develop` 分支、创建 Pull Request、推送版本标签或手动触发时执行。

包含以下任务：

- **build-mac**: 构建 macOS 桌面应用 (arm64 + x64)，生成 DMG 和 ZIP 包
- **build-linux**: 构建 Linux 桌面应用，生成 AppImage 和 DEB 包
- **build-win**: 构建 Windows 桌面应用，生成 NSIS 安装程序和 ZIP 包
- **sign-mac**: (可选) 在推送版本标签且配置了签名证书时进行 macOS 代码签名

在推送版本标签时，工作流会自动将构建产物上传到 GitHub Release。

## 必需的环境变量和 Secrets

在 GitHub 仓库设置中添加以下 Secrets：

### VSCE_PAT (必需，用于发布 VS Code 扩展)

1. 访问 https://dev.azure.com 并登录
2. 创建 Personal Access Token (PAT)
3. 访问 https://marketplace.visualstudio.com/manage 创建发布者
4. 在 GitHub 仓库 Settings > Secrets and variables > Actions 中添加 `VSCE_PAT`

### macOS 签名证书 (可选，用于桌面应用签名)

| Secret 名称 | 说明 |
|---|---|
| `MAC_CSC_LINK` | Base64 编码的 macOS 开发者证书 (.p12) |
| `MAC_CSC_KEY_PASSWORD` | 证书私钥密码 |
| `APPLE_ID` | Apple 开发者账号 |
| `APPLE_APP_SPECIFIC_PASSWORD` | App-specific 密码 (用于 notarization) |
| `APPLE_TEAM_ID` | Apple 开发者 Team ID |

如果不配置这些 Secrets，桌面应用仍会构建但不进行代码签名和公证。未签名的应用在 macOS 上会被 Gatekeeper 阻止，建议仅在开发测试时使用。

## 版本发布流程

1. 更新代码并提交
2. 创建新的版本标签：
   ```bash
   git tag -a v1.0.0 -m "Release version 1.0.0"
   git push origin v1.0.0
   ```
3. Release 工作流会自动触发，完成发布流程

## 依赖自动更新

Dependabot 配置 (`.github/dependabot.yml`) 会自动：

- 每周一检查 npm 依赖更新
- 每周一检查 GitHub Actions 更新
- 创建 Pull Request 并打上相应标签

## 故障排除

### 构建失败

检查以下常见原因：

1. **pnpm-lock.yaml 不同步**: 运行 `pnpm install` 并提交更新的 lock 文件
2. **Node.js 版本不匹配**: 确保使用 Node.js 20 或更高版本
3. **类型错误**: 运行 `pnpm typecheck` 检查类型问题

### 发布失败

1. **VS Code 扩展发布失败**: 检查 `VSCE_PAT` 是否有效
2. **GitHub Pages 部署失败**: 确保在仓库设置中启用了 GitHub Pages
