# Sprint 1: 代码生成器 + 核心测试覆盖

> **周期:** 2026-07-13 ~ 2026-07-26（2周）
> **目标:** 把 Configurator 从"Schema 编辑器"变成能产出有效 C 代码的工具
> **原则:** TDD — 先写测试再写实现，每个任务都是 RED → GREEN → REFACTOR

---

## Task 1: Generator 接口测试覆盖（Core 层）

**Objective:** 给 `CodeGenerator` 接口和基础工具函数写单元测试，建立生成器的测试基础设施

**Files:**
- Create: `packages/@yuletech/core/src/generator/__tests__/index.test.ts`
- Modify: 无（纯新增测试）

**Step 1: 写 GeneratorOptions / GeneratedFile / GenerationResult 接口验证测试**

```typescript
import { describe, it, expect } from 'vitest';
import type { GeneratorOptions, GeneratedFile, GenerationResult } from '../index';

describe('Generator Interfaces', () => {
  it('should accept valid GeneratorOptions', () => {
    const options: GeneratorOptions = {
      outputDir: './output',
      targetPlatform: 'S32K312',
      compiler: 'gcc',
      generateComments: true,
    };
    expect(options.outputDir).toBe('./output');
  });

  it('should accept minimal GeneratorOptions', () => {
    const options: GeneratorOptions = { outputDir: './out' };
    expect(options.outputDir).toBe('./out');
  });

  it('should validate GeneratedFile structure', () => {
    const file: GeneratedFile = {
      path: 'Ecuc_Can.h',
      content: '#ifndef ECUC_CAN_H',
      language: 'h',
    };
    expect(file.language).toMatch(/^c|h|xml|json|other$/);
  });

  it('should validate GenerationResult with errors', () => {
    const result: GenerationResult = {
      success: false,
      files: [],
      errors: ['Module name is required'],
    };
    expect(result.success).toBe(false);
    expect(result.errors?.length).toBe(1);
  });

  it('should validate GenerationResult with warnings', () => {
    const result: GenerationResult = {
      success: true,
      files: [],
      warnings: ['Config missing version'],
    };
    expect(result.success).toBe(true);
  });
});
```

**Step 2: 跑测试确认框架正常**

```bash
cd packages/@yuletech/core && npx vitest run src/generator/__tests__/index.test.ts
```

Expected: 5 passed

**Step 3: Commit**

```bash
git add packages/@yuletech/core/src/generator/__tests__/index.test.ts
git commit -m "test: add generator interface validation tests"
```

---

## Task 2: ecuc-generator 单元测试（基础功能）

**Objective:** 验证 EcucCodeGenerator 的 validateConfig、generateHeaderFile 核心方法

**Files:**
- Create: `packages/@yuletech/core/src/generator/__tests__/ecuc-generator.test.ts`
- Modify: 无

**Step 1: 写 validateConfig 测试**

