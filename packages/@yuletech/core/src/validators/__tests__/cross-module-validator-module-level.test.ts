import { describe, it, expect } from 'vitest';

import type { ModuleSchema, ModuleConfig } from '../../types';
import { createCrossModuleValidator } from '../cross-module-validator';

/**
 * 模块级 crossReferences 测试 (P2-2)
 * JSON schema 顶层 crossReferences 使用 sourceParam 定位本模块源参数，
 * validator 需支持此形态 (现有参数级 crossReferences 测试保留在 cross-module-validator.test.ts)
 */
function makeSchema(name: string, overrides: Partial<ModuleSchema> = {}): ModuleSchema {
  return {
    name,
    label: name,
    layer: 'Service',
    version: '4.4.0',
    parameters: [],
    ...overrides,
  };
}

function makeConfig(module: string, params: Record<string, unknown> = {}): ModuleConfig {
  return {
    module,
    version: '4.4.0',
    parameters: params,
  };
}

describe('CrossModuleValidator - module-level crossReferences (P2-2)', () => {
  it('should validate module-level reference via sourceParam (greater_than)', () => {
    const schemas = [
      makeSchema('Can', {
        crossReferences: [
          {
            sourceParam: 'CanControllerBaudRate',
            module: 'CanTrcv',
            param: 'CanTrcvMaxBaudrate',
            relation: 'greater_than',
            severity: 'warning',
            description: 'CAN 控制器波特率不应超过收发器最大波特率',
          },
        ],
      }),
      makeSchema('CanTrcv', {
        parameters: [
          { name: 'CanTrcvMaxBaudrate', type: 'integer', min: 0, max: 65535 },
        ],
      }),
    ];
    const validator = createCrossModuleValidator(schemas);

    // 源参数 500000 > 目标 250000 → 通过
    const ok = validator.validate([
      makeConfig('Can', { CanControllerBaudRate: 500000 }),
      makeConfig('CanTrcv', { CanTrcvMaxBaudrate: 250000 }),
    ]);
    expect(ok).toHaveLength(0);

    // 源参数 100000 <= 目标 250000 → 违反 greater_than → 报错
    const fail = validator.validate([
      makeConfig('Can', { CanControllerBaudRate: 100000 }),
      makeConfig('CanTrcv', { CanTrcvMaxBaudrate: 250000 }),
    ]);
    expect(fail).toHaveLength(1);
    expect(fail[0].severity).toBe('warning');
    expect(fail[0].code).toBe('CROSS_REF_GREATER_THAN');
  });

  it('should skip when sourceParam has no value', () => {
    const schemas = [
      makeSchema('Can', {
        crossReferences: [
          {
            sourceParam: 'CanControllerBaudRate',
            module: 'CanTrcv',
            param: 'CanTrcvMaxBaudrate',
            relation: 'greater_than',
            severity: 'warning',
            description: 'test',
          },
        ],
      }),
      makeSchema('CanTrcv', {
        parameters: [{ name: 'CanTrcvMaxBaudrate', type: 'integer' }],
      }),
    ];
    const validator = createCrossModuleValidator(schemas);
    const errors = validator.validate([
      makeConfig('Can', {}), // 源参数未设置
      makeConfig('CanTrcv', { CanTrcvMaxBaudrate: 250000 }),
    ]);
    expect(errors).toHaveLength(0);
  });

  it('should skip when target module not in config set', () => {
    const schemas = [
      makeSchema('Can', {
        crossReferences: [
          {
            sourceParam: 'CanControllerBaudRate',
            module: 'CanTrcv',
            param: 'CanTrcvMaxBaudrate',
            relation: 'greater_than',
            severity: 'warning',
            description: 'test',
          },
        ],
      }),
      makeSchema('CanTrcv', {
        parameters: [{ name: 'CanTrcvMaxBaudrate', type: 'integer' }],
      }),
    ];
    const validator = createCrossModuleValidator(schemas);
    const errors = validator.validate([makeConfig('Can', { CanControllerBaudRate: 100000 })]);
    expect(errors).toHaveLength(0);
  });

  it('should support in_enum relation against target options', () => {
    const schemas = [
      makeSchema('PduR', {
        crossReferences: [
          {
            sourceParam: 'PduRSrcPduHandleId',
            module: 'CanIf',
            param: 'CanIfTxPduCanId',
            relation: 'in_enum',
            severity: 'warning',
            description: 'PduR 路由的 PDU 应匹配 CanIf 配置',
          },
        ],
      }),
      makeSchema('CanIf', {
        parameters: [
          {
            name: 'CanIfTxPduCanId',
            type: 'enum',
            options: [
              { value: 'PDU_A', label: 'PDU_A' },
              { value: 'PDU_B', label: 'PDU_B' },
            ],
          },
        ],
      }),
    ];
    const validator = createCrossModuleValidator(schemas);

    const ok = validator.validate([
      makeConfig('PduR', { PduRSrcPduHandleId: 'PDU_A' }),
      makeConfig('CanIf', { CanIfTxPduCanId: 'PDU_A' }),
    ]);
    expect(ok).toHaveLength(0);

    const fail = validator.validate([
      makeConfig('PduR', { PduRSrcPduHandleId: 'PDU_C' }),
      makeConfig('CanIf', { CanIfTxPduCanId: 'PDU_A' }),
    ]);
    expect(fail).toHaveLength(1);
    expect(fail[0].code).toBe('CROSS_REF_IN_ENUM');
  });

  it('should work with validateAffectedBy for changed source param', () => {
    const schemas = [
      makeSchema('Can', {
        crossReferences: [
          {
            sourceParam: 'CanControllerBaudRate',
            module: 'CanTrcv',
            param: 'CanTrcvMaxBaudrate',
            relation: 'greater_than',
            severity: 'warning',
            description: 'test',
          },
        ],
      }),
      makeSchema('CanTrcv', {
        parameters: [{ name: 'CanTrcvMaxBaudrate', type: 'integer' }],
      }),
    ];
    const validator = createCrossModuleValidator(schemas);
    const configs = [
      makeConfig('Can', { CanControllerBaudRate: 100000 }),
      makeConfig('CanTrcv', { CanTrcvMaxBaudrate: 250000 }),
    ];
    const errors = validator.validateAffectedBy(
      [{ module: 'Can', param: 'CanControllerBaudRate' }],
      configs
    );
    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe('CROSS_REF_GREATER_THAN');
  });

  it('should work with validateAffectedBy when target param changes (reverse)', () => {
    const schemas = [
      makeSchema('Can', {
        crossReferences: [
          {
            sourceParam: 'CanControllerBaudRate',
            module: 'CanTrcv',
            param: 'CanTrcvMaxBaudrate',
            relation: 'greater_than',
            severity: 'warning',
            description: 'test',
          },
        ],
      }),
      makeSchema('CanTrcv', {
        parameters: [{ name: 'CanTrcvMaxBaudrate', type: 'integer' }],
      }),
    ];
    const validator = createCrossModuleValidator(schemas);
    const configs = [
      makeConfig('Can', { CanControllerBaudRate: 100000 }),
      makeConfig('CanTrcv', { CanTrcvMaxBaudrate: 250000 }),
    ];
    // 修改目标参数 CanTrcvMaxBaudrate → 应触发反向检查
    const errors = validator.validateAffectedBy(
      [{ module: 'CanTrcv', param: 'CanTrcvMaxBaudrate' }],
      configs
    );
    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe('CROSS_REF_GREATER_THAN');
  });
});
