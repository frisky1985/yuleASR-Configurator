# yuleASR Configurator 快速上手指南 (Quick Start)

> AUTOSAR BSW 配置工具 —— 让嵌入式系统的配置不再繁琐。

---

## 1. 产品简介 (Product Overview)

**yuleASR Configurator** 是一款面向 AUTOSAR 经典平台的基础软件（BSW）配置工具，专为嵌入式开发团队设计。它提供了直观的图形界面，帮助您快速完成 AUTOSAR 模块的参数配置、验证和代码生成。

### 核心特性

- **50+ 预置 AUTOSAR 模块**：覆盖 MCAL（Can、Dio、Mcu、Adc、Pwm 等）、ECUAL（Eep、Fee、WdgIf 等）、Service 层（BswM、Com、Dcm、Dem、NvM 等）以及 RTE 和 OS 配置。
- **层级化配置树**：类似 Vector Davinci Configurator 的模块管理体验，支持按 AUTOSAR 层次（MCAL → ECUAL → Service → RTE → OS → ASW）组织模块。
- **可视化参数编辑**：每个模块的参数通过表单界面编辑，支持数值、字符串、布尔、枚举等类型。
- **内置验证引擎**：实时检查配置完整性、参数范围、依赖关系，并提供错误/警告/信息三级提示。
- **代码生成**：一键生成符合 yuleASR 风格的 `_Cfg.h` 宏定义头文件，支持 `autosar-format` 规范的 ECUC ARXML 导出。
- **插件系统**：通过 `@yuletech/plugin-sdk` 扩展功能，支持自定义验证规则、代码生成器和数据导出。
- **多平台支持**：Web 版即开即用，桌面版提供 macOS / Windows / Linux 原生体验。

### 适用场景

- AUTOSAR BSW 模块的初始化参数配置
- ECUC 参数文件的生成与编辑
- 嵌入式项目中 MCAL 和复杂驱动（CDD）的配置管理
- 团队协作中的配置版本同步与差异比对

---

## 2. 安装方式 (Installation)

yuleASR Configurator 提供两种使用方式，任选其一即可。

### 2.1 Web 版（推荐快速体验）

无需安装任何软件，直接通过浏览器访问：