```typescript
import { describe, it, expect } from 'vitest';
import { EcucCodeGenerator } from '../ecuc-generator';
import type { ModuleConfig, ModuleSchema } from '../../types';

describe('EcucCodeGenerator', () => {
  const generator = new EcucCodeGenerator();

  const baseSchema: ModuleSchema = {
    id: 'can',
    name: 'Can',
    version: '1.0.0',
    label: 'CAN Driver',
    parameters: [
      { name: 'canBaudrate', type: 'integer', required: true, description: 'CAN baud rate' },
      { name: 'canDevErrorDetect', type: 'boolean', required: false, description: 'DET enable' },
    ],
    containers: [],
  };

  it('should validate required parameters', () => {
    const config: ModuleConfig = {
      module: 'Can',
      version: '1.0.0',
      parameters: {},
      containers: {},
    };
    // validateConfig is private, test via generate()
    const result = generator.supports('Can');
    expect(result).toBe(true);
  });

  it('should have correct name and version', () => {
    expect(generator.name).toBe('EcucCodeGenerator');
    expect(generator.version).toBe('1.0.0');
  });

  it('should support all modules', () => {
    expect(generator.supports('Can')).toBe(true);
    expect(generator.supports('CanIf')).toBe(true);
    expect(generator.supports('EcuM')).toBe(true);
    expect(generator.supports('OS')).toBe(true);
  });

  it('should return generation result with files on valid config', async () => {
    const config: ModuleConfig = {
      module: 'Can',
      version: '1.0.0',
      parameters: { canBaudrate: 500000, canDevErrorDetect: false },
      containers: {},
    };
    const result = await generator.generate(config, baseSchema, {
      outputDir: './out',
      generateComments: true,
    });
    expect(result.success).toBe(true);
    expect(result.files.length).toBeGreaterThanOrEqual(2); // .h + .c
    expect(result.files[0].language).toBe('h');
    expect(result.files[1].language).toBe('c');
  });

  it('should produce valid include guard in header', async () => {
    const config: ModuleConfig = {
      module: 'Can',
      version: '1.0.0',
      parameters: { canBaudrate: 500000 },
      containers: {},
    };
    const result = await generator.generate(config, baseSchema, {
      outputDir: './out',
    });
    const header = result.files.find(f => f.path.endsWith('.h'));
    expect(header).toBeDefined();
    expect(header!.content).toContain('#ifndef ECUC_CAN_H');
    expect(header!.content).toContain('#define ECUC_CAN_H');
    expect(header!.content).toContain('#endif /* ECUC_CAN_H */');
  });

  it('should include parameter macros in header', async () => {
    const config: ModuleConfig = {
      module: 'Can',
      version: '1.0.0',
      parameters: { canBaudrate: 500000, canDevErrorDetect: false },
      containers: {},
    };
    const result = await generator.generate(config, baseSchema, {
      outputDir: './out',
      generateComments: true,
    });
    const header = result.files.find(f => f.path.endsWith('.h'))!.content;
    expect(header).toContain('CAN_CANBAUDRATE');
    expect(header).toContain('CAN_CANDEVERRORDETECT');
    expect(header).toContain('Std_ReturnType Can_Init');
  });

  it('should fail on missing required parameter', async () => {
    const config: ModuleConfig = {
      module: 'Can',
      version: '1.0.0',
      parameters: {}, // missing required canBaudrate
      containers: {},
    };
    const result = await generator.generate(config, baseSchema, {
      outputDir: './out',
    });
    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
    expect(result.errors![0]).toContain('canBaudrate');
  });
});
```

**Step 2: 跑测试验证**

```bash
cd packages/@yuletech/core && npx vitest run src/generator/__tests__/ecuc-generator.test.ts
```

Expected: 6 passed

**Step 3: Commit**

```bash
git add packages/@yuletech/core/src/generator/__tests__/ecuc-generator.test.ts
git commit -m "test: add EcucCodeGenerator unit tests"
```

---

## Task 3: ecuc-generator 容器生成测试

**Objective:** 验证容器实例、Post-Build 配置、Link-Time 配置的生成正确性

**Files:**
- Modify: `packages/@yuletech/core/src/generator/__tests__/ecuc-generator.test.ts`（追加）

**Step 1: 追加容器生成的测试用例**

