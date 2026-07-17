# CustomHeaderGenerator (code-generator)

**Type:** code-generator  
**ID:** `example-custom-header-generator`

## Overview

This example plugin demonstrates how to write a **code generator plugin** for
yuleASR. It wraps generated C files with a custom copyright header whose content
is controlled by the plugin's user configuration.

## What it demonstrates

- Implementing `YulePlugin.activate()` and `registerCodeGenerator()`
- A `CodeGeneratorPlugin.generate()` that reads user config
- A universal generator (`supportedModules: ['*']`) that applies to all modules
- Proper use of `context.config` and `context.logger`

## User configuration

| Key       | Default          | Description                          |
| --------- | ---------------- | ------------------------------------ |
| `company` | `"YuleTech"`     | Company name in the copyright header |
| `author`  | `"yuleASR Team"` | Author name in the copyright header  |
| `license` | `"Proprietary"`  | License type displayed in the header |

Set these via `PUT /v1/api/plugins/example-custom-header-generator/config`:

```json
{
  "config": {
    "company": "MyCorp",
    "author": "Jane Doe",
    "license": "MIT"
  }
}
```

## Usage

```typescript
import { pluginManager } from '@yuletech/core';
import customHeaderPlugin from './path/to/dist/index.js';

const meta = await pluginManager.activate(customHeaderPlugin, {
  company: 'Acme Inc',
  author: 'Dev Team',
});

// The generator is now registered and will be called for any module.
const result = await pluginRegistry
  .getCodeGenerator('example-custom-header-generator:CopyrightHeader')
  ?.generate({ module: 'Can' }, {});

console.log(result?.files[0].content);
// Output begins with:
//   /*
//    * ==================================================================
//    * Copyright (c) 2025 Acme Inc
//    * ...
```

## Build

```bash
npm install
npm run build
```
