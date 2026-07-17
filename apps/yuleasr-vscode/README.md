# yuleASR Configurator for VS Code

<p align="center">
  <img src="https://img.shields.io/badge/VS_Code-^1.80.0-007ACC?style=flat-square&logo=visualstudiocode" alt="VS Code">
  <img src="https://img.shields.io/badge/TypeScript-5.6+-blue?style=flat-square&logo=typescript" alt="TypeScript">
</p>

在 VS Code 中可视化配置 yuleASR AutoSAR BSW 模块。

---

## 功能特性

- 🛠️ **可视化配置编辑器** - 通过 Webview 提供直观的参数编辑
- 🌀 **配置文件浏览器** - 树形结构展示项目中的所有 yuleASR 配置
- ✅ **实时验证** - 配置修改时自动检查错误
- 📤 **Git 同步** - 与 yuleASR 代码仓库双向同步
- 💻 **代码生成** - 一键生成 BSW 配置代码

---

## 安装

从 VS Code Marketplace 安装：

```
搜索: yuleASR Configurator
```

或从 VSIX 安装：

```bash
code --install-extension yuleasr-vscode-0.1.0.vsix
```

---

## 使用

### 打开配置文件

1. 在资源管理器中找到 `.yuleasr` 配置文件
2. 点击右键选择 "Open with yuleASR Configurator"
3. 或使用命令面板: `yuleASR: Open Config`

### 常用命令

| 命令                        | 说明            |
| --------------------------- | --------------- |
| `yuleASR: Open Config`      | 打开配置文件    |
| `yuleASR: Refresh Explorer` | 刷新配置浏览器  |
| `yuleASR: Sync Config`      | 与 Git 仓库同步 |
| `yuleASR: Validate Config`  | 验证当前配置    |
| `yuleASR: Generate Code`    | 生成 BSW 代码   |

---

## 配置

在 `.vscode/settings.json` 中配置：

```json
{
  "yuleasr.repoPath": "/path/to/yuleASR",
  "yuleasr.configDir": "configs",
  "yuleasr.autoValidate": true
}
```

---

## 开发

```bash
# 安装依赖
pnpm install

# 编译
pnpm run build

# 打包
pnpm run package

# 测试
pnpm test
```

---

## 贡献

请参阅主项目 [CONTRIBUTING.md](../../CONTRIBUTING.md)

---

## 授权

MIT License - 详见 [LICENSE](../../LICENSE)
