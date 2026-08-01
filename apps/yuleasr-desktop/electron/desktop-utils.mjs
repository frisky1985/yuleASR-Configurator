/**
 * Desktop utilities for yuleASR Configurator
 * File I/O, gcc verification, temp directory management
 */

import { execFileSync } from 'child_process';
import { mkdtempSync, writeFileSync, rmSync, existsSync, mkdirSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

// ── Fix 5: 渲染进程文件载荷校验（防命令注入 + 路径遍历 + 超大载荷）──

const SAFE_FILENAME_RE = /^[A-Za-z0-9_-]+\.(c|h)$/;
const MAX_FILES = 100;
const MAX_FILE_BYTES = 5 * 1024 * 1024;

/** 校验并规范化渲染进程传入的文件；非法返回 null */
function sanitizeFile(f) {
  if (!f || typeof f !== 'object') return null;
  const filename = typeof f.filename === 'string' ? f.filename : '';
  if (!SAFE_FILENAME_RE.test(filename)) return null;
  const content = typeof f.content === 'string' ? f.content : '';
  if (Buffer.byteLength(content, 'utf8') > MAX_FILE_BYTES) return null;
  return { filename, content, language: f.language === 'h' ? 'h' : 'c' };
}

function sanitizeFiles(files) {
  if (!Array.isArray(files) || files.length === 0 || files.length > MAX_FILES) return null;
  const out = [];
  for (const f of files) {
    const safe = sanitizeFile(f);
    if (!safe) return null;
    out.push(safe);
  }
  return out;
}

export { sanitizeFiles };

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

    // Write all generated files (Fix 5: 仅接受白名单文件名，拒绝路径遍历/注入载荷)
    for (const f of files) {
      const safe = sanitizeFile(f);
      if (!safe) {
        results.push({ filename: f.filename, status: 'skipped', errors: ['Invalid filename or content'] });
        continue;
      }
      writeFileSync(join(tmpDir, safe.filename), safe.content);
    }

    // Syntax check each file (Fix 5: execFileSync 参数数组，不经过 shell，杜绝命令注入)
    for (const f of files) {
      const safe = sanitizeFile(f);
      if (!safe) {
        continue; // already reported above
      }
      const filePath = join(tmpDir, safe.filename);
      if (!existsSync(filePath)) {
        results.push({ filename: safe.filename, status: 'skipped', errors: ['File not written'] });
        continue;
      }

      try {
        if (safe.language === 'h') {
          execFileSync('gcc', ['-fsyntax-only', '-x', 'c', '-I', tmpDir, filePath], {
            stdio: 'pipe', timeout: 15000,
          });
        } else {
          execFileSync('gcc', ['-fsyntax-only', '-I', tmpDir, '-include', join(tmpDir, 'Std_Types.h'), filePath], {
            stdio: 'pipe', timeout: 15000,
          });
        }
        results.push({ filename: safe.filename, status: 'pass' });
      } catch (e) {
        const stderr = e.stderr?.toString() || '';
        const errors = stderr
          .split('\n')
          .filter(l => l.includes('error:'))
          .map(l => l.trim());
        results.push({ filename: safe.filename, status: 'fail', errors: errors.length > 0 ? errors : ['Compilation failed'] });
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
  // Fix 5: 非法文件名/载荷整体拒绝，杜绝越界写盘（../evil.c、绝对路径等）
  const safeFiles = sanitizeFiles(files);
  if (!safeFiles) {
    return { success: false, count: 0, path: outputDir, error: 'Invalid file payload' };
  }
  let count = 0;
  for (const f of safeFiles) {
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
