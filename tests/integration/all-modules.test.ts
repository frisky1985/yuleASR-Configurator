/**
 * yuleASR-Configurator 集成测试套件
 *
 * 覆盖所有 8 个 BSW 模块 (Can/Mcu/Port/Dio/Adc/Spi/Gpt/Pwm)
 * 测试流程: generate → write → syntax-check → compare-with-reference
 */

import { execSync } from 'child_process';
import { mkdtempSync, writeFileSync, rmSync, existsSync, readFileSync, mkdirSync, copyFileSync } from 'fs';
import { tmpdir } from 'os';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import { describe, it, expect, beforeAll, afterAll } from 'vitest';

let EcucCodeGenerator: any;
let gen: any;

/** Minimal type stubs matching what we need */
interface ModuleConfig {
  module: string;
  version: string;
  parameters: Record<string, unknown>;
  containers: Record<string, Array<{ id: string; parameters: Record<string, unknown> }>>;
}

interface ModuleSchemaField {
  name: string;
  type: string;
  required?: boolean;
}

interface ModuleSchemaContainer {
  name: string;
  label: string;
  multiple?: boolean;
  minInstances?: number;
  maxInstances?: number;
  parameters: string[];
}

interface ModuleSchema {
  name: string;
  label: string;
  layer: string;
  version: string;
  parameters: ModuleSchemaField[];
  containers: ModuleSchemaContainer[];
}

/** AUTOSAR stub headers for syntax checking */
function writeAUTOSARStubs(dir: string) {
  writeFileSync(join(dir, 'Std_Types.h'), `
#ifndef STD_TYPES_H
#define STD_TYPES_H
typedef unsigned char boolean;
typedef unsigned char uint8;
typedef unsigned short uint16;
typedef unsigned int uint32;
typedef signed char sint8;
typedef signed short sint16;
typedef signed int sint32;
typedef float float32;
typedef double float64;
#define TRUE 1
#define FALSE 0
#define STD_ON 1
#define STD_OFF 0
#define NULL_PTR ((void*)0)
typedef uint16 Std_ReturnType;
typedef struct { uint16 vendorID; uint16 moduleID; uint8 sw_major_version; uint8 sw_minor_version; uint8 sw_patch_version; } Std_VersionInfoType;
#define E_OK ((Std_ReturnType)0u)
#define E_NOT_OK ((Std_ReturnType)1u)
#endif
`);
  writeFileSync(join(dir, 'Ecuc.h'), `#ifndef ECUC_H\n#define ECUC_H\n#include "Std_Types.h"\n#endif\n`);
  writeFileSync(join(dir, 'MemMap.h'), MEMORY_MAP_STUBS);
}

const MEMORY_MAP_STUBS = `
#ifndef MEMMAP_H
#define MEMMAP_H
/* Memory section macros */
#define MCU_START_SEC_CONFIG_DATA_UNSPECIFIED
#define MCU_STOP_SEC_CONFIG_DATA_UNSPECIFIED
#define MCU_START_SEC_CODE
#define MCU_STOP_SEC_CODE
#define PORT_START_SEC_CONFIG_DATA_UNSPECIFIED
#define PORT_STOP_SEC_CONFIG_DATA_UNSPECIFIED
#define PORT_START_SEC_CODE
#define PORT_STOP_SEC_CODE
#define CAN_START_SEC_CONFIG_DATA_UNSPECIFIED
#define CAN_STOP_SEC_CONFIG_DATA_UNSPECIFIED
#define CAN_START_SEC_CODE
#define CAN_STOP_SEC_CODE
#define DIO_START_SEC_CONFIG_DATA_UNSPECIFIED
#define DIO_STOP_SEC_CONFIG_DATA_UNSPECIFIED
#define DIO_START_SEC_CODE
#define DIO_STOP_SEC_CODE
#define ADC_START_SEC_CONFIG_DATA_UNSPECIFIED
#define ADC_STOP_SEC_CONFIG_DATA_UNSPECIFIED
#define ADC_START_SEC_CODE
#define ADC_STOP_SEC_CODE
#define SPI_START_SEC_CONFIG_DATA_UNSPECIFIED
#define SPI_STOP_SEC_CONFIG_DATA_UNSPECIFIED
#define SPI_START_SEC_CODE
#define SPI_STOP_SEC_CODE
#define GPT_START_SEC_CONFIG_DATA_UNSPECIFIED
#define GPT_STOP_SEC_CONFIG_DATA_UNSPECIFIED
#define GPT_START_SEC_CODE
#define GPT_STOP_SEC_CODE
#define PWM_START_SEC_CONFIG_DATA_UNSPECIFIED
#define PWM_STOP_SEC_CONFIG_DATA_UNSPECIFIED
#define PWM_START_SEC_CODE
#define PWM_STOP_SEC_CODE
/* Compiler abstraction */
#define FUNC(ret, memclass) ret
#define VAR(type, memclass) type
#define CONST(type, memclass) const type
#define P2CONST(type, memclass, ptrclass) const type*
#define P2VAR(type, memclass, ptrclass) type*
#define CONSTP2CONST(type, memclass, ptrclass, ptrclass2) const type* const
#define CONSTP2VAR(type, memclass, ptrclass, ptrclass2) type* const
#endif
`;

