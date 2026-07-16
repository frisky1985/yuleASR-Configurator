# yuleASR Plugin System 插件系统

[English](#english) | [中文](#chinese)

---

<a name="english"></a>

## English

The yuleASR Configurator plugin system allows developers to extend the behaviour of the
AUTOSAR ECUC configurator at runtime. Plugins are first-class TypeScript/JavaScript
modules that are loaded by the **PluginManager** and can:

- **Generate code** — Produce C source and header files (or any text output)
- **Validate configurations** — Inspect module configs and report errors/warnings
- **Export data** — Transform configurations into JSON, XML, custom reports, etc.

### Core Concepts

| Concept | Description |
|---------|-------------|
| **YulePlugin** | The base interface every plugin must export as default |
| **PluginContext** | Provided during `activate()`, used to register generators/validators/exporters |
| **PluginRegistry** | In-memory store of all activated plugins and their capabilities |
| **PluginManager** | Orchestrates lifecycle (activate, deactivate, enable, disable, load) |
| **PluginMeta** | Serializable metadata persisted per plugin (id, version, config, enabled state) |

### Architecture

```
┌──────────────────────────────────────────────┐
│              Plugin Manager                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐ │
│  │ Generator │  │ Validator│  │ Data Exporter│ │
│  │ Plugins   │  │ Plugins  │  │ Plugins      │ │
│  └──────────┘  └──────────┘  └──────────────┘ │
│           │            │             │         │
│           ▼            ▼             ▼         │
│  ┌──────────────────────────────────────────┐ │
│  │           Plugin Registry                │ │
│  └──────────────────────────────────────────┘ │
└──────────────────────────────────────────────┘
```

### Plugin Lifecycle

1. **Registration** — Plugin metadata is stored (id, version, type, config)
2. **Activation** — `plugin.activate(context)` is called; plugin registers capabilities
3. **Runtime** — Generators/validators/exporters are invoked as needed
4. **Deactivation** — `plugin.deactivate()` is called; capabilities are unregistered

### Quick Links

- [Getting Started](getting-started.md) — Build your first plugin in 10 minutes
- [API Reference](api-reference.md) — Complete type and interface documentation
- [Best Practices](best-practices.md) — Design guidelines and common pitfalls
- [Examples](../../examples/plugins/) — Working example plugins

---

<a name="chinese"></a>

## 中文

yuleASR Configurator 插件系统允许开发者在运行时扩展 AUTOSAR ECUC 配置器的行为。
插件是 TypeScript/JavaScript 模块，由 **PluginManager** 加载，可以：

- **代码生成** — 生成 C 源文件和头文件（或任何文本输出）
- **配置验证** — 检查模块配置并报告错误/警告
- **数据导出** — 将配置转换为 JSON、XML、自定义报告等

### 核心概念

| 概念 | 说明 |
|------|------|
| **YulePlugin** | 每个插件必须默认导出的基础接口 |
| **PluginContext** | 在 `activate()` 中提供，用于注册生成器/验证器/导出器 |
| **PluginRegistry** | 所有已激活插件及其能力的内存存储 |
| **PluginManager** | 编排生命周期（激活、停用、启用、禁用、加载） |
| **PluginMeta** | 每个插件的可序列化元数据（ID、版本、配置、启用状态） |

### 插件生命周期

1. **注册** — 存储插件元数据（ID、版本、类型、配置）
2. **激活** — 调用 `plugin.activate(context)`；插件注册其能力
3. **运行时** — 根据需要调用生成器/验证器/导出器
4. **停用** — 调用 `plugin.deactivate()`；注销其能力

### 快速链接

- [快速入门](getting-started.md) — 10 分钟构建第一个插件
- [API 参考](api-reference.md) — 完整的类型和接口文档
- [最佳实践](best-practices.md) — 设计指南和常见陷阱
- [示例](../../examples/plugins/) — 可工作的示例插件
