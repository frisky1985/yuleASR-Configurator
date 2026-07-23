#!/usr/bin/env npx tsx
/**
 * generate-modules-b2b5.mjs
 * Generate AUTOSAR ECUC files for Dio, Adc, Spi, Gpt, Pwm
 * Usage: npx tsx scripts/generate-modules-b2b5.mjs [outputDir]
 */
import { mkdtempSync, writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { tmpdir } from 'os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONFIGURATOR_DIR = join(__dirname, '..');

// Dynamic import of ecuc-generator
const { EcucCodeGenerator } = await import(
  join(CONFIGURATOR_DIR, 'packages/@yuletech/core/src/generator/ecuc-generator.ts')
);

const gen = new EcucCodeGenerator();
const outputDir = join(CONFIGURATOR_DIR, 'yuleasr-ecuc-output');
mkdirSync(outputDir, { recursive: true });

function writeAUTOSARStubs(dir) {
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
#define STD_HIGH 1
#define STD_LOW 0
#define NULL_PTR ((void*)0)
typedef uint16 Std_ReturnType;
#define E_OK ((Std_ReturnType)0u)
#define E_NOT_OK ((Std_ReturnType)1u)
typedef struct { uint16 vendorID; uint16 moduleID; uint8 sw_major_version; uint8 sw_minor_version; uint8 sw_patch_version; } Std_VersionInfoType;
#endif
`);
  writeFileSync(join(dir, 'Ecuc.h'), `
#ifndef ECUC_H
#define ECUC_H
#include "Std_Types.h"
#endif
`);
}

// Module definitions based on existing yuleASR config headers
const moduleDefs = [
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
      dioNumChannelGroups: 4,
    },
    paramDefs: [
      { name: 'dioDevErrorDetect', type: 'boolean', required: true },
      { name: 'dioVersionInfoApi', type: 'boolean', required: false },
      { name: 'dioFlipChannelApi', type: 'boolean', required: false },
      { name: 'dioMaskedWritePortApi', type: 'boolean', required: false },
      { name: 'dioNumPorts', type: 'integer', required: true },
      { name: 'dioNumChannelsPerPort', type: 'integer', required: false },
      { name: 'dioNumChannelGroups', type: 'integer', required: false },
    ],
    containers: {
      DioPort: [
        { id: 'pa', parameters: { portId: 0, portName: 'PORT_A' } },
        { id: 'pb', parameters: { portId: 1, portName: 'PORT_B' } },
      ],
      DioChannel: [
        { id: 'a0', parameters: { channelId: 0x0000, channelName: 'CHANNEL_A0', portRef: 0 } },
        { id: 'b0', parameters: { channelId: 0x0100, channelName: 'CHANNEL_B0', portRef: 1 } },
      ],
    },
    containerDefs: [
      { name: 'DioPort', label: 'DIO Port', multiple: true, minInstances: 1, maxInstances: 8,
        parameters: ['portId', 'portName'] },
      { name: 'DioChannel', label: 'DIO Channel', multiple: true, minInstances: 1, maxInstances: 64,
        parameters: ['channelId', 'channelName', 'portRef'] },
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
      { name: 'adcVersionInfoApi', type: 'boolean', required: false },
      { name: 'adcDeInitApi', type: 'boolean', required: false },
      { name: 'adcHwTriggerApi', type: 'boolean', required: false },
      { name: 'adcNumHwUnits', type: 'integer', required: true },
      { name: 'adcNumGroups', type: 'integer', required: true },
      { name: 'adcNumChannels', type: 'integer', required: true },
      { name: 'adcClockFrequencyHz', type: 'integer', required: false },
    ],
    containers: {
      AdcHwUnit: [
        { id: 'hw0', parameters: { hwUnitId: 0 } },
        { id: 'hw1', parameters: { hwUnitId: 1 } },
      ],
      AdcGroup: [
        { id: 'grp0', parameters: { groupId: 0, hwUnitRef: 0, groupName: 'GROUP_0' } },
        { id: 'grp1', parameters: { groupId: 1, hwUnitRef: 0, groupName: 'GROUP_1' } },
      ],
      AdcChannel: [
        { id: 'ch0', parameters: { channelId: 0, channelName: 'CHANNEL_0' } },
        { id: 'ch1', parameters: { channelId: 1, channelName: 'CHANNEL_1' } },
      ],
    },
    containerDefs: [
      { name: 'AdcHwUnit', label: 'ADC HW Unit', multiple: true, minInstances: 1, maxInstances: 8,
        parameters: ['hwUnitId'] },
      { name: 'AdcGroup', label: 'ADC Group', multiple: true, minInstances: 1, maxInstances: 16,
        parameters: ['groupId', 'hwUnitRef', 'groupName'] },
      { name: 'AdcChannel', label: 'ADC Channel', multiple: true, minInstances: 1, maxInstances: 32,
        parameters: ['channelId', 'channelName'] },
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
      spiCancelApi: true,
      spiNumChannels: 8,
      spiNumJobs: 8,
      spiNumSequences: 4,
      spiNumHwUnits: 4,
      spiMaxBufferSize: 256,
    },
    paramDefs: [
      { name: 'spiDevErrorDetect', type: 'boolean', required: true },
      { name: 'spiVersionInfoApi', type: 'boolean', required: false },
      { name: 'spiChannelBuffersAllowed', type: 'integer', required: true },
      { name: 'spiHwStatusApi', type: 'boolean', required: false },
      { name: 'spiCancelApi', type: 'boolean', required: false },
      { name: 'spiNumChannels', type: 'integer', required: true },
      { name: 'spiNumJobs', type: 'integer', required: true },
      { name: 'spiNumSequences', type: 'integer', required: true },
      { name: 'spiNumHwUnits', type: 'integer', required: true },
      { name: 'spiMaxBufferSize', type: 'integer', required: false },
    ],
    containers: {
      SpiChannel: [
        { id: 'ch0', parameters: { channelId: 0, channelName: 'CHANNEL_0' } },
        { id: 'ch1', parameters: { channelId: 1, channelName: 'CHANNEL_1' } },
      ],
      SpiJob: [
        { id: 'job0', parameters: { jobId: 0, jobName: 'JOB_0' } },
        { id: 'job1', parameters: { jobId: 1, jobName: 'JOB_1' } },
      ],
      SpiSequence: [
        { id: 'seq0', parameters: { sequenceId: 0, sequenceName: 'SEQUENCE_0' } },
      ],
      SpiHwUnit: [
        { id: 'hw0', parameters: { hwUnitId: 0 } },
        { id: 'hw1', parameters: { hwUnitId: 1 } },
      ],
    },
    containerDefs: [
      { name: 'SpiChannel', label: 'SPI Channel', multiple: true, minInstances: 1, maxInstances: 16,
        parameters: ['channelId', 'channelName'] },
      { name: 'SpiJob', label: 'SPI Job', multiple: true, minInstances: 1, maxInstances: 16,
        parameters: ['jobId', 'jobName'] },
      { name: 'SpiSequence', label: 'SPI Sequence', multiple: true, minInstances: 1, maxInstances: 8,
        parameters: ['sequenceId', 'sequenceName'] },
      { name: 'SpiHwUnit', label: 'SPI HW Unit', multiple: true, minInstances: 1, maxInstances: 8,
        parameters: ['hwUnitId'] },
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
      { name: 'gptVersionInfoApi', type: 'boolean', required: false },
      { name: 'gptDeinitApi', type: 'boolean', required: false },
      { name: 'gptTimeElapsedApi', type: 'boolean', required: false },
      { name: 'gptTimeRemainingApi', type: 'boolean', required: false },
      { name: 'gptNumChannels', type: 'integer', required: true },
      { name: 'gptClockFrequencyHz', type: 'integer', required: false },
      { name: 'gptMaxTickValue', type: 'integer', required: false },
    ],
    containers: {
      GptChannel: [
        { id: 'ch0', parameters: { channelId: 0, channelName: 'CHANNEL_0', tickFrequency: 1000000 } },
        { id: 'ch1', parameters: { channelId: 1, channelName: 'CHANNEL_1', tickFrequency: 1000000 } },
      ],
    },
    containerDefs: [
      { name: 'GptChannel', label: 'GPT Channel', multiple: true, minInstances: 1, maxInstances: 16,
        parameters: ['channelId', 'channelName', 'tickFrequency'] },
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
      pwmSetOutputToIdleApi: true,
      pwmGetOutputStateApi: true,
      pwmNotificationSupported: true,
      pwmNumChannels: 8,
      pwmClockFrequencyHz: 24000000,
    },
    paramDefs: [
      { name: 'pwmDevErrorDetect', type: 'boolean', required: true },
      { name: 'pwmVersionInfoApi', type: 'boolean', required: false },
      { name: 'pwmDeInitApi', type: 'boolean', required: false },
      { name: 'pwmSetDutyCycleApi', type: 'boolean', required: false },
      { name: 'pwmNotificationSupported', type: 'boolean', required: false },
      { name: 'pwmNumChannels', type: 'integer', required: true },
    ],
    containers: {
      PwmChannel: [
        { id: 'ch0', parameters: { channelId: 0, channelName: 'CHANNEL_0', defaultPeriod: 1000, defaultDutyCycle: 0x4000 } },
        { id: 'ch1', parameters: { channelId: 1, channelName: 'CHANNEL_1', defaultPeriod: 1000, defaultDutyCycle: 0x4000 } },
      ],
    },
    containerDefs: [
      { name: 'PwmChannel', label: 'PWM Channel', multiple: true, minInstances: 1, maxInstances: 16,
        parameters: ['channelId', 'channelName', 'defaultPeriod', 'defaultDutyCycle'] },
    ],
  },
];

console.log('==============================================');
console.log(' yuleASR Phase B2-B5: Generate ECUC Files');
console.log('  Modules: Dio, Adc, Spi, Gpt, Pwm');
console.log('==============================================\n');

// Write stubs
writeAUTOSARStubs(outputDir);
console.log(' AUTOSAR stubs written\n');

// Generate each module
let allFiles = [];
for (const def of moduleDefs) {
  console.log(` --- ${def.module} (${def.label}) ---`);

  const config = {
    module: def.module,
    version: def.version,
    parameters: def.parameters,
    containers: def.containers,
  };
  const schema = {
    name: def.module,
    label: def.label,
    layer: 'MCAL',
    version: def.version,
    parameters: def.paramDefs,
    containers: def.containerDefs,
  };

  const result = await gen.generate(config, schema, {
    outputDir,
    generateComments: true,
  });

  if (!result.success) {
    console.error(`   ❌ Generation failed: ${result.errors.join(', ')}`);
    process.exit(1);
  }

  for (const f of result.files) {
    writeFileSync(f.path, f.content);
    console.log(`   WROTE ${f.path.replace(outputDir + '/', '')}`);
  }
  allFiles.push(...result.files);
  console.log();
}

console.log(` Total files generated: ${allFiles.length}\n`);

// Syntax check all files
console.log('=== GCC Syntax Check ===\n');

let pass = 0, fail = 0;
for (const file of allFiles) {
  const label = file.path.replace(outputDir + '/', '');
  try {
    if (file.language === 'h') {
      execSync(`gcc -fsyntax-only -x c -I ${outputDir} ${file.path}`, { stdio: 'pipe', timeout: 15000 });
    } else {
      execSync(`gcc -fsyntax-only -I ${outputDir} -include ${outputDir}/Std_Types.h ${file.path}`, { stdio: 'pipe', timeout: 15000 });
    }
    console.log(`  ✅ ${label}`);
    pass++;
  } catch (e) {
    const stderr = e.stderr?.toString() || '';
    console.log(`  ⚠️  ${label}:`);
    stderr.split('\n').filter(l => l.includes('error:')).forEach(l => console.log(`    ${l.trim()}`));
    fail++;
  }
}

console.log(`\n==============================================`);
console.log(` RESULTS`);
console.log(`  ✅ Passed: ${pass}`);
console.log(`  ⚠️  Failed: ${fail}`);
console.log(`==============================================`);

if (fail === 0) {
  console.log('\n All phase B2-B5 generated files pass syntax check!');
  process.exit(0);
} else {
  console.log('\n Some files have issues.');
  process.exit(1);
}
