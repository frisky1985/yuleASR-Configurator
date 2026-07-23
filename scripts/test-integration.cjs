#!/usr/bin/env node
/**
 * yuleASR-Configurator → yuleASR Integration Test
 * 
 * Tests:
 * 1. ECUC generation produces 4 files per module
 * 2. All generated files pass gcc -fsyntax-only
 * 3. No filename conflicts between ECUC headers and yuleASR config headers
 * 4. yuleASR CMake includes config/generated/ path
 * 5. yuleASR Can module compiles with generated ECUC files
 */

const { EcucCodeGenerator } = require(require('path').join(__dirname, '..', 'packages/@yuletech/core/dist/generator/index.js'));
const { writeFileSync, mkdirSync, existsSync, readFileSync } = require('fs');
const { join, resolve } = require('path');
const { execSync } = require('child_process');

const PROJECT_ROOT = resolve(__dirname, '..');
const YULEASR_ROOT = resolve(PROJECT_ROOT, '..', 'yuleASR');
const GEN_DIR = join(YULEASR_ROOT, 'config/generated');
const MCAL_CFG_DIR = join(YULEASR_ROOT, 'config/input/mcal');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✅ ${name}`);
    passed++;
  } catch (e) {
    console.log(`  ❌ ${name}: ${e.message}`);
    failed++;
  }
}

function assert(condition, msg) {
  if (!condition) throw new Error(msg);
}

console.log('=== yuleASR Integration Verification ===\n');

// ── 1. Filename conflict check ─────────────────────────────
console.log('1. Filename conflict check:');

test('ECUC headers use Ecuc_ prefix (no conflict with yuleASR)', () => {
  const yuleasrHeaders = ['Can_Cfg.h', 'Mcu_Cfg.h', 'Port_Cfg.h'];
  const ecucHeaders = ['Ecuc_Can_Cfg.h', 'Ecuc_Mcu_Cfg.h', 'Ecuc_Port_Cfg.h'];
  
  for (const yh of yuleasrHeaders) {
    assert(existsSync(join(MCAL_CFG_DIR, yh)), `yuleASR ${yh} should exist`);
  }
  for (const eh of ecucHeaders) {
    assert(existsSync(join(GEN_DIR, eh)), `ECUC ${eh} should exist`);
  }
  
  // Verify no overlap
  const allYule = new Set(yuleasrHeaders);
  const allEcuc = new Set(ecucHeaders);
  const overlap = [...allYule].filter(x => allEcuc.has(x));
  assert(overlap.length === 0, `Overlapping filenames: ${overlap}`);
});

// ── 2. Generated files check ───────────────────────────────
console.log('\n2. Generated file check:');

const modules = ['Can', 'Mcu', 'Port'];
const expectedFiles = (m) => [
  `Ecuc_${m}_Cfg.h`,
  `Ecuc_${m}.c`,
  `Ecuc_${m}_PBcfg.c`,
  `Ecuc_${m}_Lcfg.c`,
];

for (const mod of modules) {
  for (const f of expectedFiles(mod)) {
    test(`  ${f} exists`, () => {
      assert(existsSync(join(GEN_DIR, f)), `Missing: ${f}`);
      const stats = require('fs').statSync(join(GEN_DIR, f));
      assert(stats.size > 50, `${f} is too small (${stats.size} bytes)`);
    });
  }
}

// ── 3. GCC syntax check ────────────────────────────────────
console.log('\n3. GCC syntax check:');

// Write AUTOSAR stubs for standalone check
const stubDir = join(GEN_DIR, '_stubs');
mkdirSync(stubDir, { recursive: true });

writeFileSync(join(stubDir, 'Std_Types.h'), `
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
writeFileSync(join(stubDir, 'Ecuc.h'), `#ifndef ECUC_H\n#define ECUC_H\n#include "Std_Types.h"\n#endif\n`);
writeFileSync(join(stubDir, 'MemMap.h'), `#ifndef MEMMAP_H\n#define MEMMAP_H\n#endif\n`);

for (const mod of modules) {
  for (const f of expectedFiles(mod)) {
    const path = join(GEN_DIR, f);
    test(`${f} passes gcc -fsyntax-only`, () => {
      if (f.endsWith('.h')) {
        execSync(`gcc -fsyntax-only -x c -I${stubDir} -I${GEN_DIR} ${path}`, { stdio: 'pipe', timeout: 15000 });
      } else {
        execSync(`gcc -fsyntax-only -I${stubDir} -I${GEN_DIR} -include ${stubDir}/Std_Types.h ${path}`, { stdio: 'pipe', timeout: 15000 });
      }
    });
  }
}

// ── 4. CMakeLists.txt check ────────────────────────────────
console.log('\n4. CMake integration check:');

test('MCAL CMakeLists.txt includes config/generated', () => {
  const cmake = readFileSync(join(YULEASR_ROOT, 'src/bsw/mcal/CMakeLists.txt'), 'utf-8');
  assert(cmake.includes('config/generated'), 'Missing config/generated include path');
  assert(cmake.includes('Ecuc_'), 'Missing generated ECUC source group');
});

// ── 5. yuleASR Can module builds ───────────────────────────
console.log('\n5. yuleASR Can module build:');

test('yuleASR mcal_can target compiles successfully', () => {
  // Run make in the existing build directory
  execSync(`make -C ${join(YULEASR_ROOT, 'build')} mcal_can 2>&1`, {
    stdio: 'pipe',
    timeout: 60000,
  });
});

// ── 6. codegen.ts macro header completeness ────────────────
console.log('\n6. Macro header completeness:');

test('Can_Cfg.h contains all expected yuleASR macros', () => {
  const content = readFileSync(join(MCAL_CFG_DIR, 'Can_Cfg.h'), 'utf-8');
  const expected = [
    'CAN_DEV_ERROR_DETECT',
    'CAN_NUM_CONTROLLERS',
    'CAN_NUM_HOH',
    'CAN_NUM_BAUDRATE_CONFIGS',
    'CAN_BAUDRATE_500K',
    'CAN_PROCESSING_INTERRUPT',
    'CAN_CONTROLLER_0',
    'CAN_CONTROLLER_1',
    'CAN_HOH_RX_0',
    'CAN_HOH_TX_0',
    'CAN_TIMEOUT_DURATION',
    'CAN_MAIN_FUNCTION_PERIOD_MS',
  ];
  for (const macro of expected) {
    assert(content.includes(macro), `Missing macro: ${macro}`);
  }
});

// ── Report ─────────────────────────────────────────────────
console.log(`\n========================================`);
console.log(`  Results: ${passed} passed, ${failed} failed`);
console.log(`========================================`);

if (failed === 0) {
  console.log('\n✅ All integration tests passed!');
  process.exit(0);
} else {
  console.log(`\n⚠️  ${failed} test(s) failed`);
  process.exit(failed ? 1 : 0);
}
