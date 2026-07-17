# Plugin Development Best Practices 最佳实践

[English](#english) | [中文](#chinese)

---

<a name="english"></a>

## English

### 1. Plugin Identity

- **Choose a unique `id`** — Use a reverse-domain or organisation-prefixed name,
  e.g. `"yuletech-generator-can"`, `"mycompany-validator-mcu"`.
- **Use SemVer versions** — Follow `MAJOR.MINOR.PATCH`. Breaking changes to the
  generated output or validation behaviour should increment the major version.
- **Be descriptive** — Set a meaningful `name` and `description`. Users see
  these in the plugin list and API responses.

### 2. Activation (the `activate` method)

- **Keep activation fast** — Don't perform heavy I/O or network calls in
  `activate()`. Defer expensive operations to the first `generate()` /
  `validate()` / `export()` call.
- **Register early** — Register all generators, validators, and exporters during
  activation. The plugin manager auto-prefixes names with your plugin ID, so
  collisions are unlikely.
- **Validate user config** — If your plugin requires user configuration (e.g.
  API keys, copyright text), check for it in `activate()` and log a clear
  warning if missing.

```typescript
async activate(context: PluginContext): Promise<void> {
  const apiKey = context.config.apiKey as string | undefined;
  if (!apiKey) {
    context.logger.warn('No "apiKey" configured — some features may not work');
  }
  context.registerCodeGenerator({ /* ... */ });
}
```

### 3. Code Generator Plugins

- **Use `supportedModules` precisely** — List only the modules your generator
  actually handles. Use `['*']` only for universal generators (like a copyright
  header inserter).
- **The `config` parameter** — Contains the module configuration. Expect it to
  have a `module` (string) field and a `parameters` (Record<string, unknown>)
  field.
- **File paths** — Use relative paths. The caller prepends the output directory.
- **Error handling** — If generation fails, throw a descriptive error. Do not
  catch and return an empty `{ files: [] }`.

```typescript
async generate(config, options) {
  if (!config.module) {
    throw new Error('Missing "module" in configuration');
  }
  // ... generation logic ...
  return { files: [{ path: 'MyGen_Cfg.h', content: headerContent }] };
}
```

### 4. Validator Plugins

- **Return structured results** — Don't throw exceptions for validation
  failures. Return `ValidationResult[]` with appropriate severity levels.
- **Be specific** — Include the exact parameter name in `param` and `module`
  fields so the UI can highlight the problematic field.
- **Validate dependencies** — If a module depends on another (e.g. CanTrcv
  depends on Can), check that the dependent module's config is also present.

```typescript
async validate(config): Promise<ValidationResult[]> {
  const results: ValidationResult[] = [];
  const freq = config.parameters?.clockFrequency as number | undefined;
  if (freq !== undefined && freq > 16000000) {
    results.push({
      module: 'Mcu',
      severity: 'error',
      message: `Clock frequency ${freq} Hz exceeds maximum 16 MHz`,
      param: 'clockFrequency',
    });
  }
  return results;
}
```

### 5. Data Exporter Plugins

- **Use `outputExtension`** — Set this to the correct file extension (e.g.
  `"json"`, `"yaml"`, `"xml"`). The UI uses this to suggest filenames.
- **Handle large configs** — The `config` passed to `export()` may be the entire
  project configuration. Consider adding filtering options (e.g.
  `options.filterModule`).
- **Format nicely** — For text-based formats (JSON, YAML), produce
  human-readable output with indentation.

### 6. Common Pitfalls

| Pitfall                                                   | Solution                                                                        |
| --------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Registering the same generator on every `generate()` call | Register once in `activate()`                                                   |
| Hardcoding paths                                          | Return relative paths; let the caller resolve the output directory              |
| Forgetting `await` on plugin functions                    | Always `await` `generate()`, `validate()`, `export()`                           |
| Mutating `context.config`                                 | It is read-only. Use `pluginManager.updateConfig()` to change it                |
| Using Node APIs in browser context                        | Only use pure JS/TS or check environment (e.g. `typeof window === 'undefined'`) |
| Not handling `deactivate`                                 | Clean up timers, intervals, and file handles to avoid resource leaks            |

### 7. Testing

- Write unit tests for your `generate()` / `validate()` / `export()` logic.
- Use the PluginManager directly in tests without a full server:

```typescript
import { pluginManager } from '@yuletech/core';
import myPlugin from '../src/index';

test('should register a code generator', async () => {
  await pluginManager.activate(myPlugin, {});
  const plugins = pluginManager.listPlugins();
  expect(plugins).toHaveLength(1);
  expect(plugins[0].id).toBe('my-plugin-id');
  await pluginManager.deactivate('my-plugin-id');
});
```

### 8. Distribution

- Bundle your plugin with **tsup** or **tsc** targeting ES2022+.
- Ensure your plugin works both as **ESM** (`import`) and **CJS** (`require`).
- Publish to npm or distribute as a `.js` file placed in the external plugin
  directory.

---

<a name="chinese"></a>

## 中文

### 1. 插件标识

- **选择唯一的 `id`** — 使用反向域名或组织前缀，如 `"yuletech-generator-can"`
- **使用 SemVer 版本** — `MAJOR.MINOR.PATCH` 格式
- **描述清晰** — 设置有意义的 `name` 和 `description`

### 2. 激活（`activate` 方法）

- **保持激活快速** — 不要在 `activate()` 中执行繁重的 I/O
- **尽早注册** — 在激活期间注册所有功能
- **验证用户配置** — 检查必需的配置项

### 3. 代码生成器插件

- **精确使用 `supportedModules`** — 只列出实际处理的模块
- **相对路径** — 返回相对路径，让调用者处理输出目录
- **错误处理** — 失败时抛出描述性错误，不要返回空的 `{ files: [] }`

### 4. 验证器插件

- **返回结构化结果** — 不要为验证失败抛出异常
- **具体指出问题** — 在 `param` 和 `module` 字段中包含准确的参数名称
- **验证依赖关系** — 检查相关模块的配置

### 5. 数据导出器插件

- **设置 `outputExtension`** — 正确的文件扩展名（如 `"json"`）
- **处理大型配置** — 考虑添加过滤选项
- **格式化输出** — 产生人类可读的输出

### 6. 常见陷阱

| 陷阱                               | 解决方案                                  |
| ---------------------------------- | ----------------------------------------- |
| 每次 `generate()` 调用都注册生成器 | 在 `activate()` 中只注册一次              |
| 硬编码路径                         | 返回相对路径                              |
| 忘记 `await` 插件函数              | 始终 `await` 异步调用                     |
| 修改 `context.config`              | 只读，使用 `pluginManager.updateConfig()` |
| 在浏览器环境中使用 Node API        | 只使用纯 JS/TS 或检查环境                 |

### 7. 测试

为 `generate()` / `validate()` / `export()` 逻辑编写单元测试。

### 8. 分发

使用 tsup 或 tsc 打包插件，目标 ES2022+。确保同时支持 ESM 和 CJS。