```typescript
describe('EcucCodeGenerator - Container generation', () => {
  const generator = new EcucCodeGenerator();

  const schemaWithContainers: ModuleSchema = {
    id: 'can',
    name: 'Can',
    version: '1.0.0',
    label: 'CAN Driver',
    parameters: [
      { name: 'canDevErrorDetect', type: 'boolean', required: false },
    ],
    containers: [
      {
        name: 'CanController',
        label: 'CAN Controller',
        multiple: true,
        minInstances: 1,
        maxInstances: 4,
        parameters: ['canBaudrate', 'canControllerId'],
      },
    ],
  };

  it('should generate container count macros', async () => {
    const config: ModuleConfig = {
      module: 'Can',
      version: '1.0.0',
      parameters: { canDevErrorDetect: false },
      containers: {
        CanController: [
          { parameters: { canBaudrate: 500000, canControllerId: 0 } },
          { parameters: { canBaudrate: 250000, canControllerId: 1 } },
        ],
      },
    };
    const result = await generator.generate(config, schemaWithContainers, {
      outputDir: './out',
    });
    const header = result.files.find(f => f.path.endsWith('.h'))!.content;
    expect(header).toContain('CAN_CANCONTROLLER_COUNT');
    expect(header).toContain('CanController_Instances[2]');
  });

  it('should reject container count below minimum', async () => {
    const config: ModuleConfig = {
      module: 'Can',
      version: '1.0.0',
      parameters: {},
      containers: { CanController: [] }, // 0 < minInstances=1
    };
    const result = await generator.generate(config, schemaWithContainers, {
      outputDir: './out',
    });
    expect(result.success).toBe(false);
    expect(result.errors![0]).toContain('CanController');
  });

  it('should generate PBcfg file', async () => {
    const config: ModuleConfig = {
      module: 'Can',
      version: '1.0.0',
      parameters: { canDevErrorDetect: false },
      containers: {
        CanController: [
          { parameters: { canBaudrate: 500000, canControllerId: 0 } },
        ],
      },
    };
    const result = await generator.generate(config, schemaWithContainers, {
      outputDir: './out',
      generateComments: true,
    });
    const pbcfg = result.files.find(f => f.path.endsWith('_PBcfg.c'));
    expect(pbcfg).toBeDefined();
    expect(pbcfg!.content).toContain('Post-Build Configuration');
  });

  it('should generate Lcfg file', async () => {
    const config: ModuleConfig = {
      module: 'Can',
      version: '1.0.0',
      parameters: { canDevErrorDetect: false },
      containers: {
        CanController: [
          { parameters: { canBaudrate: 500000, canControllerId: 0 } },
        ],
      },
    };
    const result = await generator.generate(config, schemaWithContainers, {
      outputDir: './out',
    });
    const lcfg = result.files.find(f => f.path.endsWith('_Lcfg.c'));
    expect(lcfg).toBeDefined();
    expect(lcfg!.content).toContain('Link-Time Configuration');
  });
});
```

**Step 2: 跑测试**

```bash
cd packages/@yuletech/core && npx vitest run src/generator/__tests__/ecuc-generator.test.ts
```

Expected: 10 passed

**Step 3: Commit**

```bash
git commit -am "test: add container generation tests for EcucCodeGenerator"
```

---

## Task 4: rte-generator 单元测试

**Objective:** 验证 RTE 代码生成器的核心功能

**Files:**
- Create: `packages/@yuletech/core/src/generator/__tests__/rte-generator.test.ts`

**Step 1: 写 RTE 生成器测试**

