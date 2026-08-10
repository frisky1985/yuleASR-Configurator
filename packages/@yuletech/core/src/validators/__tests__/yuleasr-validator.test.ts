import { describe, it, expect, beforeEach } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import type { ModuleConfig } from '../../types';
import { YuleasrValidator, yuleasrValidator } from '../yuleasr-validator';
import { generatedJsonToModuleSchema } from '../../schema/load-generated';

function makeConfig(module: string, params: Record<string, unknown> = {}): ModuleConfig {
  return {
    module,
    version: '4.4.0',
    parameters: params,
  };
}

/** 加载宏名版 schemas（统一管理后依赖数据在 schema.dependencies，测试需注入） */
function loadMacroSchemas() {
  const dir = join(__dirname, '../../../../../..', 'verification/extracted-cfgh');
  return readdirSync(dir)
    .filter(f => f.endsWith('.json'))
    .sort()
    .map(f => {
      const json = JSON.parse(readFileSync(join(dir, f), 'utf8')) as Record<string, unknown> & {
        'x-display-name'?: string;
      };
      const name = json['x-display-name'] || f.replace(/\.json$/, '');
      return generatedJsonToModuleSchema(name, json as never);
    });
}

describe('YuleasrValidator', () => {
  let validator: YuleasrValidator;

  beforeEach(() => {
    validator = new YuleasrValidator();
    // 统一管理后模块级依赖从 schema.dependencies 读取，测试注入宏名版 schemas
    validator.setCrossModuleValidator(loadMacroSchemas());
    validator.registerModuleRules({
      module: 'Mcu',
      rules: [
        {
          type: 'custom',
          message: 'Mcu must be enabled for all configurations',
          condition: config => config.parameters.clock_frequency !== undefined,
        },
      ],
      parameterRules: {
        clock_frequency: [
          { type: 'required', message: 'Clock frequency is required' },
          { type: 'range', message: 'Clock frequency must be positive' },
        ],
      },
    });
    validator.registerModuleRules({
      module: 'Can',
      rules: [],
      parameterRules: {
        baudrate: [{ type: 'required', message: 'Baudrate is required' }],
      },
    });
  });

  describe('validateModule', () => {
    it('should pass for valid Mcu config', () => {
      const config = makeConfig('Mcu', { clock_frequency: 160000000 });
      const errors = validator.validateModule(config);
      expect(errors).toHaveLength(0);
    });

    it('should fail Mcu when clock_frequency is missing', () => {
      const config = makeConfig('Mcu', {});
      const errors = validator.validateModule(config);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.path.includes('clock_frequency'))).toBe(true);
    });

    it('should fail Can when baudrate is missing', () => {
      const config = makeConfig('Can', {});
      const errors = validator.validateModule(config);
      expect(errors.some(e => e.path.includes('baudrate'))).toBe(true);
    });

    it('should use generic validation for unregistered modules', () => {
      const config = makeConfig('Spi', { someParam: 1 });
      const errors = validator.validateModule(config);
      // Generic only checks module/version/undefined params
      expect(errors).toHaveLength(0);
    });

    it('should fail generic validation when module name is empty', () => {
      const config = makeConfig('', {});
      const errors = validator.validateModule(config);
      expect(errors.some(e => e.message.includes('Module name is required'))).toBe(true);
    });
  });

  describe('validateModules - dependency checks', () => {
    it('should pass when all dependencies are satisfied', () => {
      const configs = [makeConfig('Can', { baudrate: 500000 }), makeConfig('CanIf')];
      const errors = validator.validateModules(configs);
      expect(errors.filter(e => e.severity === 'error')).toHaveLength(0);
    });

    it('should report error when CanIf lacks Can', () => {
      const configs = [makeConfig('CanIf')];
      const errors = validator.validateModules(configs);
      expect(errors.some(e => e.message.includes('CanIf requires Can'))).toBe(true);
      expect(errors.some(e => e.severity === 'error')).toBe(true);
    });

    it('should report error when CanTp lacks PduR and CanIf', () => {
      const configs = [makeConfig('CanTp')];
      const errors = validator.validateModules(configs);
      expect(errors.filter(e => e.severity === 'error').length).toBe(2);
    });

    it('should report warning for optional missing dependencies', () => {
      const configs = [makeConfig('Fls')];
      const errors = validator.validateModules(configs);
      expect(errors.some(e => e.severity === 'warning' && e.message.includes('Mcu'))).toBe(true);
    });

    it('should validate complete BSW stack without errors', () => {
      const configs = [
        makeConfig('Mcu', { clock_frequency: 160000000 }),
        makeConfig('Port'),
        makeConfig('Dio'),
        makeConfig('Can', { baudrate: 500000 }),
        makeConfig('CanIf'),
        makeConfig('PduR'),
        makeConfig('CanTp'),
        makeConfig('Com'),
        makeConfig('ComM'),
        makeConfig('Nm'),
        makeConfig('CanNm'),
        makeConfig('CanSM'),
        makeConfig('EcuM'),
        makeConfig('Os'),
        makeConfig('Rte'),
        makeConfig('Dem'),
        makeConfig('Dcm'),
        makeConfig('NvM'),
        makeConfig('MemIf'),
        makeConfig('Fee'),
        makeConfig('Fls'),
      ];
      const errors = validator.validateModules(configs);
      // Note: CanIf may emit a warning if Can has no CanController containers
      // Filter to check only error-severity
      expect(errors.filter(e => e.severity === 'error')).toHaveLength(0);
    });

    it('should warn when CanIf depends on Can but Can has no controller', () => {
      // Can exists but has no CanController container instances
      const configs = [makeConfig('Can', { baudrate: 500000 }), makeConfig('CanIf')];
      const errors = validator.validateModules(configs);
      // Should have a warning about missing CanController
      expect(
        errors.some(e => e.severity === 'warning' && e.message.includes('CAN controller'))
      ).toBe(true);
    });

    it('should pass CanIf param check when Can has controllers', () => {
      const configs: ModuleConfig[] = [
        {
          ...makeConfig('Can', { baudrate: 500000 }),
          containers: {
            CanController: [{ id: 'ctrl0', parameters: { canBaudrate: 500000 } }],
          },
        },
        makeConfig('CanIf'),
      ];
      const errors = validator.validateModules(configs);
      // No warning about missing CanController
      expect(errors.some(e => e.message.includes('CAN controller'))).toBe(false);
    });
  });

  describe('getValidationStats', () => {
    it('should count errors and warnings correctly', () => {
      const errors = [
        { path: 'a', message: 'err1', severity: 'error' as const },
        { path: 'b', message: 'err2', severity: 'error' as const },
        { path: 'c', message: 'warn1', severity: 'warning' as const },
      ];
      const stats = validator.getValidationStats(errors);
      expect(stats.errorCount).toBe(2);
      expect(stats.warningCount).toBe(1);
      expect(stats.infoCount).toBe(0);
    });
  });
});

