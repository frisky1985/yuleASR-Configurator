#!/usr/bin/env node
/**
 * Generate ECUC files for Can, Mcu, Port and write to yuleASR config/generated/
 * Uses the compiled dist JS for portability.
 */
import { createRequire } from 'module';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const configDir = join(__dirname, '..');
const corePkg = join(configDir, 'packages/@yuletech/core');

// Use the dist JS entry (compiled version)
const require = createRequire(corePkg);
const generatorMod = require(join(corePkg, 'dist/generator/index.js'));

const gen = new generatorMod.EcucCodeGenerator();
const outputDir = process.argv[2] || join(configDir, 'yuleasr-output');

// AUTOSAR stubs
const stubsDir = join(outputDir, '_stubs');
mkdirSync(stubsDir, { recursive: true });
mkdirSync(outputDir, { recursive: true });

writeFileSync(join(stubsDir, 'Std_Types.h'), `
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
#define E_OK ((Std_ReturnType)0u)
#define E_NOT_OK ((Std_ReturnType)1u)
typedef struct { uint16 vendorID; uint16 moduleID; uint8 sw_major_version; uint8 sw_minor_version; uint8 sw_patch_version; } Std_VersionInfoType;
#endif
`);

writeFileSync(join(stubsDir, 'Ecuc.h'), `#ifndef ECUC_H\n#define ECUC_H\n#include "Std_Types.h"\n#endif\n`);
writeFileSync(join(stubsDir, 'MemMap.h'), `#ifndef MEMMAP_H\n#define MEMMAP_H\n#endif\n`);

console.log('AUTOSAR stubs written\n');

// Module definitions
const moduleDefs = [
  {
    name: 'Can',
    config: {
      module: 'Can',
      version: '4.4.0',
      parameters: { canBaudrate: 500000, canDevErrorDetect: false },
      containers: {
        CanController: [{ id: 'c0', parameters: { canBaudrate: 500000, canControllerId: 0 } }],
      },
    },
    schema: {
      name: 'Can',
      label: 'CAN Driver',
      layer: 'MCAL',
      version: '4.4.0',
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
    name: 'Mcu',
    config: {
      module: 'Mcu',
      version: '4.4.0',
      parameters: { mcuClockSetting: 16000000, mcuRamSectors: 4 },
      containers: {
        McuClockSettingConfig: [{ id: 'clk0', parameters: { clockId: 0, clockFrequency: 16000000 } }],
      },
    },
    schema: {
      name: 'Mcu',
      label: 'MCU Driver',
      layer: 'MCAL',
      version: '4.4.0',
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
    name: 'Port',
    config: {
      module: 'Port',
      version: '4.4.0',
      parameters: { portDevErrorDetect: true, portPinCount: 8 },
      containers: {
        PortPin: [
          { id: 'p0', parameters: { pinId: 0, pinDirection: 1 } },
          { id: 'p1', parameters: { pinId: 1, pinDirection: 0 } },
        ],
      },
    },
    schema: {
      name: 'Port',
      label: 'PORT Driver',
      layer: 'MCAL',
      version: '4.4.0',
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
];

const generatedFiles = [];

for (const def of moduleDefs) {
  console.log(`--- ${def.name} ---`);
  const result = await gen.generate(def.config, def.schema, { outputDir, generateComments: true });

  if (!result.success) {
    console.error(`❌ Failed: ${result.errors?.join(', ')}`);
    process.exit(1);
  }

  for (const f of result.files) {
    writeFileSync(f.path, f.content);
    console.log(`  ✓ ${f.path.replace(outputDir + '/', '')}`);
    generatedFiles.push(f);
  }
  console.log();
}

console.log(`Total: ${generatedFiles.length} files generated\n`);

// Syntax check
const { execSync } = await import('child_process');
console.log('=== GCC Syntax Check ===\n');

let pass = 0, fail = 0;
for (const file of generatedFiles) {
  const label = file.path.replace(outputDir + '/', '');
  try {
    if (file.language === 'h') {
      execSync(`gcc -fsyntax-only -x c -I${stubsDir} -I${outputDir} ${file.path}`, { stdio: 'pipe', timeout: 15000 });
    } else {
      execSync(`gcc -fsyntax-only -I${stubsDir} -I${outputDir} -include ${stubsDir}/Std_Types.h ${file.path}`, { stdio: 'pipe', timeout: 15000 });
    }
    console.log(`  ✅ ${label}`);
    pass++;
  } catch (e) {
    console.log(`  ❌ ${label}:`);
    const stderr = e.stderr?.toString() || '';
    stderr.split('\n').filter(l => l.includes('error:')).forEach(l => console.log(`    ${l.trim()}`));
    fail++;
  }
}

console.log(`\nResults: ${pass} passed, ${fail} failed`);