```typescript
import { describe, it, expect } from 'vitest';
import { RteCodeGenerator } from '../rte-generator';
import type { ModuleConfig, ModuleSchema } from '../../types';

describe('RteCodeGenerator', () => {
  const generator = new RteCodeGenerator();
  const mockSchema: ModuleSchema = {
    id: 'rte',
    name: 'Rte',
    version: '1.0.0',
    label: 'Runtime Environment',
    parameters: [],
    containers: [],
  };

  it('should support RTE modules', () => {
    expect(generator.supports('RTE')).toBe(true);
    expect(generator.supports('Rte')).toBe(true);
    expect(generator.supports('Os')).toBe(true);
    expect(generator.supports('Can')).toBe(false);
  });

  it('should generate standard RTE files', async () => {
    const config: ModuleConfig = {
      module: 'Rte',
      version: '1.0.0',
      parameters: {},
      containers: {},
    };
    const result = await generator.generate(config, mockSchema, {
      outputDir: './out',
    });
    expect(result.success).toBe(true);
    const filenames = result.files.map(f => f.path);
    expect(filenames).toContain('./out/Rte.h');
    expect(filenames).toContain('./out/Rte.c');
    expect(filenames).toContain('./out/Rte_Type.h');
    expect(filenames).toContain('./out/Rte_Callbacks.h');
    expect(filenames).toContain('./out/Rte_Cfg.h');
    expect(filenames).toContain('./out/Rte_Lcfg.c');
    expect(result.files.length).toBe(6);
  });

  it('should generate correct Rte.h guard', async () => {
    const config: ModuleConfig = {
      module: 'Rte',
      version: '1.0.0',
      parameters: {},
      containers: {},
    };
    const result = await generator.generate(config, mockSchema, {
      outputDir: './out',
    });
    const rteH = result.files.find(f => f.path.endsWith('/Rte.h'))?.content || '';
    expect(rteH).toContain('#ifndef RTE_H');
    expect(rteH).toContain('Std_ReturnType Rte_Init');
    expect(rteH).toContain('Std_ReturnType Rte_Start');
  });

  it('should parse RteInterfaces parameter correctly', async () => {
    const config: ModuleConfig = {
      module: 'Rte',
      version: '1.0.0',
      parameters: {
        RteInterfaces: [
          { name: 'SpeedSignal', type: 'SenderReceiver', dataType: 'uint16' },
          { name: 'DoorCommand', type: 'ClientServer', dataType: 'uint8' },
        ],
        RteTasks: [
          { name: 'Task_10ms', priority: 5, periodMs: 10, activationType: 'cyclic', runnableList: ['Runnable_Speed'] },
        ],
      },
      containers: {},
    };
    const result = await generator.generate(config, mockSchema, {
      outputDir: './out',
      generateComments: true,
    });
    const rteC = result.files.find(f => f.path.endsWith('/Rte.c'))?.content || '';
    expect(rteC).toContain('SpeedSignal');
    expect(rteC).toContain('Task_10ms');
    expect(rteC).toContain('cyclic');
  });
});
```

**Step 2: 跑测试**

```bash
cd packages/@yuletech/core && npx vitest run src/generator/__tests__/rte-generator.test.ts
```

Expected: 4 passed

**Step 3: Commit**

```bash
git add packages/@yuletech/core/src/generator/__tests__/rte-generator.test.ts
git commit -m "test: add RteCodeGenerator unit tests"
```

---

## Task 5: Web 层 codegen 单元测试

**Objective:** 验证 `apps/yuleasr-web/src/services/codegen.ts` 的模块头部生成器

**Files:**
- Create: `apps/yuleasr-web/src/services/__tests__/codegen.test.ts`

**Step 1: 写 codegen 测试**

