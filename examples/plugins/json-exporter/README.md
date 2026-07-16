# JsonExporter (data-export)

**Type:** data-export  
**ID:** `example-json-exporter`

## Overview

This example plugin demonstrates how to write a **data exporter plugin** for yuleASR.
It exports the full project configuration as a pretty-printed JSON report with
metadata (timestamp, module count).

## What it demonstrates

- Implementing `YulePlugin.activate()` with `registerDataExporter()`
- `DataExporterPlugin.export()` processing a full configuration object
- Using `PluginContext.config` for user-customisable settings
- Per-call option overrides via the `options` parameter
- Data sanitisation (removing internal keys, empty containers)

## User configuration

| Key | Default | Description |
|-----|---------|-------------|
| `indent` | `2` | Number of spaces for JSON indentation |
| `includeTimestamp` | `true` | Whether to include generation timestamp in the report |

Set via `PUT /v1/api/plugins/example-json-exporter/config`:

```json
{
  "config": {
    "indent": 4,
    "includeTimestamp": false
  }
}
```

## Example output

```json
{
  "report": {
    "generatedAt": "2025-07-16T10:30:00.000Z",
    "plugin": "example-json-exporter",
    "version": "1.0.0",
    "moduleCount": 3
  },
  "configuration": {
    "Can": { ... },
    "Mcu": { ... },
    "Os": { ... }
  }
}
```

## Usage

```typescript
import { pluginManager, pluginRegistry } from '@yuletech/core';
import jsonExporterPlugin from './path/to/dist/index.js';

await pluginManager.activate(jsonExporterPlugin, { indent: 4 });

// Export with default settings
const result = await pluginRegistry
  .getDataExporter('example-json-exporter:JsonExporter')
  ?.export({ Can: { /* ... */ }, Mcu: { /* ... */ } }, {});

console.log(result?.content);
```

## Build

```bash
npm install
npm run build
```
