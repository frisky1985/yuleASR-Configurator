/**
 * Desktop utilities for yuleASR Configurator
 * File I/O, gcc verification, temp directory management
 */

import { execSync } from 'child_process';
import { mkdtempSync, writeFileSync, rmSync, existsSync, mkdirSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

/**
 * Check if gcc (or clang) is available on this system
 */
export function isGccAvailable() {
  try {
    execSync('gcc --version', { stdio: 'pipe', timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Write generated files to a temp directory and run gcc -fsyntax-only
 * @param {Array<{filename: string, content: string, language: string}>} files
 * @returns {Array<{filename: string, status: string, errors?: string[]}>}
 */
export function verifyFiles(files) {
  const tmpDir = mkdtempSync(join(tmpdir(), 'yuleasr-verify-'));
  const results = [];

  try {
    // Write AUTOSAR stubs
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

    // Write all generated files
    for (const f of files) {
      writeFileSync(join(tmpDir, f.filename), f.content);
    }

    // Syntax check each file
    for (const f of files) {
      const filePath = join(tmpDir, f.filename);
      if (!existsSync(filePath)) {
        results.push({ filename: f.filename, status: 'skipped', errors: ['File not written'] });
        continue;
      }

      try {
        if (f.language === 'h') {
          execSync(`gcc -fsyntax-only -x c -I ${tmpDir} ${filePath}`, {
            stdio: 'pipe', timeout: 15000,
          });
        } else {
          execSync(`gcc -fsyntax-only -I ${tmpDir} -include ${tmpDir}/Std_Types.h ${filePath}`, {
            stdio: 'pipe', timeout: 15000,
          });
        }
        results.push({ filename: f.filename, status: 'pass' });
      } catch (e) {
        const stderr = e.stderr?.toString() || '';
        const errors = stderr
          .split('\n')
          .filter(l => l.includes('error:'))
          .map(l => l.trim());
        results.push({ filename: f.filename, status: 'fail', errors: errors.length > 0 ? errors : ['Compilation failed'] });
      }
    }
  } finally {
    // Clean up temp dir
    try { rmSync(tmpDir, { recursive: true, force: true }); } catch { /* ignore cleanup errors */ }
  }

  return results;
}

/**
 * Save generated files to a user-selected directory
 * @param {string} outputDir
 * @param {Array<{filename: string, content: string}>} files
 * @returns {{ success: boolean, count: number, path: string }}
 */
export function saveFilesToDir(outputDir, files) {
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }
  let count = 0;
  for (const f of files) {
    writeFileSync(join(outputDir, f.filename), f.content);
    count++;
  }
  return { success: true, count, path: outputDir };
}

/**
 * Get gcc version string
 */
export function getGccVersion() {
  try {
    return execSync('gcc --version', { stdio: 'pipe', timeout: 5000 })
      .toString().split('\n')[0].trim();
  } catch {
    return 'gcc not available';
  }
}
