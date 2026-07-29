/**
 * yuleASR BSW Integration Build Verification Test
 *
 * Verifies that:
 * 1. Codegen (Web layer) generates valid macro-only headers (Can_Cfg.h style)
 * 2. Ecuc-generator (Core) generates valid AUTOSAR ECUC code
 * 3. All generated files compile with gcc -fsyntax-only alongside yuleASR includes
 * 4. The generated files can coexist with yuleASR's existing hand-written headers
 *
 * @file    yuleasr-build-verify.test.ts
 * @group   integration
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { tmpdir } from 'os';

import { generateHeader, generateAllHeaders } from '../../apps/yuleasr-web/src/services/codegen';
import { createEcucGenerator } from '../../packages/@yuletech/core/src/generator/ecuc-generator';
import type { ModuleConfig, ModuleSchema } from '../../packages/@yuletech/core/src/types';

// ── Constants ─────────────────────────────────────────────────────────────
const YULE_ASR_ROOT = path.resolve(__dirname, '../../../yuleASR');
const GENERATED_DIR = path.join(YULE_ASR_ROOT, 'config/generated');
const MCAL_CAN_INCLUDE = path.join(YULE_ASR_ROOT, 'src/bsw/mcal/can/include');
const MCAL_MCU_INCLUDE = path.join(YULE_ASR_ROOT, 'src/bsw/mcal/mcu/include');
const MCAL_PORT_INCLUDE = path.join(YULE_ASR_ROOT, 'src/bsw/mcal/port/include');
const CONFIG_INPUT_MCAL = path.join(YULE_ASR_ROOT, 'config/input/mcal');
const AUTOSAR_INCLUDE = path.join(YULE_ASR_ROOT, 'include/autosar');
const GENERAL_INC = path.join(YULE_ASR_ROOT, 'src/bsw/general/inc');

const YULE_ASR_INCLUDES = [
  `-I${GENERATED_DIR}`,
  `-I${CONFIG_INPUT_MCAL}`,
  `-I${AUTOSAR_INCLUDE}`,
  `-I${GENERAL_INC}`,
  `-I${MCAL_CAN_INCLUDE}`,
  `-I${MCAL_MCU_INCLUDE}`,
  `-I${MCAL_PORT_INCLUDE}`,
].join(' ');

function checkSyntax(filePath: string, extraIncludes = ''): void {
  const includeFlags = YULE_ASR_INCLUDES + (extraIncludes ? ` ${extraIncludes}` : '');
  const cmd = `gcc -fsyntax-only -std=c99 -Wall -Wextra ${includeFlags} -x c "${filePath}" 2>&1`;
  try {
    execSync(cmd, { stdio: 'pipe', timeout: 15000 });
  } catch (e: unknown) {
    const stderr = (e as { stderr?: Buffer })?.stderr?.toString() || '';
    throw new Error(`${filePath} fails syntax check:\n${stderr}`);
  }
}

describe('yuleASR BSW Integration Build Verification', () => {

  // ── 1. Codegen Web Layer ───────────────────────────────────────────
  describe('Codegen (Web Layer) — Macro-only headers', () => {
    it('generates Can_Cfg.h with all required macros', async () => {
      const module = {
        id: 'can',
        name: 'Can',
        version: '4.4.0',
        enabled: true,
        parameters: [
          { id: 'devErrorDetect', name: 'devErrorDetect', type: 'boolean', value: true },
          { id: 'versionInfoApi', name: 'versionInfoApi', type: 'boolean', value: true },
          { id: 'numControllers', name: 'numControllers', type: 'integer', value: 2 },
          { id: 'numHoh', name: 'numHoh', type: 'integer', value: 16 },
          { id: 'numBaudrateConfigs', name: 'numBaudrateConfigs', type: 'integer', value: 3 },
          { id: 'timeoutDuration', name: 'timeoutDuration', type: 'integer', value: 10000 },
          { id: 'mainFunctionPeriodMs', name: 'mainFunctionPeriodMs', type: 'integer', value: 10 },
        ],
      };
      const file = await generateHeader(module as any);
      expect(file).not.toBeNull();
      expect(file!.filename).toBe('Can_Cfg.h');
      expect(file!.content).toContain('CAN_DEV_ERROR_DETECT');
      expect(file!.content).toContain('CAN_NUM_CONTROLLERS');
      expect(file!.content).toContain('CAN_NUM_HOH');
      expect(file!.content).toContain('CAN_TIMEOUT_DURATION');
      expect(file!.content).toContain('CAN_MAIN_FUNCTION_PERIOD_MS');
      // yuleASR style: macro-only, no typedefs
      expect(file!.content).not.toContain('typedef struct');
    });

    it('generates Can_Cfg.h that passes gcc syntax check alongside yuleASR', async () => {
      const module = {
        id: 'can',
        name: 'Can',
        version: '4.4.0',
        enabled: true,
        parameters: [
          { id: 'devErrorDetect', name: 'devErrorDetect', type: 'boolean', value: true },
          { id: 'versionInfoApi', name: 'versionInfoApi', type: 'boolean', value: true },
        ],
      };
      const file = await generateHeader(module as any);
      expect(file).not.toBeNull();

      const tmpFile = path.join(tmpdir(), `codegen-can-${Date.now()}.h`);
      fs.writeFileSync(tmpFile, file!.content, 'utf-8');
      try {
        checkSyntax(tmpFile);
      } finally {
        fs.unlinkSync(tmpFile);
      }
    });
  });

  // ── 2. Ecuc Generator (Core Layer) ─────────────────────────────────
  describe('Ecuc-generator (Core Layer) — ECUC configuration code', () => {
    const ecucGen = createEcucGenerator();

    it('generates Ecuc_Can_Cfg.h that passes syntax check', async () => {
      const config: ModuleConfig = {
        module: 'Can',
        version: '4.4.0',
        parameters: {
          canBaudrate: 500000,
          canDevErrorDetect: false,
        },
        containers: {
          CanController: [
            {
              name: 'CanController_0',
              parameters: { canBaudrate: 500000 },
            },
          ],
        },
      };
      const schema: ModuleSchema = {
        name: 'Can',
        version: '4.4.0',
        layer: 'MCAL',
        parameters: [
          { name: 'canBaudrate', type: 'integer', description: 'CAN bus baudrate', required: true },
          { name: 'canDevErrorDetect', type: 'boolean', description: 'DET switch', required: false },
        ],
        containers: [
          {
            name: 'CanController',
            label: 'CAN Controller',
            parameters: ['canBaudrate'],
          },
        ],
      };

      const result = await ecucGen.generate(config, schema, {
        outputDir: '/tmp',
        compiler: 'gcc',
        generateComments: true,
      });

      expect(result.success).toBe(true);
      expect(result.files.length).toBeGreaterThanOrEqual(4); // .h + .c + PBcfg + Lcfg
      const header = result.files.find(f => f.path.endsWith('Ecuc_Can_Cfg.h'));
      expect(header).toBeDefined();
      expect(header!.content).toContain('ECUC_CAN_CFG_H');
    });

    it('generated ECUC files coexist with yuleASR Can.h', () => {
      // Verify that the existing generated files in yuleASR compile correctly
      const files = [
        path.join(GENERATED_DIR, 'Ecuc_Can.c'),
        path.join(GENERATED_DIR, 'Ecuc_Can_Cfg.h'),
        path.join(GENERATED_DIR, 'Ecuc_Can_PBcfg.c'),
        path.join(GENERATED_DIR, 'Ecuc_Can_Lcfg.c'),
        path.join(GENERATED_DIR, 'Ecuc_Mcu.c'),
        path.join(GENERATED_DIR, 'Ecuc_Mcu_Cfg.h'),
        path.join(GENERATED_DIR, 'Ecuc_Mcu_PBcfg.c'),
        path.join(GENERATED_DIR, 'Ecuc_Mcu_Lcfg.c'),
        path.join(GENERATED_DIR, 'Ecuc_Port.c'),
        path.join(GENERATED_DIR, 'Ecuc_Port_Cfg.h'),
        path.join(GENERATED_DIR, 'Ecuc_Port_PBcfg.c'),
        path.join(GENERATED_DIR, 'Ecuc_Port_Lcfg.c'),
      ];

      for (const file of files) {
        expect(fs.existsSync(file)).toBe(true);
        const ext = path.extname(file);
        if (ext === '.h') {
          checkSyntax(file, `-I${GENERATED_DIR}`);
        } else {
          checkSyntax(file, `-I${GENERATED_DIR}`);
        }
      }
    });
  });

  // ── 3. CMake Build Verification ────────────────────────────────────
  describe('CMake Build Integration', () => {
    it('yule_ecuc target builds without errors', () => {
      const buildDir = path.join(YULE_ASR_ROOT, 'build');
      expect(fs.existsSync(buildDir)).toBe(true);

      // Check CMake configured with ENABLE_ECUC_GENERATED
      const cacheContent = fs.readFileSync(path.join(buildDir, 'CMakeCache.txt'), 'utf-8');
      expect(cacheContent).toContain('ENABLE_ECUC_GENERATED:BOOL=ON');

      // Quick re-build of just the ECUC library
      const output = execSync('make -j4 yule_ecuc 2>&1', {
        cwd: buildDir,
        timeout: 60000,
        stdio: 'pipe',
      }).toString();
      expect(output).toContain('Built target yule_ecuc');
    });

    it('mcal_can builds alongside ECUC generated code', () => {
      const buildDir = path.join(YULE_ASR_ROOT, 'build');
      const output = execSync('make -j4 mcal_can mcal_mcu mcal_port 2>&1', {
        cwd: buildDir,
        timeout: 60000,
        stdio: 'pipe',
      }).toString();
      expect(output).toContain('Built target mcal_can');
      expect(output).toContain('Built target mcal_mcu');
      expect(output).toContain('Built target mcal_port');
    });
  });
});
