# McuValidator (validator)

**Type:** validator  
**ID:** `example-mcu-validator`

## Overview

This example plugin demonstrates how to write a **validator plugin** for yuleASR.
It validates the MCU module's clock configuration, checking:

- Clock frequency is within the valid range (1 MHz – 16 MHz)
- PLL multiplier and divider values are in acceptable ranges
- PLL output frequency does not exceed the maximum allowed
- Presence of optional external oscillator

## What it demonstrates

- Implementing `YulePlugin.activate()` with `registerValidator()`
- `ValidatorPlugin.validate()` returning `ValidationResult[]`
- Using all three severity levels: `error`, `warning`, `info`
- Including specific parameter names in `param` for UI highlighting
- Module-scoped validation (`targetModules: ['Mcu']`)

## Validation rules

| Rule | Severity | Condition |
|------|----------|-----------|
| Missing `clockFrequency` | error | Parameter not present |
| `clockFrequency` out of range | error | `< 1 MHz` or `> 16 MHz` |
| `clockFrequency` near max | warning | `> 14.4 MHz` |
| Missing `pllMultiplier` / `pllDivider` | error | Parameter not present |
| PLL output exceeds max | error | `freq × mult / div > 16 MHz` |
| No external oscillator | info | `externalOsc` not configured |

## Usage

```typescript
import { pluginManager, pluginRegistry } from '@yuletech/core';
import mcuValidatorPlugin from './path/to/dist/index.js';

await pluginManager.activate(mcuValidatorPlugin);

// Simulate validation
const config = {
  module: 'Mcu',
  parameters: { clockFrequency: 16000000, pllMultiplier: 8, pllDivider: 2 },
};
const results = await pluginRegistry
  .getValidator('example-mcu-validator:McuClockValidator')
  ?.validate(config);

console.log(results);
// [{ module: 'Mcu', severity: 'warning', message: '...', param: 'clockFrequency' }]
```

## Build

```bash
npm install
npm run build
```
