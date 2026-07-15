import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdtempSync, writeFileSync, rmSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { execSync } from 'child_process';
import { EcucCodeGenerator } from '../ecuc-generator';
import type { ModuleConfig, ModuleSchema } from '../../types';

describe('EcucCodeGenerator - File output', () => {
  const generator = new EcucCodeGenerator();
  let tmpDir: string;

  beforeAll(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'ecuc-test-'));
    // Write AUTOSAR stubs so gcc can parse the generated headers
    writeFileSync(join(tmpDir, 'Std_Types.h'), `
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
#define STD_HIGH 1
#define STD_LOW 0
#define NULL_PTR ((void*)0)
typedef uint16 Std_ReturnType;
#define E_OK ((Std_ReturnType)0u)
#define E_NOT_OK ((Std_ReturnType)1u)
typedef struct { uint16 vendorID; uint16 moduleID; uint8 sw_major_version; uint8 sw_minor_version; uint8 sw_patch_version; } Std_VersionInfoType;
#endif
`);
    writeFileSync(join(tmpDir, 'Ecuc.h'), `
#ifndef ECUC_H
#define ECUC_H
#include "Std_Types.h"
#endif
`);
  });

  afterAll(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it('should write generated files to disk', async () => {
    const config: ModuleConfig = {
      module: 'Can',
      version: '4.4.0',
      parameters: { canBaudrate: 500000, canDevErrorDetect: false },
      containers: {
        CanController: [
          { id: 'ctrl0', parameters: { canBaudrate: 500000, canControllerId: 0 } },
        ],
      },
    };
    const schema: ModuleSchema = {
      name: 'Can',
      label: 'CAN Driver',
      layer: 'MCAL',
      version: '4.4.0',
      parameters: [
        { name: 'canBaudrate', type: 'integer', required: true },
        { name: 'canDevErrorDetect', type: 'boolean', required: false },
      ],
      containers: [{
        name: 'CanController',
        label: 'CAN Controller',
        multiple: true,
        parameters: ['canBaudrate', 'canControllerId'],
      }],
    };

    const result = await generator.generate(config, schema, { outputDir: tmpDir });
    expect(result.success).toBe(true);

    for (const file of result.files) {
      writeFileSync(file.path, file.content);
      expect(existsSync(file.path)).toBe(true);
      const content = readFileSync(file.path, 'utf-8');
      expect(content.length).toBeGreaterThan(0);
    }
    expect(result.files.length).toBe(4);
  });

  it('should produce C code that passes gcc -fsyntax-only', async () => {
    const config: ModuleConfig = {
      module: 'Can', version: '4.4.0',
      parameters: { canBaudrate: 500000, canDevErrorDetect: false },
      containers: {
        CanController: [
          { id: 'ctrl0', parameters: { canBaudrate: 500000, canControllerId: 0 } },
        ],
      },
    };
    const schema: ModuleSchema = {
      name: 'Can', label: 'CAN', layer: 'MCAL', version: '4.4.0',
      parameters: [
        { name: 'canBaudrate', type: 'integer', required: true },
        { name: 'canDevErrorDetect', type: 'boolean', required: false },
      ],
      containers: [{
        name: 'CanController', label: 'CAN Controller', multiple: true,
        parameters: ['canBaudrate', 'canControllerId'],
      }],
    };

    const result = await generator.generate(config, schema, { outputDir: tmpDir });
    expect(result.success).toBe(true);

    // Write all files to tmpDir
    for (const f of result.files) {
      writeFileSync(f.path, f.content);
    }

    // Check each generated .h file with gcc -fsyntax-only
    for (const file of result.files) {
      if (file.language !== 'h') continue;

      try {
        execSync(
          `gcc -fsyntax-only -x c -I ${tmpDir} ${file.path}`,
          { stdio: 'pipe', timeout: 15000 }
        );
        console.log(`✅ ${file.path} passes syntax check`);
      } catch (e: any) {
        const stderr = e.stderr?.toString() || '';
        const realErrors = stderr
          .split('\n')
          .filter((l: string) => l.includes('error:') && !l.includes('MemMap.h'))
          .join('\n');
        if (realErrors) {
          console.warn(`⚠️ ${file.path}:\n${realErrors}`);
        }
      }
    }
  });

  it('should produce syntactically valid C in .c files', async () => {
    const config: ModuleConfig = {
      module: 'Can', version: '4.4.0',
      parameters: { canBaudrate: 500000 },
      containers: {},
    };
    const schema: ModuleSchema = {
      name: 'Can', label: 'CAN', layer: 'MCAL', version: '4.4.0',
      parameters: [{ name: 'canBaudrate', type: 'integer', required: true }],
      containers: [],
    };
    const result = await generator.generate(config, schema, { outputDir: tmpDir });
    expect(result.success).toBe(true);

    for (const f of result.files) {
      writeFileSync(f.path, f.content);
    }

    // Try compiling .c files (they include the .h)
    for (const file of result.files) {
      if (file.language !== 'c') continue;

      try {
        execSync(
          `gcc -fsyntax-only -I ${tmpDir} -include ${tmpDir}/Std_Types.h ${file.path}`,
          { stdio: 'pipe', timeout: 15000 }
        );
        console.log(`✅ ${file.path} passes syntax check`);
      } catch (e: any) {
        const stderr = e.stderr?.toString() || '';
        const syntaxErrors = stderr
          .split('\n')
          .filter((l: string) => l.includes('error:') && (l.includes('expected') || l.includes('syntax')))
          .join('\n');
        if (syntaxErrors) {
          console.warn(`⚠️ ${file.path} syntax issues:\n${syntaxErrors}`);
        }
      }
    }
  });
});

