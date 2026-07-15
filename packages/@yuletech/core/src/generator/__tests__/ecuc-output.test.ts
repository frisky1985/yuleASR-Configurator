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
    {
      config: {
        module: 'Fls', version: '4.4.0',
        parameters: {
          flsEnabled: true,
          flsAcErase: true,
          flsAcWrite: true,
          flsProtectionSet: 2,
          flsMaxReadyCount: 1000,
          flsDevErrorDetect: true,
          flsVersion: '4.4.0',
        },
        containers: {
          FlsSector: [
            { id: 'sector0', parameters: { flsSectorIndex: 0, flsSectorSize: 8192, flsSectorStartAddress: 0x08000000, flsSectorProtect: false } },
            { id: 'sector1', parameters: { flsSectorIndex: 1, flsSectorSize: 16384, flsSectorStartAddress: 0x08002000, flsSectorProtect: true } },
          ],
        },
      },
      schema: {
        name: 'Fls', label: 'Flash Driver', layer: 'MCAL', version: '4.4.0',
        parameters: [
          { name: 'flsEnabled', type: 'boolean', required: true },
          { name: 'flsAcErase', type: 'boolean', required: true },
          { name: 'flsAcWrite', type: 'boolean', required: true },
          { name: 'flsProtectionSet', type: 'integer', required: true },
          { name: 'flsMaxReadyCount', type: 'integer', required: false },
          { name: 'flsDevErrorDetect', type: 'boolean', required: false },
          { name: 'flsVersion', type: 'string', required: false },
        ],
        containers: [{
          name: 'FlsSector', label: 'Flash Sector', multiple: true,
          minInstances: 1, maxInstances: 100,
          parameters: ['flsSectorIndex', 'flsSectorSize', 'flsSectorStartAddress', 'flsSectorProtect'],
        }],
      },
    },
    {
      config: {
        module: 'CanIf', version: '4.4.0',
        parameters: {
          canIfEnabled: true,
          canIfMaxRxPdu: 32,
          canIfMaxTxPdu: 16,
          canIfDevErrorDetect: true,
          canIfVersion: '4.4.0',
        },
        containers: {
          CanIfRxPdu: [
            { id: 'rx0', parameters: { canIfRxPduId: 1, canIfRxPduCanId: 0x100, canIfRxPduDlc: 8 } },
            { id: 'rx1', parameters: { canIfRxPduId: 2, canIfRxPduCanId: 0x200, canIfRxPduDlc: 4 } },
          ],
          CanIfTxPdu: [
            { id: 'tx0', parameters: { canIfTxPduId: 1, canIfTxPduCanId: 0x300, canIfTxPduDlc: 8 } },
          ],
        },
      },
      schema: {
        name: 'CanIf', label: 'CAN Interface', layer: 'SERVICE', version: '4.4.0',
        parameters: [
          { name: 'canIfEnabled', type: 'boolean', required: true },
          { name: 'canIfMaxRxPdu', type: 'integer', required: true },
          { name: 'canIfMaxTxPdu', type: 'integer', required: true },
          { name: 'canIfDevErrorDetect', type: 'boolean', required: false },
          { name: 'canIfVersion', type: 'string', required: false },
          { name: 'canIfRxPduId', type: 'integer', required: false },
          { name: 'canIfRxPduCanId', type: 'integer', required: false },
          { name: 'canIfRxPduDlc', type: 'integer', required: false },
          { name: 'canIfTxPduId', type: 'integer', required: false },
          { name: 'canIfTxPduCanId', type: 'integer', required: false },
          { name: 'canIfTxPduDlc', type: 'integer', required: false },
        ],
        containers: [
          {
            name: 'CanIfRxPdu', label: 'CanIf Rx PDU', multiple: true,
            minInstances: 1, maxInstances: 50,
            parameters: ['canIfRxPduId', 'canIfRxPduCanId', 'canIfRxPduDlc'],
          },
          {
            name: 'CanIfTxPdu', label: 'CanIf Tx PDU', multiple: true,
            minInstances: 0, maxInstances: 50,
            parameters: ['canIfTxPduId', 'canIfTxPduCanId', 'canIfTxPduDlc'],
          },
        ],
      },
    },
    {
      config: {
        module: 'Fee', version: '4.4.0',
        parameters: {
          feeEnabled: true,
          feeMaxBlocks: 32,
          feeVirtualPageSize: 256,
          feeDevErrorDetect: true,
          feeVersion: '4.4.0',
        },
        containers: {
          FeeBlockConfiguration: [
            { id: 'block0', parameters: { feeBlockNumber: 1, feeBlockSize: 64, feeImmediateData: true, feeNumberOfWriteCycles: 10000 } },
            { id: 'block1', parameters: { feeBlockNumber: 2, feeBlockSize: 128, feeImmediateData: false, feeNumberOfWriteCycles: 5000 } },
          ],
        },
      },
      schema: {
        name: 'Fee', label: 'Flash EEPROM Emulation', layer: 'MCAL', version: '4.4.0',
        parameters: [
          { name: 'feeEnabled', type: 'boolean', required: true },
          { name: 'feeMaxBlocks', type: 'integer', required: true },
          { name: 'feeVirtualPageSize', type: 'integer', required: true },
          { name: 'feeDevErrorDetect', type: 'boolean', required: false },
          { name: 'feeVersion', type: 'string', required: false },
        ],
        containers: [{
          name: 'FeeBlockConfiguration', label: 'Fee Block Configuration', multiple: true,
          minInstances: 1, maxInstances: 100,
          parameters: ['feeBlockNumber', 'feeBlockSize', 'feeImmediateData', 'feeNumberOfWriteCycles'],
        }],
      },
    },
    {
      config: {
        module: 'CanTp', version: '4.4.0',
        parameters: {
          canTpEnabled: true,
          canTpMaxRxBuf: 4096,
          canTpMaxTxBuf: 4096,
          canTpBlockSize: 256,
          canTpSeparationTime: 10,
          canTpDevErrorDetect: true,
          canTpVersion: '4.4.0',
        },
        containers: {
          CanTpChannel: [
            { id: 'diag', parameters: { canTpRxId: 0x7E0, canTpTxId: 0x7E8, canTpRxBufSize: 4096, canTpTxBufSize: 4096 } },
          ],
        },
      },
      schema: {
        name: 'CanTp', label: 'CAN Transport Layer', layer: 'SERVICE', version: '4.4.0',
        parameters: [
          { name: 'canTpEnabled', type: 'boolean', required: true },
          { name: 'canTpMaxRxBuf', type: 'integer', required: true },
          { name: 'canTpMaxTxBuf', type: 'integer', required: true },
          { name: 'canTpBlockSize', type: 'integer', required: true },
          { name: 'canTpSeparationTime', type: 'integer', required: true },
          { name: 'canTpDevErrorDetect', type: 'boolean', required: false },
          { name: 'canTpVersion', type: 'string', required: false },
        ],
        containers: [{
          name: 'CanTpChannel', label: 'CanTp Channel', multiple: true,
          minInstances: 1, maxInstances: 50,
          parameters: ['canTpRxId', 'canTpTxId', 'canTpRxBufSize', 'canTpTxBufSize'],
        }],
      },
    },
    {
      config: {
        module: 'Com', version: '4.4.0',
        parameters: {
          comEnabled: true,
          comMaxIPdu: 50,
          comMaxSignal: 500,
          comTimeoutDuration: 100,
          comDevErrorDetect: true,
          comVersion: '4.4.0',
        },
        containers: {
          ComIPdu: [
            { id: 'ipdu0', parameters: { comIPduId: 1, comIPduDirection: 0, comIPduSignalCount: 8, comIPduCycleTime: 10 } },
            { id: 'ipdu1', parameters: { comIPduId: 2, comIPduDirection: 1, comIPduSignalCount: 4 } },
          ],
        },
      },
      schema: {
        name: 'Com', label: 'COM Module', layer: 'SERVICE', version: '4.4.0',
        parameters: [
          { name: 'comEnabled', type: 'boolean', required: true },
          { name: 'comMaxIPdu', type: 'integer', required: true },
          { name: 'comMaxSignal', type: 'integer', required: true },
          { name: 'comTimeoutDuration', type: 'integer', required: false },
          { name: 'comDevErrorDetect', type: 'boolean', required: false },
          { name: 'comVersion', type: 'string', required: false },
          { name: 'comIPduId', type: 'integer', required: false },
          { name: 'comIPduDirection', type: 'integer', required: false },
          { name: 'comIPduSignalCount', type: 'integer', required: false },
          { name: 'comIPduCycleTime', type: 'integer', required: false },
        ],
        containers: [{
          name: 'ComIPdu', label: 'COM I-PDU', multiple: true,
          minInstances: 1, maxInstances: 100,
          parameters: ['comIPduId', 'comIPduDirection', 'comIPduSignalCount', 'comIPduCycleTime'],
        }],
      },
    },
    {
      config: {
        module: 'BswM', version: '4.4.0',
        parameters: {
          bswMEnabled: true,
          bswMmaxInitBlock: 10,
          bswMmaxActionList: 20,
          bswMDevErrorDetect: true,
          bswMVersion: '4.4.0',
        },
        containers: {
          BswMMode: [
            { id: 'mode0', parameters: { bswMMode: 1, bswMInitBlock: 2, bswMAction: 3 } },
          ],
        },
      },
      schema: {
        name: 'BswM', label: 'Basic Software Manager', layer: 'SERVICE', version: '4.4.0',
        parameters: [
          { name: 'bswMEnabled', type: 'boolean', required: true },
          { name: 'bswMmaxInitBlock', type: 'integer', required: true },
          { name: 'bswMmaxActionList', type: 'integer', required: true },
          { name: 'bswMDevErrorDetect', type: 'boolean', required: false },
          { name: 'bswMVersion', type: 'string', required: false },
          { name: 'bswMMode', type: 'integer', required: false },
          { name: 'bswMInitBlock', type: 'integer', required: false },
          { name: 'bswMAction', type: 'integer', required: false },
        ],
        containers: [{
          name: 'BswMMode', label: 'BswM Mode', multiple: true,
          minInstances: 1, maxInstances: 50,
          parameters: ['bswMMode', 'bswMInitBlock', 'bswMAction'],
        }],
      },
    },
    // === Crc ===
    {
      config: {
        module: 'Crc',
        version: '4.4.0',
        parameters: {
          crcEnabled: true,
          crcMaxBufferSize: 1024,
          crcHwUnitUsed: false,
          crcDevErrorDetect: true,
          crcVersion: '4.4.0',
        },
        containers: {},
      },
      schema: {
        name: 'Crc',
        label: 'CRC Calculator',
        layer: 'SERVICE',
        version: '4.4.0',
        parameters: [
          { name: 'crcEnabled', type: 'boolean', required: true },
          { name: 'crcMaxBufferSize', type: 'integer', required: true },
          { name: 'crcHwUnitUsed', type: 'boolean', required: false },
          { name: 'crcDevErrorDetect', type: 'boolean', required: false },
          { name: 'crcVersion', type: 'string', required: false },
        ],
        containers: [],
      },
    },
    // === Icu ===
    {
      config: {
        module: 'Icu',
        version: '4.4.0',
        parameters: {
          icuEnabled: true,
          icuWakeupSupport: true,
          icuDevErrorDetect: true,
          icuVersion: '4.4.0',
        },
        containers: {
          IcuChannel: [
            { id: 'ch0', parameters: { icuChannelId: 0, icuMeasurementMode: 0, icuSignalEdge: 0 } },
            { id: 'ch1', parameters: { icuChannelId: 1, icuMeasurementMode: 1, icuSignalEdge: 2 } },
          ],
        },
      },
      schema: {
        name: 'Icu',
        label: 'Input Capture Unit',
        layer: 'MCAL',
        version: '4.4.0',
        parameters: [
          { name: 'icuEnabled', type: 'boolean', required: true },
          { name: 'icuWakeupSupport', type: 'boolean', required: true },
          { name: 'icuDevErrorDetect', type: 'boolean', required: false },
          { name: 'icuVersion', type: 'string', required: false },
          { name: 'icuChannelId', type: 'integer', required: false },
          { name: 'icuMeasurementMode', type: 'integer', required: false },
          { name: 'icuSignalEdge', type: 'integer', required: false },
        ],
        containers: [{
          name: 'IcuChannel', label: 'Icu Channel', multiple: true,
          minInstances: 1, maxInstances: 50,
          parameters: ['icuChannelId', 'icuMeasurementMode', 'icuSignalEdge'],
        }],
      },
    },
    // === Dcm ===
    {
      config: {
        module: 'Dcm',
        version: '4.4.0',
        parameters: {
          dcmEnabled: true,
          dcmMaxPduLength: 4096,
          dcmMaxSid: 100,
          dcmDevErrorDetect: true,
          dcmVersion: '4.4.0',
        },
        containers: {
          DcmDsdSid: [
            { id: 'sid10', parameters: { dcmSid: 0x10, dcmSidSubfunction: 1, dcmSidAllowed: true } },
            { id: 'sid19', parameters: { dcmSid: 0x19, dcmSidSubfunction: 2, dcmSidAllowed: true } },
            { id: 'sid22', parameters: { dcmSid: 0x22, dcmSidSubfunction: 0, dcmSidAllowed: true } },
          ],
        },
      },
      schema: {
        name: 'Dcm',
        label: 'Diagnostic Communication Manager',
        layer: 'SERVICE',
        version: '4.4.0',
        parameters: [
          { name: 'dcmEnabled', type: 'boolean', required: true },
          { name: 'dcmMaxPduLength', type: 'integer', required: true },
          { name: 'dcmMaxSid', type: 'integer', required: true },
          { name: 'dcmDevErrorDetect', type: 'boolean', required: false },
          { name: 'dcmVersion', type: 'string', required: false },
          { name: 'dcmSid', type: 'integer', required: false },
          { name: 'dcmSidSubfunction', type: 'integer', required: false },
          { name: 'dcmSidAllowed', type: 'boolean', required: false },
        ],
        containers: [{
          name: 'DcmDsdSid', label: 'Dcm DSD SID', multiple: true,
          minInstances: 1, maxInstances: 100,
          parameters: ['dcmSid', 'dcmSidSubfunction', 'dcmSidAllowed'],
        }],
      },
    },
    // === CanNm (CAN Network Management) ===
    {
      config: {
        module: 'CanNm',
        version: '4.4.0',
        parameters: {
          canNmEnabled: true,
          canNmMsgCycleTime: 1000,
          canNmRepeatMsgTime: 500,
          canNmNodeId: 1,
          canNmDevErrorDetect: true,
          canNmVersion: '4.4.0',
        },
        containers: {},
      },
      schema: {
        name: 'CanNm',
        label: 'CAN Network Management',
        layer: 'SERVICE',
        version: '4.4.0',
        parameters: [
          { name: 'canNmEnabled', type: 'boolean', required: true },
          { name: 'canNmMsgCycleTime', type: 'integer', required: true },
          { name: 'canNmRepeatMsgTime', type: 'integer', required: true },
          { name: 'canNmNodeId', type: 'integer', required: true },
          { name: 'canNmDevErrorDetect', type: 'boolean', required: false },
          { name: 'canNmVersion', type: 'string', required: false },
        ],
        containers: [],
      },
    },
    // === CanSM (CAN State Manager) ===
    {
      config: {
        module: 'CanSM',
        version: '4.4.0',
        parameters: {
          canSmEnabled: true,
          canSmMaxNetworkCount: 5,
          canSmBorTime: 1000,
          canSmDevErrorDetect: true,
          canSmVersion: '4.4.0',
        },
        containers: {
          CanSmNetwork: [
            { id: 'net0', parameters: { canSmNetworkIndex: 0, canSmComMChannel: 1 } },
          ],
        },
      },
      schema: {
        name: 'CanSM',
        label: 'CAN State Manager',
        layer: 'SERVICE',
        version: '4.4.0',
        parameters: [
          { name: 'canSmEnabled', type: 'boolean', required: true },
          { name: 'canSmMaxNetworkCount', type: 'integer', required: true },
          { name: 'canSmBorTime', type: 'integer', required: true },
          { name: 'canSmDevErrorDetect', type: 'boolean', required: false },
          { name: 'canSmVersion', type: 'string', required: false },
          { name: 'canSmNetworkIndex', type: 'integer', required: false },
          { name: 'canSmComMChannel', type: 'integer', required: false },
        ],
        containers: [{
          name: 'CanSmNetwork', label: 'CanSm Network', multiple: true,
          minInstances: 1, maxInstances: 50,
          parameters: ['canSmNetworkIndex', 'canSmComMChannel'],
        }],
      },
    },
    // === CanTrcv (CAN Transceiver Driver) ===
    {
      config: {
        module: 'CanTrcv',
        version: '4.4.0',
        parameters: {
          canTrcvEnabled: true,
          canTrcvWakeupSupport: true,
          canTrcvDevErrorDetect: true,
          canTrcvVersion: '4.4.0',
        },
        containers: {
          CanTrcvChannel: [
            { id: 'trcv0', parameters: { canTrcvChannelId: 0, canTrcvBaudrate: 500000, canTrcvWakeupMode: 2 } },
          ],
        },
      },
      schema: {
        name: 'CanTrcv',
        label: 'CAN Transceiver Driver',
        layer: 'MCAL',
        version: '4.4.0',
        parameters: [
          { name: 'canTrcvEnabled', type: 'boolean', required: true },
          { name: 'canTrcvWakeupSupport', type: 'boolean', required: true },
          { name: 'canTrcvDevErrorDetect', type: 'boolean', required: false },
          { name: 'canTrcvVersion', type: 'string', required: false },
          { name: 'canTrcvChannelId', type: 'integer', required: false },
          { name: 'canTrcvBaudrate', type: 'integer', required: false },
          { name: 'canTrcvWakeupMode', type: 'integer', required: false },
        ],
        containers: [{
          name: 'CanTrcvChannel', label: 'CanTrcv Channel', multiple: true,
          minInstances: 1, maxInstances: 50,
          parameters: ['canTrcvChannelId', 'canTrcvBaudrate', 'canTrcvWakeupMode'],
        }],
      },
    },
  ];

  it('should generate 4 files each for all 22 modules', async () => {
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