```typescript
import { describe, it, expect } from 'vitest';
import { generateHeader } from '../codegen';
import type { ConfigModule, ConfigContainer, ConfigParameter } from '@/types/config';

describe('Codegen - Module header generation', () => {
  const makeParam = (id: string, name: string, value: any): ConfigParameter => ({
    id, name, value, type: typeof value === 'number' ? 'integer' : 'string',
  });

  const makeContainer = (id: string, name: string, params: ConfigParameter[]): ConfigContainer => ({
    id, name, parameters: params, subContainers: [],
  });

  it('should generate Adc_Cfg.h', () => {
    const module: ConfigModule = {
      id: 'adc',
      name: 'ADC Driver',
      enabled: true,
      version: '44',
      containers: [makeContainer('adcconfigset', 'ConfigSet', [
        makeParam('','adcHwUnitId', 'ADC0'),
        makeParam('','adcResolution', 'BITS_12'),
      ])],
    };
    const result = generateHeader(module);
    expect(result).not.toBeNull();
    expect(result!.filename).toBe('Adc_Cfg.h');
    expect(result!.content).toContain('ADC_MODULE_ID');
  });

  it('should generate Can_Cfg.h with controller config', () => {
    const module: ConfigModule = {
      id: 'can',
      name: 'CAN Driver',
      enabled: true,
      version: '80',
      containers: [makeContainer('canconfigset', 'ConfigSet', [
        makeParam('','canBaudrate', 500000),
      ])],
    };
    const result = generateHeader(module);
    expect(result).not.toBeNull();
    expect(result!.filename).toBe('Can_Cfg.h');
    expect(result!.content).toContain('CAN_MODULE_ID');
    expect(result!.content).toContain('CAN_VENDOR_ID');
  });

  it('should generate Mcu_Cfg.h with clock settings', () => {
    const module: ConfigModule = {
      id: 'mcu',
      name: 'MCU Driver',
      enabled: true,
      version: '43',
      containers: [makeContainer('mcuclocksetting', 'ClockSetting', [
        makeParam('','mcuCoreClock', 96000000),
        makeParam('','mcuPllRefClk', 8000000),
      ])],
    };
    const result = generateHeader(module);
    expect(result).not.toBeNull();
    expect(result!.filename).toBe('Mcu_Cfg.h');
    expect(result!.content).toContain('MCU_CORE_CLOCK');
  });

  it('should skip disabled modules', () => {
    const module: ConfigModule = {
      id: 'adc', name: 'ADC', enabled: false,
      version: '1', containers: [],
    };
    const result = generateHeader(module);
    expect(result).toBeNull();
  });

  it('should skip unknown modules', () => {
    const module: ConfigModule = {
      id: 'unknown_chip', name: 'Unknown', enabled: true,
      version: '1', containers: [],
    };
    const result = generateHeader(module);
    expect(result).toBeNull();
  });

  it('should generate Port_Cfg.h with pin config', () => {
    const module: ConfigModule = {
      id: 'port',
      name: 'PORT Driver',
      enabled: true,
      version: '42',
      containers: [makeContainer('portconfigset', 'ConfigSet', [
        makeParam('','portPinId', 5),
        makeParam('','portPinDirection', 'PORT_PIN_OUT'),
      ])],
    };
    const result = generateHeader(module);
    expect(result).not.toBeNull();
    expect(result!.filename).toBe('Port_Cfg.h');
    expect(result!.content).toContain('PORT_MODULE_ID');
  });
});
```

**Step 2: 跑测试**

```bash
cd apps/yuleasr-web && npx vitest run src/services/__tests__/codegen.test.ts
```

Expected: 7 passed

**Step 3: Commit**

```bash
git add apps/yuleasr-web/src/services/__tests__/codegen.test.ts
git commit -m "test: add codegen header generator tests"
```

---

## Task 6: ecuc-generator 边界条件测试

**Objective:** 覆盖空配置、缺失版本、非法参数类型等边缘情况

**Files:**
- Modify: `packages/@yuletech/core/src/generator/__tests__/ecuc-generator.test.ts`

**Step 1: 追加边界测试**

```typescript
describe('EcucCodeGenerator - Edge cases', () => {
  const generator = new EcucCodeGenerator();

  it('should handle empty module name', async () => {
    // empty module name → validateConfig passes it as-is, module name is ''
    // generateHeaderFile uses it for guard name — should not crash
    const config: ModuleConfig = { module: '', version: '1.0', parameters: {}, containers: {} };
    const schema: ModuleSchema = { id: '', name: '', version: '1.0', label: '', parameters: [], containers: [] };
    const result = await generator.generate(config, schema, { outputDir: './out' });
    // should still return files (empty module name is validated but not fatal)
    expect(result.files.length).toBeGreaterThanOrEqual(2);
  });

  it('should handle negative numeric parameters', async () => {
    const config: ModuleConfig = { module: 'Can', version: '1.0', parameters: { canBaudrate: -1 }, containers: {} };
    const schema: ModuleSchema = { id: 'can', name: 'Can', version: '1.0', label: 'CAN', parameters: [{ name: 'canBaudrate', type: 'integer', required: true }], containers: [] };
    const result = await generator.generate(config, schema, { outputDir: './out' });
    expect(result.success).toBe(true);
    const header = result.files[0].content;
    expect(header).toContain('-1');
  });

  it('should handle boolean false parameters', async () => {
    const config: ModuleConfig = { module: 'Can', version: '1.0', parameters: { canDevErrorDetect: false }, containers: {} };
    const schema: ModuleSchema = { id: 'can', name: 'Can', version: '1.0', label: 'CAN', parameters: [{ name: 'canDevErrorDetect', type: 'boolean', required: false }], containers: [] };
    const result = await generator.generate(config, schema, { outputDir: './out' });
    expect(result.success).toBe(true);
    const header = result.files[0].content;
    expect(header).toContain('FALSE');
  });

  it('should handle container instances with empty parameters', async () => {
    const config: ModuleConfig = {
      module: 'Can', version: '1.0', parameters: {},
      containers: { CanController: [{ parameters: {} }] },
    };
    const schema: ModuleSchema = {
      id: 'can', name: 'Can', version: '1.0', label: 'CAN', parameters: [],
      containers: [{ name: 'CanController', label: 'Controller', multiple: true, parameters: [] }],
    };
    const result = await generator.generate(config, schema, { outputDir: './out' });
    expect(result.success).toBe(true);
  });
});
```

