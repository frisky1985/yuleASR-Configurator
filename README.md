# yuleASR Configurator

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-≥20.0.0-green?style=flat-square&logo=node.js" alt="Node.js">
  <img src="https://img.shields.io/badge/pnpm-≥9.0.0-orange?style=flat-square&logo=pnpm" alt="pnpm">
  <img src="https://img.shields.io/badge/TypeScript-5.4+-blue?style=flat-square&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/React-19+-61DAFB?style=flat-square&logo=react" alt="React">
  <img src="https://img.shields.io/badge/VS_Code-Extension-007ACC?style=flat-square&logo=visualstudiocode" alt="VS Code">
</p>

<p align="center">
  <strong>现代化的 yuleASR AutoSAR BSW 模块可视化配置工具</strong>
</p>

---

## 简介

yuleASR Configurator 是一个完整的 AutoSAR BSW（基础软件）模块配置解决方案，提供：

- **Web 可视化编辑器** - 基于 React 的现代 Web 界面
- **VS Code 扩展** - 集成开发环境的原生体验
- **核心库** - 类型安全、可复用的配置引擎
- **多模块支持** - 支持 CAN、ADC、MCU、DEM、DCM 等 10+ 个 BSW 模块

## 快速开始

### 环境要求

- **Node.js** >= 20.0.0
- **pnpm** >= 9.0.0

### 安装

```bash
# 克隆仓库
git clone <repository-url>
cd yuletech-monorepo

# 安装依赖
pnpm install

# 构建所有包
pnpm build
```

### 启动开发环境

```bash
# 启动所有应用（并行开发模式）
pnpm dev

# 仅启动 Web 应用
cd apps/yuleasr-web && pnpm dev

# 仅启动 VS Code 扩展开发
cd apps/yuleasr-vscode && pnpm dev
```

## 项目结构

```
yuletech-monorepo/
├── apps/                          # 应用程序
│   ├── yuleasr-web/              # Web 可视化编辑器
│   └── yuleasr-vscode/           # VS Code 扩展
├── packages/                      # 共享包
│   ├── @yuletech/
│   │   ├── core/                 # 核心类型、校验器和生成器
│   │   ├── ui/                   # React UI 组件库
│   │   ├── utils/                # 工具函数
│   │   └── api-client/           # API 客户端
│   └── yuleasr-editor-core/      # 编辑器核心引擎
├── docs/                          # 文档
├── scripts/                       # 自动化脚本
└── package.json                   # 根配置
```

## 支持的 BSW 模块

| 模块 | 标识 | 描述 |
|------|------|------|
| CAN | CAN | 控制器局域网通信 |
| CAN IF | CANIF | CAN 接口层 |
| ADC | ADC | 模数转换器 |
| MCU | MCU | 微控制器驱动 |
| PORT | PORT | 端口配置 |
| DEM | DEM | 诊断事件管理 |
| DCM | DCM | 诊断通信管理 |
| NVM | NVM | 非易失性存储器 |
| PDUR | PDUR | PDU 路由 |
| COM | COM | 通信服务 |
| IOHWAB | IOHWAB | IO 硬件抽象层 |
| SPI | SPI | SPI 驱动 |

## 功能特性

### Web 编辑器

- 树形模块导航
- 参数可视化编辑
- 实时校验反馈
- 代码生成预览
- 主题切换支持

### VS Code 扩展

- 侧边栏模块浏览器
- JSON/ARXML 配置编辑
- 智能代码补全
- 实时校验诊断
- 一键代码生成

### 核心能力

- **JSON Schema 校验** - 基于 AJV 的高性能校验
- **类型安全** - 完整的 TypeScript 类型定义
- **代码生成** - 自动生成 C 头文件和源文件
- **同步机制** - 与 yuleASR 仓库自动同步
- **扩展架构** - 易于添加新的 BSW 模块

## 使用指南

详见 [docs/usage.md](./docs/usage.md)

## 架构文档

详见 [docs/architecture.md](./docs/architecture.md)

## 开发指南

### 常用命令

```bash
# 运行测试
pnpm test

# 代码检查
pnpm lint

# 自动修复
pnpm lint:fix

# 格式化代码
pnpm format

# 类型检查
pnpm typecheck

# 清理构建产物
pnpm clean
```

### 添加新模块

1. 在 `packages/@yuletech/core/src/schema/generated/` 添加模块 JSON Schema
2. 更新 `packages/@yuletech/core/src/schema/generated/index.ts` 导出
3. 运行 `pnpm sync-schema` 同步类型定义
4. 在 UI 组件中添加模块特定的编辑器

## 发布

### VS Code 扩展

```bash
cd apps/yuleasr-vscode

# 打包扩展
pnpm package

# 发布到市场
pnpm publish-extension
```

需要配置 `VSCE_PAT` 环境变量（Azure DevOps Personal Access Token）。

### NPM 包

```bash
# 创建 changeset
pnpm changeset

# 版本更新
pnpm version-packages

# 发布（需要登录 npm）
pnpm publish -r
```

## 贡献

1. Fork 仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 许可证

[MIT](./LICENSE)

## 联系方式

- **项目主页**: https://github.com/yuletech/yuleasr-configurator
- **问题反馈**: https://github.com/yuletech/yuleasr-configurator/issues
- **邮件联系**: support@yuletech.com

---

<p align="center">
  由 <strong>YuleTech</strong> 团队开发维护
</p>
# Deployment Trigger