> **[https://frisky1985.github.io/yuleASR-Configurator/](https://frisky1985.github.io/yuleASR-Configurator/)**

Web 版支持所有主流浏览器（Chrome、Edge、Firefox、Safari），配置数据存储在浏览器本地，开箱即用。适合评估功能、快速原型验证。

### 2.2 桌面版（推荐日常使用）

从 GitHub Releases 下载对应平台的安装包：

**[GitHub Releases](https://github.com/frisky1985/yuleASR-Configurator/releases)**

| 平台 | 文件格式 |
|------|----------|
| **macOS** (Intel) | `yuleASR-Configurator-{version}-mac-x64.dmg` |
| **macOS** (Apple Silicon) | `yuleASR-Configurator-{version}-mac-arm64.dmg` |
| **Windows** (x64) | `yuleASR-Configurator-{version}-win-x64.exe` (NSIS 安装包) 或 `.zip` 便携版 |
| **Linux** (x64) | `yuleASR-Configurator-{version}-linux-x64.AppImage` 或 `.deb` 安装包 |
| **Linux** (ARM64) | `yuleASR-Configurator-{version}-linux-arm64.AppImage` |

> **提示**：桌面版支持自动更新（基于 `electron-updater`），首次安装后后续版本会自动推送。

---

## 3. 快速上手 (Quick Start)

以下步骤将带您完成从新建配置到生成代码的完整流程。

### 3.1 新建配置

1. 打开 yuleASR Configurator，进入 **仪表盘**（Dashboard）。
2. 点击 **"新建配置"**（New Configuration）按钮。
3. 在弹出的对话框中输入配置名称（必填）和描述（可选）。
4. 点击 **"创建"**，新配置将出现在仪表盘的配置列表中。

![新建配置](MEDIA:/Users/stefan/.openclaw/workspace/yuleASR-Configurator/apps/yuleasr-web/public/screenshots/new-config.png)

### 3.2 添加模块

1. 在仪表盘点击新建的配置，进入 **编辑器**（Editor）。
2. 左侧 **配置树**（Config Tree）按 AUTOSAR 层次展示所有可用模块。
3. 点击工具栏上的 **"模块向导"**（Module Wizard）按钮，或直接在配置树中找到目标模块。
4. 选择您需要配置的模块，例如：
   - **Can**（CAN 驱动程序）—— MCAL 层
   - **Dio**（数字 I/O 驱动）—— MCAL 层
   - **Mcu**（微控制器驱动）—— MCAL 层
   - **Os**（操作系统）—— 单独 OS 配置页面
5. 模块支持按层筛选（MCAL / ECUAL / Service / RTE），方便快速定位。
6. 选中模块后，切换到 **"启用"** 状态即可开始配置。

> **提示**：您也可以同时启用多个模块，工具会自动识别模块间的依赖关系。

### 3.3 配置参数

1. 在配置树中点击某个已启用的模块，右侧 **参数编辑器**（Parameter Editor）将显示该模块的可配置参数。
2. 参数按功能分组为容器（Container），每个容器可包含多个参数项。
3. 支持的参数类型：
   - **数值（Number）**：直接输入整数或浮点数
   - **字符串（String）**：文本输入
   - **布尔值（Boolean）**：开关切换
   - **枚举（Select）**：下拉菜单选择
4. 修改参数后，编辑器顶部会出现 **"未保存"** 提示，请及时保存。
5. **快捷键**：
   - `Ctrl/Cmd + S`：保存当前配置
   - `Ctrl/Cmd + /`：显示快捷键帮助
   - `Ctrl/Cmd + D`：切换深色/浅色主题

### 3.4 验证配置

1. 在编辑器中，点击 **"验证"**（Validate）按钮，或通过 **菜单 → 验证** 触发。
2. 右侧 **验证面板**（Validation Panel）将显示检查结果，分为三个等级：
   - ❌ **错误（Error）**：必须修复的问题
   - ⚠️ **警告（Warning）**：建议关注的问题
   - ℹ️ **信息（Info）**：提示性信息
3. 点击每条验证条目，配置树会自动跳转到对应的参数位置。
4. 所有错误和警告修复后，面板显示 ✅ 通过状态。

> **提示**：验证引擎会检查参数取值范围、必填项完整性、跨模块依赖一致性等。建议在每次保存前运行验证。

### 3.5 生成代码

完成配置验证后，可以通过以下方式生成输出：

#### ARXML 导出（ECUC 格式）

1. 点击工具栏 **"导出"**（Export）按钮。
2. 选择 **"ARXML 导出"**（Export ARXML）。
3. 工具将生成符合 AUTOSAR ECUC 规范的 `.arxml` 文件。
4. 该文件可直接导入到其他 AUTOSAR 工具链中使用。

#### C 代码生成（宏定义头文件）

1. 点击工具栏 **"生成"**（Generate）按钮。
2. 选择 **"生成 C 代码"**（Generate C Code）。
3. 工具会为每个已配置的模块生成对应的 `<Module>_Cfg.h` 文件。
4. 代码风格为纯宏定义模式（无类型定义、无函数声明），可直接集成到 yuleASR BSW 项目中。
5. 支持一次生成所有模块代码，或以 ZIP 包形式批量下载。

---

## 4. 界面导航 (UI Navigation)

yuleASR Configurator 的界面布局清晰直观，主要分为以下几个区域：

### 顶部工具栏

- **配置选择器**：快速切换不同配置
- **保存/另存为**：保存当前配置或另存为模板
- **导出菜单**：ARXML 导出、C 代码生成、配置报告
- **导入菜单**：导入 ARXML 文件或 yuleASR 配置
- **全局搜索**：`Ctrl/Cmd + K` 快速搜索参数/模块
- **主题切换**：深色/浅色模式一键切换

### 左侧 —— 配置树 (Config Tree)

- **分层展示**：按 MCAL → ECUAL → Service → RTE → OS → ASW 六层组织
- **模块节点**：每个模块可展开查看子容器和参数
- **状态指示**：模块前面的图标显示配置状态（已配置/未配置/部分配置）
- **错误标记**：验证错误会以徽标形式显示在对应模块旁

### 中央 —— 参数编辑器 (Parameter Editor)

- 选中模块或容器后，右侧主区域显示可编辑参数
- 支持容器内多实例管理（如 Can 的多个控制器实例）
- OS 配置有独立的专用编辑器（任务、事件、报警、资源、中断等）

### 右侧 —— 验证面板 (Validation Panel)

- 实时显示配置验证结果
- 按错误/警告/信息分组，可按模块展开查看详情
- 支持直接点击跳转到问题位置

### 底部状态栏

- 显示配置完成度百分比
- 最近保存时间
- 模块总数与已配置模块数

---

## 5. 插件系统 (Plugin System)

yuleASR Configurator 提供了强大的插件扩展机制，让您可以根据项目需求定制功能。

### 插件类型

| 类型 | 用途 | 示例 |
|------|------|------|
| **code-generator** | 自定义代码生成器 | 增加版权头、生成特定格式输出 |
| **validator** | 自定义验证规则 | MCU 时钟频率校验、Can 波特率范围检查 |
| **data-export** | 导出配置数据 | JSON 报告生成、自定义格式导出 |
| **ui-extension** | 扩展 UI 功能 | 自定义面板、快捷操作 |

### 插件开发

1. 安装插件 SDK：
   ```bash
   npm install @yuletech/plugin-sdk
   ```

2. 实现插件接口：
   ```typescript
   import type { YulePlugin, PluginContext } from '@yuletech/plugin-sdk';

   const myPlugin: YulePlugin = {
     id: 'my-custom-validator',
     name: 'My Validator',
     type: 'validator',
     version: '1.0.0',
     activate(context: PluginContext) {
       // 注册验证器、代码生成器或导出器
       context.registerValidator({ ... });
     },
     deactivate() {
       // 清理资源
     },
   };
   ```

3. 构建并安装到工具中。

### 示例插件

项目 `examples/plugins/` 目录下提供了三个完整的示例插件：

| 插件 | 类型 | 功能 |
|------|------|------|
| **mcu-validator** | validator | 验证 MCU 模块时钟频率、PLL 配置 |
| **json-exporter** | data-export | 将配置导出为带格式的 JSON 报告 |
| **custom-header-generator** | code-generator | 在生成的 C 文件中添加自定义版权头 |

### 插件管理

在 Web 版或桌面版中，通过 **设置 → 插件管理** 页面可以查看已安装的插件列表、启用/禁用插件，以及配置每个插件的用户自定义参数。

---

## 6. 常见问题 (FAQ)

### Q1: 配置数据存储在哪里？Web 版和桌面版数据互通吗？

**A:** Web 版配置数据存储在浏览器的 `localStorage` 中（按配置 ID 隔离）。桌面版使用 Electron 的本地文件系统存储。
两者暂未实现自动同步，但您可以通过 **导出 ARXML** 或 **导出 yuleASR 配置** → **导入到另一平台** 的方式来迁移数据。

### Q2: 支持哪些 AUTOSAR 模块？

**A:** 当前支持 50+ 个 AUTOSAR 模块，完整列表包括但不限于：Can、CanIf、CanNm、CanSM、CanTp、CanTrcv、Dio、Mcu、Port、Adc、Icu、Gpt、Pwm、Spi、Lin、LinIf、Fr、FrIf、Eth、EthIf、Wdg、WdgIf、WdgM、Ea、Eep、Fee、Fls、Crc、Crypto、Csm、CryIf、Det、Dem、Dcm、Com、ComM、BswM、PduR、NvM、MemIf、Nm、Os、Rte、Xcp、EcuM、IoHwAb、Sbc、Ble、Uart、I2c、Mcl 等。详情请查看 `packages/@yuletech/core/src/schema/generated/` 下的 JSON 模式文件。

### Q3: 如何导入现有的 ARXML 配置？

**A:** 在编辑器中点击 **"导入"**（Import）按钮，选择 **"导入 ARXML"**。工具会解析标准的 AUTOSAR ECUC ARXML 文件，将其转换为 yuleASR 内部配置格式。支持大部分常见模块的参数还原。如果导入过程中遇到不支持的元素，会显示警告信息但不会中断导入。

### Q4: 代码生成输出的是什么格式？

**A:** 默认生成纯宏定义的 C 头文件（`<Module>_Cfg.h`），格式符合 yuleASR BSW 的预编译配置规范。输出内容为 `#define` 宏定义，不包含类型声明或函数定义。同时支持 ECUC 格式的 ARXML 导出，符合 AUTOSAR 标准，可与其他工具链互操作。

### Q5: 能否比较两个配置的差异？

**A:** 可以。在仪表盘中选中两个配置，点击 **"比较配置"**（Compare Configurations），工具会以并排视图展示两个配置的差异，包括模块增减、参数值变化等。差异结果也可以导出为差异报告。

### Q6: 支持 Git 版本管理吗？

**A:** 支持基础 Git 集成。在 **Git 同步**（Git Sync）页面，您可以将配置关联到 Git 仓库、查看变更历史、创建分支以及提交更改。该功能适用于希望将配置纳入版本控制的团队。

### Q7: 如何切换语言？

**A:** 进入 **设置 → 界面偏好**，在语言选项中选择 **中文** 或 **English**。切换即时生效，无需重启。目前支持简体中文和英文两种语言。

### Q8: 桌面版支持哪些快捷键？

**A:** 常用快捷键：
| 操作 | Windows/Linux | macOS |
|------|---------------|-------|
| 保存 | `Ctrl + S` | `Cmd + S` |
| 全局搜索 | `Ctrl + K` | `Cmd + K` |
| 切换主题 | `Ctrl + D` | `Cmd + D` |
| 快捷键帮助 | `Ctrl + /` | `Cmd + /` |
| 关闭弹窗 | `Escape` | `Escape` |

### Q9: 配置完成后，如何验证配置的正确性？

**A:** 内置验证引擎会在您点击 **"验证"** 按钮时自动执行多项检查：
- 必填参数是否已配置
- 参数值是否在有效范围内
- 模块间的依赖关系是否满足
- 枚举值是否合法
- OS 配置的完整性和一致性
验证结果会按严重程度分级展示，并支持一键跳转到问题位置。

---

## 7. 获取帮助 (Getting Help)

### 文档与资源

- **项目主页**：[https://github.com/frisky1985/yuleASR-Configurator](https://github.com/frisky1985/yuleASR-Configurator)
- **变更日志**：[CHANGELOG.md](./CHANGELOG.md) —— 详细记录每个版本的新功能、修复和变更

### 反馈问题

如果遇到 Bug 或有功能建议，欢迎提交 GitHub Issue：

- **[提交 Issue](https://github.com/frisky1985/yuleASR-Configurator/issues/new/choose)** —— 选择 Bug 报告或功能请求模板

提交 Issue 时，请尽量包含以下信息：
- 使用的版本（Web 版 / 桌面版及具体版本号）
- 操作系统及版本
- 复现步骤和截图（如适用）
- 期望的行为与实际行为

### 社区交流

- **[GitHub Discussions](https://github.com/frisky1985/yuleASR-Configurator/discussions)** —— 提问、分享经验、讨论最佳实践
- **社区链接** —— 桌面版页脚提供社区入口，点击后会在默认浏览器中打开

### 贡献代码

欢迎贡献代码！请参阅项目 README 中的贡献指南。提交 Pull Request 前请确保：

1. 代码通过 lint 检查
2. 相关测试通过
3. 新功能包含必要的文档和类型定义

---

*yuleASR Configurator —— 让 AUTOSAR 配置更简单。*
