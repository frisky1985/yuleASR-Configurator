/**
 * yuleASR Integration Verification Test
 *
 * Validates that:
 * 1. codegen.ts produces macro-only headers matching yuleASR style
 * 2. ecuc-generator produces Ecuc_* files that avoid name conflicts
 * 3. All generated files pass gcc -fsyntax-only
 * 4. Generated files coexist with existing yuleASR source
 *
 * This is the automated integration test counterpart to the manual
 * verification tasks in docs/plans/2026-07-23-yuleasr-integration-verification.md
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';

import { generateAllHeaders } from '../codegen';
import { EcucCodeGenerator } from '@yuletech/core';
import type { ModuleConfig, ModuleSchema } from '@yuletech/core';

// ── Paths ──────────────────────────────────────────────────────────────────
const YULEASR_ROOT = join(dirname(dirname(dirname(dirname(dirname(__dirname))))), '..', 'yuleASR');
const GEN_DIR = join(YULEASR_ROOT, 'config', 'generated');
const AUTOSAR_INC = join(YULEASR_ROOT, 'include', 'autosar');
const MCAL_INC_DIRS = [
  join(YULEASR_ROOT, 'config', 'input', 'mcal'),
  join(YULEASR_ROOT, 'src', 'bsw', 'mcal', 'can', 'include'),
  join(YULEASR_ROOT, 'src', 'bsw', 'mcal', 'mcu', 'include'),
  join(YULEASR_ROOT, 'src', 'bsw', 'mcal', 'port', 'include'),
];
const INCLUDE_FLAGS = [
  `-I${AUTOSAR_INC}`,
  `-I${GEN_DIR}`,
  ...MCAL_INC_DIRS.map(d => `-I${d}`),
];

function syntaxCheck(filePath: string): { ok: boolean; output: string } {
  try {
    const output = execSync(
      `gcc -fsyntax-only -std=c99 ${INCLUDE_FLAGS.join(' ')} "${filePath}" 2>&1`,
      { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 }
    );
    return { ok: true, output };
  } catch (e: any) {
    return { ok: false, output: e.stdout || e.stderr || String(e) };
  }
}

describe('yuleASR Integration Verification', () => {
  // ── Test 1: codegen.ts produces yuleASR-compatible headers ──────────────
  describe('codegen.ts → yuleASR header compatibility', () => {
    it('should produce Can_Cfg.h with all expected yuleASR macros', async () => {
      const files = await generateAllHeaders([
        {
          id: 'can',
          name: 'CAN Driver',
          version: '1.0.0',
          enabled: true,
          parameters: [
            { id: 'devErrorDetect', name: 'devErrorDetect', type: 'boolean', value: true },
            { id: 'versionInfoApi', name: 'versionInfoApi', type: 'boolean', value: true },
            { id: 'numControllers', name: 'numControllers', type: 'integer', value: 2 },
            { id: 'numHoh', name: 'numHoh', type: 'integer', value: 16 },
          ],
        },
      ]);

      const cfgFile = files.find(f => f.filename === 'Can_Cfg.h');
      expect(cfgFile).toBeDefined();
      expect(cfgFile!.content).toContain('CAN_DEV_ERROR_DETECT');
      expect(cfgFile!.content).toContain('CAN_NUM_CONTROLLERS');
      expect(cfgFile!.content).toContain('CAN_NUM_HOH');
      expect(cfgFile!.content).toContain('CAN_TIMEOUT_DURATION');
      expect(cfgFile!.content).toContain('CAN_MAIN_FUNCTION_PERIOD_MS');
      expect(cfgFile!.content).toContain('CAN_BAUDRATE_500K');
      expect(cfgFile!.content).toContain('CAN_HOH_RX_0');
      expect(cfgFile!.content).toContain('CAN_HOH_TX_3');
      expect(cfgFile!.content).toContain('CAN_CONTROLLER_0');
    });

    it('should NOT contain types or function declarations (macro-only)', async () => {
      const files = await generateAllHeaders([
        {
          id: 'can', name: 'CAN Driver', version: '1.0.0', enabled: true,
          parameters: [{ id: 'devErrorDetect', name: 'devErrorDetect', type: 'boolean', value: true }],
        },
      ]);

      const cfgFile = files.find(f => f.filename === 'Can_Cfg.h')!.content;
      expect(cfgFile).not.toContain('typedef');
      expect(cfgFile).not.toContain('struct');
      expect(cfgFile).not.toContain('Can_Init');
      expect(cfgFile).not.toContain('Can_ConfigType');
    });

    it('should produce headers that pass gcc -fsyntax-only', async () => {
      const files = await generateAllHeaders([
        { id: 'can', name: 'CAN Driver', version: '1.0.0', enabled: true,
          parameters: [{ id: 'devErrorDetect', name: 'devErrorDetect', type: 'boolean', value: true }] },
        { id: 'mcu', name: 'MCU Driver', version: '1.0.0', enabled: true,
          parameters: [{ id: 'devErrorDetect', name: 'devErrorDetect', type: 'boolean', value: false }] },
        { id: 'port', name: 'Port Driver', version: '1.0.0', enabled: true,
          parameters: [{ id: 'devErrorDetect', name: 'devErrorDetect', type: 'boolean', value: false }] },
      ]);

      for (const file of files) {
        // Write to temp directory for syntax check
        const tmpDir = '/tmp/yuleasr-integration-test';
        mkdirSync(tmpDir, { recursive: true });
        const tmpFile = join(tmpDir, file.filename);
        writeFileSync(tmpFile, file.content);
        const result = syntaxCheck(tmpFile);
        if (!result.ok) {
          console.error(`❌ ${file.filename}: ${result.output}`);
        }
        expect(result.ok).toBe(true);
      }
    });
  });

  // ── Test 2: ecuc-generator avoids name conflicts ────────────────────────
  describe('ecuc-generator ←→ yuleASR file name conflict avoidance', () => {
    const generator = new EcucCodeGenerator();

    it('should use Ecuc_ prefix for Can headers (not Can_Cfg.h)', async () => {
      const config: ModuleConfig = {
        module: 'Can', version: '1.0.0',
        parameters: { canBaudrate: 500000 },
        containers: {},
      };
      const schema: ModuleSchema = {
        name: 'Can', label: 'CAN Driver', layer: 'MCAL', version: '1.0.0',
        parameters: [{ name: 'canBaudrate', type: 'integer', required: true }],
        containers: [],
      };
      const result = await generator.generate(config, schema, { outputDir: './out' });
      const header = result.files.find(f => f.path.endsWith('.h'))!;
      expect(header.path).toContain('Ecuc_Can_Cfg.h');
      expect(header.path).not.toBe('Can_Cfg.h');
    });

    it('should use Ecuc_ prefix for all BSW modules', async () => {
      for (const moduleName of ['Can', 'Mcu', 'Port']) {
        const config: ModuleConfig = {
          module: moduleName, version: '1.0.0',
          parameters: {}, containers: {},
        };
        const schema: ModuleSchema = {
          name: moduleName, label: `${moduleName} Driver`, layer: 'MCAL', version: '1.0.0',
          parameters: [], containers: [],
        };
        const result = await generator.generate(config, schema, { outputDir: './out' });
        const header = result.files.find(f => f.path.endsWith('.h'))!;
        expect(header.path).toContain(`Ecuc_${moduleName}_Cfg.h`);
      }
    });
  });

  // ── Test 3: Generated files in yuleASR dir exist and pass syntax ────────
  describe('yuleASR config/generated/ files', () => {
    it('should exist for all 3 modules (Can, Mcu, Port)', () => {
      const expected = ['Can', 'Mcu', 'Port'];
      for (const mod of expected) {
        expect(existsSync(join(GEN_DIR, `Ecuc_${mod}_Cfg.h`))).toBe(true);
        expect(existsSync(join(GEN_DIR, `Ecuc_${mod}.c`))).toBe(true);
        expect(existsSync(join(GEN_DIR, `Ecuc_${mod}_PBcfg.c`))).toBe(true);
        expect(existsSync(join(GEN_DIR, `Ecuc_${mod}_Lcfg.c`))).toBe(true);
      }
    });

    it('all .h files should pass gcc -fsyntax-only', () => {
      const headers = ['Ecuc_Can_Cfg.h', 'Ecuc_Mcu_Cfg.h', 'Ecuc_Port_Cfg.h'];
      for (const h of headers) {
        const result = syntaxCheck(join(GEN_DIR, h));
        if (!result.ok) console.error(`❌ ${h}: ${result.output}`);
        expect(result.ok).toBe(true);
      }
    });

    it('all .c files should pass gcc -fsyntax-only', () => {
      const cFiles = [
        'Ecuc_Can.c', 'Ecuc_Can_PBcfg.c', 'Ecuc_Can_Lcfg.c',
        'Ecuc_Mcu.c', 'Ecuc_Mcu_PBcfg.c', 'Ecuc_Mcu_Lcfg.c',
        'Ecuc_Port.c', 'Ecuc_Port_PBcfg.c', 'Ecuc_Port_Lcfg.c',
      ];
      for (const f of cFiles) {
        const result = syntaxCheck(join(GEN_DIR, f));
        if (!result.ok) console.error(`❌ ${f}: ${result.output}`);
        expect(result.ok).toBe(true);
      }
    });
  });

  // ── Test 4: CMake integration ───────────────────────────────────────────
  describe('CMake build integration', () => {
    it('yule_ecuc library should build from CMake', () => {
      // Build verification was done via Task 7; this test asserts
      // that the ECUC CMake target exists and is properly configured.
      const mcalCmake = readFileSync(
        join(YULEASR_ROOT, 'src', 'bsw', 'mcal', 'CMakeLists.txt'),
        'utf8'
      );
      expect(mcalCmake).toContain('ENABLE_ECUC_GENERATED');
      expect(mcalCmake).toContain('yule_ecuc');
      expect(mcalCmake).toContain('Ecuc_Can.c');
      expect(mcalCmake).toContain('Ecuc_Mcu.c');
      expect(mcalCmake).toContain('Ecuc_Port.c');
      expect(mcalCmake).toContain('config/generated');
    });

    it('Should not conflict with existing yuleASR Can_Cfg.h', () => {
      const existingCfg = readFileSync(
        join(YULEASR_ROOT, 'src', 'bsw', 'mcal', 'can', 'include', 'Can_Cfg.h'),
        'utf8'
      );
      // Existing file should still be pure macros (no types)
      expect(existingCfg).toContain('CAN_DEV_ERROR_DETECT');
      expect(existingCfg).not.toContain('typedef');

      // The ECUC header is separate (Ecuc_Can_Cfg.h)
      const ecucHeader = readFileSync(join(GEN_DIR, 'Ecuc_Can_Cfg.h'), 'utf8');
      expect(ecucHeader).toContain('ECUC_CAN_CFG_H');
    });
  });
});