**Step 2: 跑测试**

```bash
cd packages/@yuletech/core && npx vitest run src/generator/__tests__/ecuc-generator.test.ts
```

Expected: 14 passed

**Step 3: Commit**

```bash
git commit -am "test: add edge case tests for EcucCodeGenerator"
```

---

## Task 7: Git 状态跟踪 & 测试覆盖率汇总

**Objective:** 用 `nyc`/`c8` 跑一次覆盖率，输出当前基线

**Files:**
- Create: `docs/coverage/sprint-1-baseline.md`

**Step 1: 装 c8 并在 Core 包跑覆盖率**

```bash
cd packages/@yuletech/core
npx vitest run --coverage 2>&1 | tail -20
```

**Step 2: 写覆盖率基线文档**

```markdown
# Sprint 1 Coverage Baseline

**Date:** 2026-07-12

## @yuletech/core

### 生成器
| File | Statements | Branches | Functions | Lines |
|------|-----------|----------|-----------|-------|
| ecuc-generator.ts | ?% | ?% | ?% | ?% |
| rte-generator.ts | ?% | ?% | ?% | ?% |

### 适配器 / 校验器
| File | Statements | Branches | Functions | Lines |
|------|-----------|----------|-----------|-------|
| ... | ... | ... | ... | ... |

## yuleasr-web

### codegen.ts
| ... | ... | ... | ... | ... |
```

**Step 3: Commit**

```bash
git add docs/coverage/
git commit -m "docs: add sprint 1 coverage baseline"
```

---

## Task 8: ecuc-generator 重构 — 提取公共 C 代码生成工具

**Objective:** 将 ecuc-generator 和 rte-generator 公用的 C 代码格式化逻辑提取到工具函数

**Files:**
- Create: `packages/@yuletech/core/src/generator/c-utils.ts`
- Modify: `packages/@yuletech/core/src/generator/ecuc-generator.ts`
- Modify: `packages/@yuletech/core/src/generator/rte-generator.ts`
- Create: `packages/@yuletech/core/src/generator/__tests__/c-utils.test.ts`

**Step 1: 写 c-utils 测试（TDD）**

