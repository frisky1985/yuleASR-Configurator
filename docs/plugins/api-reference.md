# Plugin SDK API Reference

[English](#english) | [中文](#chinese)

---

<a name="english"></a>

## English

This reference covers every type and interface exported by
`@yuletech/plugin-sdk`.

---

### YulePlugin

The entry point of every plugin. Your module must export this as its default
export.

```typescript
interface YulePlugin {
  id: string;
  name: string;
  version: string;
  type: PluginType;
  description: string;
  author: string;
  activate(context: PluginContext): Promise<void>;
  deactivate?(): Promise<void>;
}
```

| Field         | Type                                    | Required | Description                                                                                |
| ------------- | --------------------------------------- | -------- | ------------------------------------------------------------------------------------------ |
| `id`          | `string`                                | ✅       | Unique identifier (e.g. `"yuletech-generator-can"`). Must not conflict with other plugins. |
| `name`        | `string`                                | ✅       | Human-readable name (e.g. `"CAN Code Generator"`)                                          |
| `version`     | `string`                                | ✅       | SemVer version string                                                                      |
| `type`        | `PluginType`                            | ✅       | One of `'code-generator'`, `'validator'`, `'data-export'`, `'ui-extension'`                |
| `description` | `string`                                | ✅       | Short description of what the plugin does                                                  |
| `author`      | `string`                                | ✅       | Author name or organisation                                                                |
| `activate`    | `(ctx: PluginContext) => Promise<void>` | ✅       | Called when the plugin is loaded. Register generators/validators/exporters here.           |
| `deactivate`  | `() => Promise<void>`                   | ❌       | Called when the plugin is disabled/removed. Clean up resources.                            |

---

### PluginContext

Provided to `activate()`. The primary way a plugin interacts with the system.

```typescript
interface PluginContext {
  config: Record<string, unknown>;
  logger: PluginLogger;
  registerCodeGenerator(generator: CodeGeneratorPlugin): void;
  registerValidator(validator: ValidatorPlugin): void;
  registerDataExporter(exporter: DataExporterPlugin): void;
}
```

| Field                   | Type                                 | Description                                                                                        |
| ----------------------- | ------------------------------------ | -------------------------------------------------------------------------------------------------- |
| `config`                | `Record<string, unknown>`            | User-supplied configuration set via `PUT /v1/api/plugins/:id/config`. Read-only during activation. |
| `logger`                | `PluginLogger`                       | Scoped logger that prefixes messages with `[plugin:<id>]`                                          |
| `registerCodeGenerator` | `(gen: CodeGeneratorPlugin) => void` | Register a code generator. The name is auto-prefixed with `<pluginId>:` to avoid collisions.       |
| `registerValidator`     | `(val: ValidatorPlugin) => void`     | Register a validator. The name is auto-prefixed with `<pluginId>:` to avoid collisions.            |
| `registerDataExporter`  | `(exp: DataExporterPlugin) => void`  | Register a data exporter. The name is auto-prefixed with `<pluginId>:` to avoid collisions.        |

---

### PluginLogger

Simple logging interface, scoped per plugin.

```typescript
interface PluginLogger {
  info(...args: unknown[]): void;
  warn(...args: unknown[]): void;
  error(...args: unknown[]): void;
  debug(...args: unknown[]): void;
}
```

---

### PluginType

```typescript
type PluginType =
  | 'code-generator'
  | 'validator'
  | 'data-export'
  | 'ui-extension';
```

---

### CodeGeneratorPlugin

Produces source files from a module configuration.

```typescript
interface CodeGeneratorPlugin {
  name: string;
  description: string;
  supportedModules: string[];
  generate(
    config: Record<string, unknown>,
    options: Record<string, unknown>
  ): Promise<{ files: { path: string; content: string }[] }>;
}
```

| Field              | Type                                   | Description                                                                                                                                                            |
| ------------------ | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`             | `string`                               | Generator name (auto-prefixed with `<pluginId>:` at registration)                                                                                                      |
| `description`      | `string`                               | Human-readable description                                                                                                                                             |
| `supportedModules` | `string[]`                             | Module names this generator handles (e.g. `["Can", "CanTrcv"]`). Use `["*"]` for all.                                                                                  |
| `generate`         | `(config, options) => Promise<result>` | Called when code generation is triggered for a supported module. The `config` is the module configuration; `options` is an arbitrary bag (output dir, compiler, etc.). |

**The `generate` result:**

```typescript
{
  files: {
    path: string; // Relative file path (e.g. "Can_Cfg.h")
    content: string; // File content as string
  }
  [];
}
```

---

### ValidatorPlugin

Inspects a module configuration and returns validation results.

```typescript
interface ValidatorPlugin {
  name: string;
  description: string;
  targetModules: string[];
  validate(config: Record<string, unknown>): Promise<ValidationResult[]>;
}
```

| Field           | Type                                      | Description                                                              |
| --------------- | ----------------------------------------- | ------------------------------------------------------------------------ |
| `name`          | `string`                                  | Validator name (auto-prefixed)                                           |
| `description`   | `string`                                  | Human-readable description                                               |
| `targetModules` | `string[]`                                | Modules this validator applies to. Empty array or `["*"]` = all modules. |
| `validate`      | `(config) => Promise<ValidationResult[]>` | Called when validation runs. Return a list of issues.                    |

---

### ValidationResult

A single issue found during validation.

```typescript
interface ValidationResult {
  module: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  param?: string;
}
```

| Field      | Type                             | Description                                           |
| ---------- | -------------------------------- | ----------------------------------------------------- |
| `module`   | `string`                         | Module or parameter name this result refers to        |
| `severity` | `'error' \| 'warning' \| 'info'` | How severe the issue is                               |
| `message`  | `string`                         | Human-readable description                            |
| `param`    | `string` (optional)              | Optional parameter or field name the result refers to |

**Severity guidance:**

| Severity  | When to use                                                                                                       |
| --------- | ----------------------------------------------------------------------------------------------------------------- |
| `error`   | Configuration is invalid and **will not work** (e.g. missing required parameter, out-of-range value)              |
| `warning` | Configuration is technically valid but **may cause issues** (e.g. borderline clock frequency, deprecated setting) |
| `info`    | Configuration is fine, but you want to **inform** the user (e.g. suggestion to use a better value)                |

---

### DataExporterPlugin

Transforms the full or partial configuration into an output format.

```typescript
interface DataExporterPlugin {
  name: string;
  description: string;
  outputExtension: string;
  export(
    config: Record<string, unknown>,
    options: Record<string, unknown>
  ): Promise<{ content: string; extension: string }>;
}
```

| Field             | Type                                   | Description                                                                                                         |
| ----------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `name`            | `string`                               | Exporter name (auto-prefixed)                                                                                       |
| `description`     | `string`                               | Human-readable description                                                                                          |
| `outputExtension` | `string`                               | File extension for the exported output (e.g. `"json"`, `"xml"`)                                                     |
| `export`          | `(config, options) => Promise<result>` | Called to perform the export. `config` is the full project configuration. Returns the output content and extension. |

**The `export` result:**

```typescript
{
  content: string; // The exported content as a string
  extension: string; // File extension (e.g. "json")
}
```

---

### PluginMeta

Serialisable metadata stored in the registry per plugin.

```typescript
interface PluginMeta {
  id: string;
  name: string;
  version: string;
  type: PluginType;
  description: string;
  author: string;
  enabled: boolean;
  source: 'internal' | 'external';
  filePath?: string;
  config: Record<string, unknown>;
  installedAt?: string;
}
```

This is the object returned by `pluginManager.listPlugins()` and the API routes.

---

### Core Registry API (from `@yuletech/core`)

```typescript
// Plugin registry (in-memory)
import { pluginRegistry } from '@yuletech/core';

// Plugin manager (orchestrator)
import { pluginManager } from '@yuletech/core';
```

**PluginManager methods:**

| Method                                              | Description                                            |
| --------------------------------------------------- | ------------------------------------------------------ |
| `activate(plugin, userConfig?, source?, filePath?)` | Load and activate a plugin                             |
| `deactivate(id)`                                    | Unload and deactivate a plugin                         |
| `enable(id)`                                        | Mark a plugin as enabled                               |
| `disable(id)`                                       | Mark a plugin as disabled, unregister its capabilities |
| `toggle(id, enabled)`                               | Enable or disable a plugin                             |
| `loadExternalPlugins()`                             | Scan external plugin directory and load found plugins  |
| `updateConfig(id, config)`                          | Merge new config into a plugin's configuration         |
| `listPlugins()`                                     | Get all plugin metadata                                |
| `getPluginMeta(id)`                                 | Get one plugin's metadata                              |
| `setExternalPluginDir(dir)`                         | Set the path for external plugin discovery             |

---

<a name="chinese"></a>

## 中文

本参考涵盖 `@yuletech/plugin-sdk` 导出的所有类型和接口。

### YulePlugin

每个插件的入口点。您的模块必须将其作为默认导出。

```typescript
interface YulePlugin {
  id: string; // 唯一标识符（如 "yuletech-generator-can"）
  name: string; // 可读名称
  version: string; // SemVer 版本
  type: PluginType; // 插件类型
  description: string; // 简短描述
  author: string; // 作者
  activate(ctx: PluginContext): Promise<void>; // 激活时调用
  deactivate?(): Promise<void>; // 停用时调用（可选）
}
```

### PluginContext

在 `activate()` 中提供，是插件与系统交互的主要方式。

| 方法                         | 说明           |
| ---------------------------- | -------------- |
| `registerCodeGenerator(gen)` | 注册代码生成器 |
| `registerValidator(val)`     | 注册验证器     |
| `registerDataExporter(exp)`  | 注册数据导出器 |

### ValidationResult

验证过程中发现的单个问题。

```typescript
interface ValidationResult {
  module: string; // 相关模块/参数名称
  severity: 'error' | 'warning' | 'info'; // 严重级别
  message: string; // 可读描述
  param?: string; // 相关参数名称（可选）
}
```

### DataExporterPlugin

将配置转换为输出格式。

```typescript
interface DataExporterPlugin {
  name: string;
  description: string;
  outputExtension: string; // 输出文件扩展名（如 "json"）
  export(config, options): Promise<{ content: string; extension: string }>;
}
```

有关每个方法和字段的完整说明，请参考上面的英文部分。