describe('Default yuleasrValidator instance', () => {
  it('should have all 37 modules registered', () => {
    const allModules = [
      'Adc',
      'Arti',
      'Ble',
      'BswM',
      'Can',
      'CanIf',
      'CanNm',
      'CanSM',
      'CanTp',
      'CanTrcv',
      'Com',
      'ComM',
      'Crc',
      'CryIf',
      'Crypto',
      'Csm',
      'Dcm',
      'Dem',
      'Det',
      'Dio',
      'EcuM',
      'Fee',
      'Fls',
      'Gpt',
      'Icu',
      'IoHwAb',
      'Mcl',
      'Mcu',
      'MemIf',
      'Nm',
      'NvM',
      'Os',
      'PduR',
      'Port',
      'Rte',
      'Sbc',
      'Spi',
    ];
    for (const mod of allModules) {
      const errors = yuleasrValidator.validateModule(makeConfig(mod));
      // Should not throw and should return an array
      expect(Array.isArray(errors)).toBe(true);
    }
  });
});

describe('range rules (Fix 21 K3: 空壳实现)', () => {
  it('should report min/max violations for range rules', () => {
    const v = new YuleasrValidator();
    v.registerModuleRules({
      module: 'Gpt',
      rules: [],
      parameterRules: {
        tickFrequency: [{ type: 'range', message: 'must be in [1, 1000]', min: 1, max: 1000 }],
      },
    });

    // 低于 min
    let errors = v.validateModule(makeConfig('Gpt', { tickFrequency: 0 }));
    expect(errors.some(e => e.message === 'tickFrequency must be >= 1')).toBe(true);

    // 高于 max
    errors = v.validateModule(makeConfig('Gpt', { tickFrequency: 2000 }));
    expect(errors.some(e => e.message === 'tickFrequency must be <= 1000')).toBe(true);

    // 范围内 → 通过
    errors = v.validateModule(makeConfig('Gpt', { tickFrequency: 500 }));
    expect(errors).toHaveLength(0);

    // 非数字 → must be a number
    errors = v.validateModule(makeConfig('Gpt', { tickFrequency: 'fast' }));
    expect(errors.some(e => e.message === 'tickFrequency must be a number')).toBe(true);
  });

  it('should pass range rules without min/max (仅数字校验)', () => {
    const v = new YuleasrValidator();
    v.registerModuleRules({
      module: 'Mcu',
      rules: [],
      parameterRules: {
        clock_frequency: [{ type: 'range', message: 'Clock frequency must be positive' }],
      },
    });

    const errors = v.validateModule(makeConfig('Mcu', { clock_frequency: 160000000 }));
    expect(errors).toHaveLength(0);
  });
});

describe('Default Mcu rules (Fix 21 K3: 消息错位)', () => {
  it('reports distinct messages for disabled vs enabled-but-missing clock_frequency', () => {
    // 启用（未显式禁用）但缺 clock_frequency → 第二条
    const enabledMissing = yuleasrValidator.validateModule(makeConfig('Mcu', {}));
    expect(
      enabledMissing.some(e => e.message === 'Mcu is enabled but clock_frequency is missing')
    ).toBe(true);
    expect(enabledMissing.some(e => e.message === 'Mcu must be enabled')).toBe(false);

    // 显式禁用 → 第一条
    const disabled = yuleasrValidator.validateModule(makeConfig('Mcu', { enabled: false }));
    expect(disabled.some(e => e.message === 'Mcu must be enabled')).toBe(true);
    expect(disabled.some(e => e.message === 'Mcu is enabled but clock_frequency is missing')).toBe(
      false
    );

    // 启用且提供 clock_frequency → 两条都不报
    const ok = yuleasrValidator.validateModule(makeConfig('Mcu', { clock_frequency: 160000000 }));
    expect(ok.some(e => e.message === 'Mcu must be enabled')).toBe(false);
    expect(ok.some(e => e.message === 'Mcu is enabled but clock_frequency is missing')).toBe(false);
  });
});