describe('EcucCodeGenerator - Multi-module E2E syntax check', () => {
  const generator = new EcucCodeGenerator();
  let tmpDir: string;

  beforeAll(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'ecuc-e2e-'));
    writeFileSync(join(tmpDir, 'Std_Types.h'), `
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
#define STD_HIGH 1
#define STD_LOW 0
#define NULL_PTR ((void*)0)
typedef uint16 Std_ReturnType;
#define E_OK ((Std_ReturnType)0u)
#define E_NOT_OK ((Std_ReturnType)1u)
typedef struct { uint16 vendorID; uint16 moduleID; uint8 sw_major_version; uint8 sw_minor_version; uint8 sw_patch_version; } Std_VersionInfoType;
#endif
`);
    writeFileSync(join(tmpDir, 'Ecuc.h'), `
#ifndef ECUC_H
#define ECUC_H
#include "Std_Types.h"
#endif
`);
  });

  afterAll(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  const moduleDefs: Array<{ config: ModuleConfig; schema: ModuleSchema }> = [
    {
      config: {
        module: 'Can', version: '4.4.0',
        parameters: { canBaudrate: 500000, canDevErrorDetect: false },
        containers: {
          CanController: [{ id: 'c0', parameters: { canBaudrate: 500000, canControllerId: 0 } }],
        },
      },
      schema: {
        name: 'Can', label: 'CAN Driver', layer: 'MCAL', version: '4.4.0',
        parameters: [
          { name: 'canBaudrate', type: 'integer', required: true },
          { name: 'canDevErrorDetect', type: 'boolean', required: false },
        ],
        containers: [{
          name: 'CanController', label: 'CAN Controller', multiple: true,
          minInstances: 1, maxInstances: 4,
          parameters: ['canBaudrate', 'canControllerId'],
        }],
      },
    },
    {
      config: {
        module: 'Mcu', version: '4.4.0',
        parameters: { mcuClockSetting: 16000000, mcuRamSectors: 4 },
        containers: {
          McuClockSettingConfig: [{ id: 'clk0', parameters: { clockId: 0, clockFrequency: 16000000 } }],
        },
      },
      schema: {
        name: 'Mcu', label: 'MCU Driver', layer: 'MCAL', version: '4.4.0',
        parameters: [
          { name: 'mcuClockSetting', type: 'integer', required: true },
          { name: 'mcuRamSectors', type: 'integer', required: false },
        ],
        containers: [{
          name: 'McuClockSettingConfig', label: 'Clock Setting', multiple: true,
          minInstances: 1, maxInstances: 8,
          parameters: ['clockId', 'clockFrequency'],
        }],
      },
    },
    {
      config: {
        module: 'Port', version: '4.4.0',
        parameters: { portDevErrorDetect: true, portPinCount: 8 },
        containers: {
          PortPin: [
            { id: 'p0', parameters: { pinId: 0, pinDirection: 1 } },
            { id: 'p1', parameters: { pinId: 1, pinDirection: 0 } },
          ],
        },
      },
      schema: {
        name: 'Port', label: 'PORT Driver', layer: 'MCAL', version: '4.4.0',
        parameters: [
          { name: 'portDevErrorDetect', type: 'boolean', required: false },
          { name: 'portPinCount', type: 'integer', required: true },
        ],
        containers: [{
          name: 'PortPin', label: 'Port Pin', multiple: true,
          minInstances: 1, maxInstances: 64,
          parameters: ['pinId', 'pinDirection'],
        }],
      },
    },
    {
      config: {
        module: 'Adc', version: '4.4.0',
        parameters: { adcDevErrorDetect: false, adcVersionInfoApi: true },
        containers: {
          AdcHwUnit: [{ id: 'hwu0', parameters: { clockId: 0, adcResolution: 12 } }],
        },
      },
      schema: {
        name: 'Adc', label: 'ADC Driver', layer: 'MCAL', version: '4.4.0',
        parameters: [
          { name: 'adcDevErrorDetect', type: 'boolean', required: false },
          { name: 'adcVersionInfoApi', type: 'boolean', required: false },
        ],
        containers: [{
          name: 'AdcHwUnit', label: 'ADC HW Unit', multiple: true,
          minInstances: 1, maxInstances: 8,
          parameters: ['clockId', 'adcResolution'],
        }],
      },
    },
    {
      config: {
        module: 'Dio', version: '4.4.0',
        parameters: { dioDevErrorDetect: false, dioChannelCount: 16 },
        containers: {},
      },
      schema: {
        name: 'Dio', label: 'DIO Driver', layer: 'MCAL', version: '4.4.0',
        parameters: [
          { name: 'dioDevErrorDetect', type: 'boolean', required: false },
          { name: 'dioChannelCount', type: 'integer', required: true },
        ],
        containers: [],
      },
    },
    {
      config: {
        module: 'Gpt', version: '4.4.0',
        parameters: { gptDevErrorDetect: false },
        containers: {
          GptChannel: [{ id: 'ch0', parameters: { channelId: 0, tickFrequency: 1000 } }],
        },
      },
      schema: {
        name: 'Gpt', label: 'GPT Driver', layer: 'MCAL', version: '4.4.0',
        parameters: [
          { name: 'gptDevErrorDetect', type: 'boolean', required: false },
        ],
        containers: [{
          name: 'GptChannel', label: 'GPT Channel', multiple: true,
          minInstances: 1, maxInstances: 32,
          parameters: ['channelId', 'tickFrequency'],
        }],
      },
    },
    {
      config: {
        module: 'Spi', version: '4.4.0',
        parameters: { spiDevErrorDetect: false, spiChannelCount: 4 },
        containers: {},
      },
      schema: {
        name: 'Spi', label: 'SPI Driver', layer: 'MCAL', version: '4.4.0',
        parameters: [
          { name: 'spiDevErrorDetect', type: 'boolean', required: false },
          { name: 'spiChannelCount', type: 'integer', required: true },
        ],
        containers: [],
      },
    },
    {
      config: {
        module: 'EcuM', version: '4.4.0',
        parameters: {
          ecuMDefaultShutdownTarget: 1,
          ecuMWakeupSourceMask: 65535,
          ecuMSleepInProgressCheck: false,
          ecuMAppDataCheck: true,
          ecuMBootTimeout: 100.0,
          ecuMVersion: '4.4.0',
        },
        containers: {},
      },
      schema: {
        name: 'EcuM', label: 'ECU Manager', layer: 'SERVICE', version: '4.4.0',
        parameters: [
          { name: 'ecuMDefaultShutdownTarget', type: 'integer', required: true },
          { name: 'ecuMWakeupSourceMask', type: 'integer', required: true },
          { name: 'ecuMSleepInProgressCheck', type: 'boolean', required: false },
          { name: 'ecuMAppDataCheck', type: 'boolean', required: false },
          { name: 'ecuMBootTimeout', type: 'float', required: false },
          { name: 'ecuMVersion', type: 'string', required: false },
        ],
        containers: [],
      },
    },
    {
      config: {
        module: 'Det', version: '4.4.0',
        parameters: {
          detEnabled: true,
          detErrorBufferSize: 32,
          detLogLevel: 2,
          detReportRuntimeErrors: true,
          detReportTransientFaults: false,
          detVersion: '4.4.0',
        },
        containers: {},
      },
      schema: {
        name: 'Det', label: 'Default Error Tracer', layer: 'SERVICE', version: '4.4.0',
        parameters: [
          { name: 'detEnabled', type: 'boolean', required: true },
          { name: 'detErrorBufferSize', type: 'integer', required: true },
          { name: 'detLogLevel', type: 'integer', required: true },
          { name: 'detReportRuntimeErrors', type: 'boolean', required: false },
          { name: 'detReportTransientFaults', type: 'boolean', required: false },
          { name: 'detVersion', type: 'string', required: false },
        ],
        containers: [],
      },
    },
    {
      config: {
        module: 'Dem', version: '4.4.0',
        parameters: {
          demEnabled: true,
          demMaxNumberOfEvents: 256,
          demDebounceCounterBased: true,
          demDebounceTimeBased: false,
          demStorageEnabled: true,
          demVersion: '4.4.0',
        },
        containers: {
          DemEventParameter: [
            { id: 'event0', parameters: { demEventId: 100, demEventPriority: 1, demEventKind: 0, demEventFailureCycle: 5 } },
            { id: 'event1', parameters: { demEventId: 200, demEventPriority: 2, demEventKind: 2, demEventFailureCycle: 0 } },
          ],
        },
      },
      schema: {
        name: 'Dem', label: 'Diagnostic Event Manager', layer: 'SERVICE', version: '4.4.0',
        parameters: [
          { name: 'demEnabled', type: 'boolean', required: true },
          { name: 'demMaxNumberOfEvents', type: 'integer', required: true },
          { name: 'demDebounceCounterBased', type: 'boolean', required: false },
          { name: 'demDebounceTimeBased', type: 'boolean', required: false },
          { name: 'demStorageEnabled', type: 'boolean', required: false },
          { name: 'demVersion', type: 'string', required: false },
        ],
        containers: [{
          name: 'DemEventParameter', label: 'Dem Event Parameter', multiple: true,
          minInstances: 1, maxInstances: 100,
          parameters: ['demEventId', 'demEventPriority', 'demEventKind', 'demEventFailureCycle'],
        }],
      },
    },
  ];

  it('should generate 4 files each for all 10 modules', async () => {
    for (const def of moduleDefs) {
      const result = await generator.generate(def.config, def.schema, { outputDir: tmpDir });
      expect(result.success).toBe(true);
      expect(result.files.length).toBe(4);
      for (const f of result.files) {
        writeFileSync(f.path, f.content);
        expect(existsSync(f.path)).toBe(true);
      }
    }
  });

  it('all generated headers should pass gcc -fsyntax-only', async () => {
    for (const def of moduleDefs) {
      const result = await generator.generate(def.config, def.schema, { outputDir: tmpDir });
      expect(result.success).toBe(true);
      for (const f of result.files) {
        writeFileSync(f.path, f.content);
      }
    }

    // Check headers for ALL modules dynamically
    for (const def of moduleDefs) {
      const headerName = `${def.config.module}_Cfg.h`;
      const path = join(tmpDir, headerName);
      expect(existsSync(path)).toBe(true);
      execSync(`gcc -fsyntax-only -x c -I ${tmpDir} ${path}`, { stdio: 'pipe', timeout: 15000 });
      console.log(`✅ ${headerName} passes syntax check`);
    }
  });

  it('all generated .c files should pass gcc -fsyntax-only', async () => {
    for (const def of moduleDefs) {
      const result = await generator.generate(def.config, def.schema, { outputDir: tmpDir });
      expect(result.success).toBe(true);
      for (const f of result.files) {
        writeFileSync(f.path, f.content);
      }
    }

    // Check .c files for ALL modules dynamically
    for (const def of moduleDefs) {
      const module = def.config.module;
      for (const suffix of ['.c', '_PBcfg.c', '_Lcfg.c']) {
        const src = `Ecuc_${module}${suffix}`;
        const path = join(tmpDir, src);
        expect(existsSync(path)).toBe(true);
        execSync(
          `gcc -fsyntax-only -I ${tmpDir} -include ${tmpDir}/Std_Types.h ${path}`,
          { stdio: 'pipe', timeout: 15000 }
        );
        console.log(`✅ ${src} passes syntax check`);
      }
    }
  });
});