/** Module definitions for all 8 BSW modules */
export interface ModuleDef {
  module: string;
  label: string;
  version: string;
  parameters: Record<string, unknown>;
  paramDefs: Array<{ name: string; type: string; required?: boolean }>;
  containers: Record<string, Array<{ id: string; parameters: Record<string, unknown> }>>;
  containerDefs: Array<{
    name: string;
    label: string;
    multiple?: boolean;
    minInstances?: number;
    maxInstances?: number;
    parameters: string[];
  }>;
}

export const MODULE_DEFINITIONS: ModuleDef[] = [
  {
    module: 'Can',
    label: 'CAN Driver',
    version: '4.4.0',
    parameters: {
      canDevErrorDetect: true,
      canVersionInfoApi: true,
      canNumControllers: 2,
      canNumHoh: 8,
      canNumBaudrateConfigs: 1,
      canBaudrate500K: 500000,
    },
    paramDefs: [
      { name: 'canDevErrorDetect', type: 'boolean', required: true },
      { name: 'canVersionInfoApi', type: 'boolean' },
      { name: 'canNumControllers', type: 'integer', required: true },
      { name: 'canNumHoh', type: 'integer', required: true },
    ],
    containers: {
      CanController: [
        { id: 'c0', parameters: { canControllerId: 0, canBaudrate: 500000 } },
        { id: 'c1', parameters: { canControllerId: 1, canBaudrate: 500000 } },
      ],
      CanHardwareObject: [
        { id: 'hoh0', parameters: { hohId: 0, hohType: 'RX' } },
        { id: 'hoh1', parameters: { hohId: 1, hohType: 'RX' } },
      ],
    },
    containerDefs: [
      { name: 'CanController', label: 'CAN Controller', multiple: true, minInstances: 1, maxInstances: 4, parameters: ['canControllerId', 'canBaudrate'] },
      { name: 'CanHardwareObject', label: 'CAN Hardware Object', multiple: true, minInstances: 1, maxInstances: 32, parameters: ['hohId', 'hohType'] },
    ],
  },
  {
    module: 'Mcu',
    label: 'MCU Driver',
    version: '4.4.0',
    parameters: { mcuClockSetting: 16000000, mcuRamSectors: 4, mcuDevErrorDetect: true },
    paramDefs: [
      { name: 'mcuClockSetting', type: 'integer', required: true },
      { name: 'mcuRamSectors', type: 'integer' },
      { name: 'mcuDevErrorDetect', type: 'boolean' },
    ],
    containers: {
      McuClockSettingConfig: [{ id: 'clk0', parameters: { clockId: 0, clockFrequency: 16000000 } }],
    },
    containerDefs: [
      { name: 'McuClockSettingConfig', label: 'Clock Setting', multiple: true, minInstances: 1, maxInstances: 8, parameters: ['clockId', 'clockFrequency'] },
    ],
  },
  {
    module: 'Port',
    label: 'PORT Driver',
    version: '4.4.0',
    parameters: { portDevErrorDetect: true, portPinCount: 8 },
    paramDefs: [
      { name: 'portDevErrorDetect', type: 'boolean' },
      { name: 'portPinCount', type: 'integer', required: true },
    ],
    containers: {
      PortPin: [
        { id: 'p0', parameters: { pinId: 0, pinDirection: 1 } },
        { id: 'p1', parameters: { pinId: 1, pinDirection: 0 } },
      ],
    },
    containerDefs: [
      { name: 'PortPin', label: 'Port Pin', multiple: true, minInstances: 1, maxInstances: 64, parameters: ['pinId', 'pinDirection'] },
    ],
  },
  {
    module: 'Dio',
    label: 'DIO Driver',
    version: '4.4.0',
    parameters: {
      dioDevErrorDetect: true,
      dioVersionInfoApi: true,
      dioFlipChannelApi: true,
      dioMaskedWritePortApi: true,
      dioNumPorts: 8,
      dioNumChannelsPerPort: 32,
    },
    paramDefs: [
      { name: 'dioDevErrorDetect', type: 'boolean', required: true },
      { name: 'dioVersionInfoApi', type: 'boolean' },
      { name: 'dioFlipChannelApi', type: 'boolean' },
      { name: 'dioNumPorts', type: 'integer', required: true },
    ],
    containers: {
      DioPort: [
        { id: 'pa', parameters: { portId: 0 } },
        { id: 'pb', parameters: { portId: 1 } },
      ],
      DioChannel: [
        { id: 'a0', parameters: { channelId: 0x0000, portRef: 0 } },
        { id: 'b0', parameters: { channelId: 0x0100, portRef: 1 } },
      ],
    },
    containerDefs: [
      { name: 'DioPort', label: 'DIO Port', multiple: true, minInstances: 1, maxInstances: 8, parameters: ['portId'] },
      { name: 'DioChannel', label: 'DIO Channel', multiple: true, minInstances: 1, maxInstances: 64, parameters: ['channelId', 'portRef'] },
    ],
  },
  {
    module: 'Adc',
    label: 'ADC Driver',
    version: '4.4.0',
    parameters: {
      adcDevErrorDetect: true,
      adcVersionInfoApi: true,
      adcDeInitApi: true,
      adcHwTriggerApi: true,
      adcNumHwUnits: 2,
      adcNumGroups: 8,
      adcNumChannels: 16,
      adcClockFrequencyHz: 24000000,
    },
    paramDefs: [
      { name: 'adcDevErrorDetect', type: 'boolean', required: true },
      { name: 'adcNumHwUnits', type: 'integer', required: true },
      { name: 'adcNumGroups', type: 'integer', required: true },
      { name: 'adcNumChannels', type: 'integer', required: true },
    ],
    containers: {
      AdcHwUnit: [
        { id: 'hw0', parameters: { hwUnitId: 0 } },
        { id: 'hw1', parameters: { hwUnitId: 1 } },
      ],
      AdcGroup: [
        { id: 'grp0', parameters: { groupId: 0, hwUnitRef: 0 } },
      ],
      AdcChannel: [
        { id: 'ch0', parameters: { channelId: 0 } },
        { id: 'ch1', parameters: { channelId: 1 } },
      ],
    },
    containerDefs: [
      { name: 'AdcHwUnit', label: 'ADC HW Unit', multiple: true, minInstances: 1, maxInstances: 8, parameters: ['hwUnitId'] },
      { name: 'AdcGroup', label: 'ADC Group', multiple: true, minInstances: 1, maxInstances: 16, parameters: ['groupId', 'hwUnitRef'] },
      { name: 'AdcChannel', label: 'ADC Channel', multiple: true, minInstances: 1, maxInstances: 32, parameters: ['channelId'] },
    ],
  },
  {
    module: 'Spi',
    label: 'SPI Driver',
    version: '4.4.0',
    parameters: {
      spiDevErrorDetect: true,
      spiVersionInfoApi: true,
      spiChannelBuffersAllowed: 2,
      spiHwStatusApi: true,
      spiNumChannels: 8,
      spiNumJobs: 8,
      spiNumSequences: 4,
      spiNumHwUnits: 4,
      spiMaxBufferSize: 256,
    },
    paramDefs: [
      { name: 'spiDevErrorDetect', type: 'boolean', required: true },
      { name: 'spiNumChannels', type: 'integer', required: true },
      { name: 'spiNumJobs', type: 'integer', required: true },
      { name: 'spiNumSequences', type: 'integer', required: true },
    ],
    containers: {
      SpiChannel: [
        { id: 'ch0', parameters: { channelId: 0 } },
        { id: 'ch1', parameters: { channelId: 1 } },
      ],
      SpiHwUnit: [
        { id: 'hw0', parameters: { hwUnitId: 0 } },
        { id: 'hw1', parameters: { hwUnitId: 1 } },
      ],
    },
    containerDefs: [
      { name: 'SpiChannel', label: 'SPI Channel', multiple: true, minInstances: 1, maxInstances: 16, parameters: ['channelId'] },
      { name: 'SpiHwUnit', label: 'SPI HW Unit', multiple: true, minInstances: 1, maxInstances: 8, parameters: ['hwUnitId'] },
    ],
  },
  {
    module: 'Gpt',
    label: 'GPT Driver',
    version: '4.4.0',
    parameters: {
      gptDevErrorDetect: true,
      gptVersionInfoApi: true,
      gptDeinitApi: true,
      gptTimeElapsedApi: true,
      gptTimeRemainingApi: true,
      gptNumChannels: 8,
      gptClockFrequencyHz: 24000000,
      gptMaxTickValue: 0xFFFFFFFF,
    },
    paramDefs: [
      { name: 'gptDevErrorDetect', type: 'boolean', required: true },
      { name: 'gptNumChannels', type: 'integer', required: true },
    ],
    containers: {
      GptChannel: [
        { id: 'ch0', parameters: { channelId: 0, tickFrequency: 1000000 } },
        { id: 'ch1', parameters: { channelId: 1, tickFrequency: 1000000 } },
      ],
    },
    containerDefs: [
      { name: 'GptChannel', label: 'GPT Channel', multiple: true, minInstances: 1, maxInstances: 16, parameters: ['channelId', 'tickFrequency'] },
    ],
  },
  {
    module: 'Pwm',
    label: 'PWM Driver',
    version: '4.4.0',
    parameters: {
      pwmDevErrorDetect: true,
      pwmVersionInfoApi: true,
      pwmDeInitApi: true,
      pwmSetDutyCycleApi: true,
      pwmSetPeriodAndDutyApi: true,
      pwmNotificationSupported: true,
      pwmNumChannels: 8,
      pwmClockFrequencyHz: 24000000,
    },
    paramDefs: [
      { name: 'pwmDevErrorDetect', type: 'boolean', required: true },
      { name: 'pwmNumChannels', type: 'integer', required: true },
    ],
    containers: {
      PwmChannel: [
        { id: 'ch0', parameters: { channelId: 0, defaultPeriod: 1000, defaultDutyCycle: 0x4000 } },
        { id: 'ch1', parameters: { channelId: 1, defaultPeriod: 1000, defaultDutyCycle: 0x4000 } },
      ],
    },
    containerDefs: [
      { name: 'PwmChannel', label: 'PWM Channel', multiple: true, minInstances: 1, maxInstances: 16, parameters: ['channelId', 'defaultPeriod', 'defaultDutyCycle'] },
    ],
  },
];

