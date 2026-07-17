#!/usr/bin/env npx tsx
/**
 * generate-all-modules.js (tsx)
 * Generate AUTOSAR config files for Can, Mcu, Port via ecuc-generator
 * Usage: npx tsx scripts/generate-all-modules.js [outputDir]
 */
import { mkdtempSync, writeFileSync, readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { tmpdir } from 'os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONFIGURATOR_DIR = join(__dirname, '..');

// Dynamically import the generator
const { EcucCodeGenerator } = await import(
  join(CONFIGURATOR_DIR, 'packages/@yuletech/core/src/generator/ecuc-generator.ts')
);

const gen = new EcucCodeGenerator();
const outputDir = process.argv[2] || mkdtempSync(join(tmpdir(), 'ecuc-multi-'));

function writeAUTOSARStubs(dir) {
  // Std_Types.h
  writeFileSync(
    join(dir, 'Std_Types.h'),
    `
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
`
  );
  writeFileSync(
    join(dir, 'Ecuc.h'),
    `
#ifndef ECUC_H
#define ECUC_H
#include "Std_Types.h"
#endif
`
  );
}

const moduleDefs = [
  {
    module: 'Can',
    label: 'CAN Driver',
    version: '4.4.0',
    parameters: { canBaudrate: 500000, canDevErrorDetect: false },
    paramDefs: [
      { name: 'canBaudrate', type: 'integer', required: true },
      { name: 'canDevErrorDetect', type: 'boolean', required: false },
    ],
    containers: {
      CanController: [{ id: 'c0', parameters: { canBaudrate: 500000, canControllerId: 0 } }],
    },
    containerDefs: [
      {
        name: 'CanController',
        label: 'CAN Controller',
        multiple: true,
        minInstances: 1,
        maxInstances: 4,
        parameters: ['canBaudrate', 'canControllerId'],
      },
    ],
  },
  {
    module: 'Mcu',
    label: 'MCU Driver',
    version: '4.4.0',
    parameters: { mcuClockSetting: 16000000, mcuRamSectors: 4 },
    paramDefs: [
      {
        name: 'mcuClockSetting',
        type: 'integer',
        required: true,
        description: 'MCU main clock frequency in Hz',
      },
      {
        name: 'mcuRamSectors',
        type: 'integer',
        required: false,
        description: 'Number of RAM sectors',
      },
    ],
    containers: {
      McuClockSettingConfig: [{ id: 'clk0', parameters: { clockId: 0, clockFrequency: 16000000 } }],
    },
    containerDefs: [
      {
        name: 'McuClockSettingConfig',
        label: 'Clock Setting',
        multiple: true,
        minInstances: 1,
        maxInstances: 8,
        parameters: ['clockId', 'clockFrequency'],
      },
    ],
  },
  {
    module: 'Port',
    label: 'PORT Driver',
    version: '4.4.0',
    parameters: { portDevErrorDetect: true, portPinCount: 8 },
    paramDefs: [
      { name: 'portDevErrorDetect', type: 'boolean', required: false, description: 'DET enable' },
      { name: 'portPinCount', type: 'integer', required: true, description: 'Number of port pins' },
    ],
    containers: {
      PortPin: [
        { id: 'p0', parameters: { pinId: 0, pinDirection: 1 } },
        { id: 'p1', parameters: { pinId: 1, pinDirection: 0 } },
      ],
    },
    containerDefs: [
      {
        name: 'PortPin',
        label: 'Port Pin',
        multiple: true,
        minInstances: 1,
        maxInstances: 64,
        parameters: ['pinId', 'pinDirection'],
      },
    ],
  },
];

console.log('==============================================');
console.log(' yuleASR-Configurator: Multi-Module Generate');
console.log('==============================================');
console.log(` Output: ${outputDir}\n`);

// Write stubs
writeAUTOSARStubs(outputDir);
console.log(' AUTOSAR stubs written (Std_Types.h, Ecuc.h)\n');

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

let pass = 0,
  fail = 0;
for (const file of allFiles) {
  const label = file.path.replace(outputDir + '/', '');
  try {
    if (file.language === 'h') {
      execSync(`gcc -fsyntax-only -x c -I ${outputDir} ${file.path}`, {
        stdio: 'pipe',
        timeout: 15000,
      });
    } else {
      execSync(`gcc -fsyntax-only -I ${outputDir} -include ${outputDir}/Std_Types.h ${file.path}`, {
        stdio: 'pipe',
        timeout: 15000,
      });
    }
    console.log(`  ✅ ${label}`);
    pass++;
  } catch (e) {
    const stderr = e.stderr?.toString() || '';
    console.log(`  ⚠️  ${label}:`);
    stderr
      .split('\n')
      .filter(l => l.includes('error:'))
      .forEach(l => console.log(`    ${l.trim()}`));
    fail++;
  }
}

console.log(`\n==============================================`);
console.log(` RESULTS`);
console.log(`  ✅ Passed: ${pass}`);
console.log(`  ⚠️  Failed: ${fail}`);
console.log(`==============================================`);

if (fail === 0) {
  console.log('  All generated files pass syntax check!');
  process.exit(0);
} else {
  console.log('  Some files have issues — see above.');
  process.exit(1);
}
