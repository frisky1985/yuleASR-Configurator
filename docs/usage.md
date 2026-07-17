# yuleASR Configurator 使用指南

## 目录

- [快速开始](#快速开始)
- [Web 端使用](#web-端使用)
- [VS Code 扩展使用](#vs-code-扩展使用)
- [配置管理](#配置管理)
- [验证功能](#验证功能)
- [代码生成](#代码生成)
- [Git 同步](#git-同步)

---

## 快速开始

### 安装

```bash
# 克隆项目
git clone https://github.com/your-org/yuletech-monorepo.git
cd yuletech-monorepo

# 安装依赖
pnpm install

# 构建
pnpm run build
```

### 启动 Web 端

```bash
cd apps/yuleasr-web
pnpm dev
```

访问 http://localhost:5173

### 安装 VS Code 扩展

```bash
cd apps/yuleasr-vscode
pnpm run package
code --install-extension yuleasr-vscode-0.1.0.vsix
```

---

## Web 端使用

### Dashboard 页面

Dashboard 显示所有配置文件列表：

1. **创建配置** - 点击 "新建配置" 按钮
2. **打开配置** - 点击配置卡片
3. **删除配置** - 点击卡片上的删除按钮
4. **复制配置** - 点击卡片上的复制按钮

### Editor 页面

Editor 提供配置编辑功能：

1. **左侧面板** - 模块树形列表
   - 按层级分组（MCAL/ECUAL/Service/RTE/ASW）
   - 支持搜索筛选
   - 点击模块查看详情

2. **右侧面板** - 参数编辑器
   - 表单式编辑
   - 实时验证
   - 描述提示

3. **底部面板** - 验证结果
   - 错误列表
   - 快速定位
   - 修复建议

---

## VS Code 扩展使用

### 命令面板

按 `Ctrl+Shift+P` 打开命令面板，输入 `yuleASR`：

- `yuleASR: Open Config` - 打开配置文件
- `yuleASR: Refresh Explorer` - 刷新浏览器
- `yuleASR: Sync Config` - 同步配置
- `yuleASR: Validate Config` - 验证配置
- `yuleASR: Generate Code` - 生成代码

### 配置浏览器

在资源管理器中：

1. 展开 "YULEASR CONFIGURATOR" 面板
2. 查看项目中的配置文件
3. 点击配置文件进入编辑器

---

## 配置管理

### 创建配置

```json
{
  "name": "MyProject_ECU",
  "version": "1.0.0",
  "description": "Project ECU configuration",
  "metadata": {
    "author": "Developer",
    "project": "MyProject",
    "ecuId": "ECU001"
  }
}
```

### 添加模块

1. 在模块树中找到需要的模块
2. 点击启用开关
3. 配置模块参数

### 导出配置

支持导出为：

- JSON 格式
- yuleASR 配置格式

---

## 验证功能

### 实时验证

配置修改时自动检查：

- 参数类型验证
- 必填字段检查
- 范围限制检查
- 跨参数依赖检查

### 错误分类

| 错误类型   | 说明                   |
| ---------- | ---------------------- |
| REQUIRED   | 必填参数未填写         |
| TYPE       | 参数类型不匹配         |
| RANGE      | 数值超出允许范围       |
| PATTERN    | 字符串不匹配正则表达式 |
| DEPENDENCY | 依赖参数验证失败       |

---

## 代码生成

### 生成步骤

1. 完成配置编辑
2. 点击 "生成代码" 按钮
3. 选择输出目录
4. 查看生成的源代码

### 生成的文件

```
output/
├── Mcu/
│   ├── Mcu_Cfg.c
│   ├── Mcu_Cfg.h
│   └── Mcu_PBcfg.c
├── Can/
│   ├── Can_Cfg.c
│   └── Can_Cfg.h
...
```

---

## Git 同步

### 上传配置

```bash
# 在 VS Code 中
1. 点击 "Sync Config" 命令
2. 选择提交信息
3. 确认上传
```

### 下载配置

```bash
# 在 VS Code 中
1. 点击 "Sync Config" 命令
2. 选择 "拉取最新配置"
```

### 冲突解决

当本地和远程配置冲突时：

1. 系统显示冲突参数
2. 选择保留版本
3. 合并配置

---

## 常见问题

### Q: 无法打开配置文件

A: 确保文件扩展名为 `.yuleasr` 或 `.json`

### Q: 验证失败但不显示错误

A: 检查验证面板是否展开，或刷新页面

### Q: 代码生成失败

A: 确保所有必填参数已填写，且验证通过

---

## 获取帮助

- 查看文档: https://docs.yuletech.io/yuleasr
- 提交 Issue: https://github.com/your-org/yuletech-monorepo/issues
- 联系支持: support@yuletech.io