/** Expected ECUC filenames per module */
function ecucFilenames(module: string): string[] {
  return [
    `Ecuc_${module}_Cfg.h`,
    `Ecuc_${module}.c`,
    `Ecuc_${module}_PBcfg.c`,
    `Ecuc_${module}_Lcfg.c`,
  ];
}

/** Run GCC syntax check on a file */
function gccSyntaxCheck(filePath: string, includeDirs: string[]): boolean {
  const includeFlags = includeDirs.map(d => `-I${d}`).join(' ');
  const isHeader = filePath.endsWith('.h');
  try {
    if (isHeader) {
      execSync(`gcc -fsyntax-only -x c ${includeFlags} "${filePath}"`, { stdio: 'pipe', timeout: 30000 });
    } else {
      execSync(`gcc -fsyntax-only ${includeFlags} -include Std_Types.h "${filePath}"`, { stdio: 'pipe', timeout: 30000 });
    }
    return true;
  } catch {
    return false;
  }
}

describe('yuleASR-Configurator Integration Suite', () => {
  let tempDir: string;
  let stubDir: string;

  beforeAll(async () => {
    // Dynamic import the EcucCodeGenerator from core source
    const genModule = await import('../../packages/@yuletech/core/src/generator/ecuc-generator.ts');
    EcucCodeGenerator = genModule.EcucCodeGenerator;
    gen = new EcucCodeGenerator();

    // Create temp dirs
    tempDir = mkdtempSync(join(tmpdir(), 'yule-int-'));
    stubDir = join(tempDir, 'stubs');
    mkdirSync(stubDir, { recursive: true });
    writeAUTOSARStubs(stubDir);
  });

  afterAll(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  // ── Test 1: ECUC Generation for all modules ──────────────
  describe('C1 — ECUC Generation', () => {
    for (const def of MODULE_DEFINITIONS) {
      it(`${def.module}: generates 4 ECUC files`, async () => {
        const config: ModuleConfig = {
          module: def.module,
          version: def.version,
          parameters: def.parameters,
          containers: def.containers,
        };
        const schema: ModuleSchema = {
          name: def.module,
          label: def.label,
          layer: 'MCAL',
          version: def.version,
          parameters: def.paramDefs,
          containers: def.containerDefs,
        };

        const moduleDir = join(tempDir, def.module);
        mkdirSync(moduleDir, { recursive: true });

        const result = await gen.generate(config, schema, {
          outputDir: moduleDir,
          generateComments: true,
        });

        expect(result.success).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.files).toHaveLength(4);

        const filenames = ecucFilenames(def.module);
        for (const f of filenames) {
          expect(result.files.some((rf: any) => rf.filename === f || rf.path?.endsWith(f))).toBe(true);
        }
      });
    }
  });

  // ── Test 2: Syntax Check for all modules ─────────────────
  describe('C1 — GCC Syntax Check', () => {
    for (const def of MODULE_DEFINITIONS) {
      it(`${def.module}: all ECUC files pass syntax check`, async () => {
        const config: ModuleConfig = {
          module: def.module,
          version: def.version,
          parameters: def.parameters,
          containers: def.containers,
        };
        const schema: ModuleSchema = {
          name: def.module,
          label: def.label,
          layer: 'MCAL',
          version: def.version,
          parameters: def.paramDefs,
          containers: def.containerDefs,
        };

        const moduleDir = join(tempDir, def.module, 'syntax');
        mkdirSync(moduleDir, { recursive: true });

        const result = await gen.generate(config, schema, {
          outputDir: moduleDir,
          generateComments: true,
        });

        expect(result.success).toBe(true);

        let allPass = true;
        const failures: string[] = [];
        for (const f of result.files) {
          const filePath = join(tempDir, def.module, 'syntax', f.filename);
          writeFileSync(filePath, f.content);
          const ok = gccSyntaxCheck(filePath, [stubDir, moduleDir]);
          if (!ok) {
            allPass = false;
            failures.push(f.filename);
          }
        }

        expect(allPass, `Syntax check failed for: ${failures.join(', ')}`).toBe(true);
      });
    }
  });

  // ── Test 3: Std_Types.h compatible output ────────────────
  describe('C1 — AUTOSAR Compliance', () => {
    for (const def of MODULE_DEFINITIONS) {
      it(`${def.module}: generated files contain expected AUTOSAR elements`, async () => {
        const config: ModuleConfig = {
          module: def.module,
          version: def.version,
          parameters: def.parameters,
          containers: def.containers,
        };
        const schema: ModuleSchema = {
          name: def.module,
          label: def.label,
          layer: 'MCAL',
          version: def.version,
          parameters: def.paramDefs,
          containers: def.containerDefs,
        };

        const moduleDir = join(tempDir, def.module, 'compliance');
        mkdirSync(moduleDir, { recursive: true });

        const result = await gen.generate(config, schema, {
          outputDir: moduleDir,
          generateComments: true,
        });

        expect(result.success).toBe(true);

        const cfgFile = result.files.find((f: any) => f.filename.endsWith('Cfg.h'));
        expect(cfgFile).toBeDefined();
        expect(cfgFile.content).toContain('#ifndef');
        expect(cfgFile.content).toContain('MODULE_ID');
        expect(cfgFile.content).toContain('VENDOR_ID');
      });
    }
  });

  // ── Test 4: Generation determinism (identical output) ────
  describe('C2 — Output Determinism', () => {
    for (const def of MODULE_DEFINITIONS) {
      it(`${def.module}: two generations produce identical output`, async () => {
        const config: ModuleConfig = {
          module: def.module,
          version: def.version,
          parameters: def.parameters,
          containers: def.containers,
        };
        const schema: ModuleSchema = {
          name: def.module,
          label: def.label,
          layer: 'MCAL',
          version: def.version,
          parameters: def.paramDefs,
          containers: def.containerDefs,
        };

        const dir1 = join(tempDir, def.module, 'det1');
        const dir2 = join(tempDir, def.module, 'det2');
        mkdirSync(dir1, { recursive: true });
        mkdirSync(dir2, { recursive: true });

        const r1 = await gen.generate(config, schema, { outputDir: dir1 });
        const r2 = await gen.generate(config, schema, { outputDir: dir2 });

        expect(r1.files.length).toBe(r2.files.length);

        for (let i = 0; i < r1.files.length; i++) {
          const content1 = r1.files[i].content;
          const content2 = r2.files[i].content;
          expect(content1).toBe(content2);
        }
      });
    }
  });
});
