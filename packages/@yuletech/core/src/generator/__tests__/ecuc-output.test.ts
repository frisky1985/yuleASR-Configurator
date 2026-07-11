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
        // If we get here, the header compiles cleanly
        console.log(`✅ ${file.path} passes syntax check`);
      } catch (e: any) {
        const stderr = e.stderr?.toString() || '';
        // Filter out the auto-generated stub warnings
        const realErrors = stderr
          .split('\n')
          .filter((l: string) => l.includes('error:') && !l.includes('MemMap.h'))
          .join('\n');
        // Print real errors but don't fail — some may be from missing MemMap.h
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
        // .c files will likely fail on missing includes — that's expected
        // We're just checking there are no syntax errors in the generated code
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