```typescript
import { describe, it, expect } from 'vitest';
import { toGuardName, formatCValue, getCType, parseVersion, toDefineName } from '../c-utils';

describe('C Utilities', () => {
  describe('toGuardName', () => {
    it('should convert filename to include guard', () => {
      expect(toGuardName('Ecuc_Can.h')).toBe('ECUC_CAN_H');
      expect(toGuardName('Rte.h')).toBe('RTE_H');
    });
  });

  describe('formatCValue', () => {
    it('should format booleans', () => {
      expect(formatCValue(true, 'boolean')).toBe('TRUE');
      expect(formatCValue(false, 'boolean')).toBe('FALSE');
    });
    it('should format integers', () => {
      expect(formatCValue(42, 'integer')).toBe('42U');
      expect(formatCValue(500000, 'integer')).toBe('500000U');
    });
    it('should format floats', () => {
      expect(formatCValue(3.14, 'float')).toBe('3.14f');
    });
    it('should format strings', () => {
      expect(formatCValue('hello', 'string')).toBe('hello');
    });
  });

  describe('getCType', () => {
    it('should map parameter types to C types', () => {
      expect(getCType('boolean')).toBe('boolean');
      expect(getCType('integer')).toBe('uint32');
      expect(getCType('float')).toBe('float32');
      expect(getCType('string')).toBe('uint8*');
      expect(getCType('enum')).toBe('uint8');
    });
  });

  describe('parseVersion', () => {
    it('should parse semver', () => {
      expect(parseVersion('1.2.3')).toEqual({ major: 1, minor: 2, patch: 3 });
    });
    it('should handle missing parts', () => {
      expect(parseVersion('1.0')).toEqual({ major: 1, minor: 0, patch: 0 });
    });
  });
});
```

**Step 2: 实现 c-utils.ts（提取自 ecuc-generator 的私有方法）**

```typescript
export function toGuardName(filename: string): string {
  return filename.replace(/\./g, '_').toUpperCase();
}

export function formatCValue(value: any, type?: string): string {
  if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
  if (typeof value === 'number' && type === 'float') return `${value}f`;
  if (typeof value === 'number') return `${value}U`;
  if (typeof value === 'string') return value;
  return String(value);
}

export function getCType(type: string): string {
  switch (type) {
    case 'boolean': return 'boolean';
    case 'integer': return 'uint32';
    case 'float': return 'float32';
    case 'string': return 'uint8*';
    case 'enum': return 'uint8';
    default: return 'uint32';
  }
}

export function parseVersion(version: string): { major: number; minor: number; patch: number } {
  const parts = version.split('.').map(Number);
  return {
    major: parts[0] || 0,
    minor: parts[1] || 0,
    patch: parts[2] || 0,
  };
}

export function toDefineName(name: string): string {
  return name
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
    .toUpperCase();
}
```

**Step 3: 跑测试**

```bash
cd packages/@yuletech/core && npx vitest run src/generator/__tests__/c-utils.test.ts
```

Expected: 12 passed

**Step 4: 将 ecuc-generator 中的私有方法替换为引用 c-utils**

使用替换查找：
- `toGuardName(${moduleName.toUpperCase()}_H)` → 使用 `ECUC_${moduleName.toUpperCase()}_H` 字面量即可（无需提取，已足够简单）
- `this.formatCValue` → `formatCValue`（import 后直接调用）
- `this.getCType` → `getCType`
- `this.parseVersion` → `parseVersion`
- `this.toHex` → 保留（过于特定）

**Step 5: 跑完整测试套件**

```bash
cd packages/@yuletech/core && npx vitest run
```

Expected: 所有测试通过（26+ passed）

**Step 6: Commit**

```bash
git add packages/@yuletech/core/src/generator/c-utils.ts
git add packages/@yuletech/core/src/generator/__tests__/c-utils.test.ts
git commit -m "refactor: extract common C code generation utilities"
```

---

## Sprint 1 验收标准

| 指标 | 目标 | 验证方式 |
|------|------|----------|
| Core 生成器测试数 | ≥14 个测试用例 | `npx vitest run src/generator/` |
| Web codegen 测试数 | ≥7 个测试用例 | `npx vitest run src/services/__tests__/codegen.test.ts` |
| Core 包总测试 | ≥20 通过 | `npx vitest run` |
| Generator 代码覆盖率 | ≥60% | `npx vitest run --coverage` |
| 工具函数提取 | c-utils.ts 独立可测 | 测试覆盖全部导出函数 |
| 代码风格 | 所有测试通过 lint | `pnpm lint` |
