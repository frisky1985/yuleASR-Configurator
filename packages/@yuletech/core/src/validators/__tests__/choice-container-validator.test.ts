import { describe, it, expect } from 'vitest';

import type { ModuleSchema, ModuleConfig } from '../../types';
import { createChoiceContainerValidator } from '../choice-container-validator';

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

function makeConfig(module: string, containers: Record<string, any[]> = {}): ModuleConfig {
  return {
    module,
    version: '4.4.0',
    parameters: {},
    containers,
  };
}

describe('ChoiceContainerValidator (P2-3)', () => {
  const schema = makeSchema('CanTp', {
    containers: [
      {
        name: 'CanTpChannel',
        label: 'CanTpChannel',
        description: '通道配置',
        xChoiceContainer: true,
        parameters: ['CanTpChannelMode', 'CanTpRxTaType', 'CanTpTxTaType'],
      },
    ],
  });

  it('should pass when at most one member is set', () => {
    const validator = createChoiceContainerValidator([schema]);
    const errors = validator.validate([
      makeConfig('CanTp', {
        CanTpChannel: [
          {
            id: 'ch1',
            parameters: { CanTpChannelMode: 'CANTP_MODE_NORMAL' },
          },
        ],
      }),
    ]);
    expect(errors).toHaveLength(0);
  });

  it('should fail when multiple exclusive members are set', () => {
    const validator = createChoiceContainerValidator([schema]);
    const errors = validator.validate([
      makeConfig('CanTp', {
        CanTpChannel: [
          {
            id: 'ch1',
            parameters: {
              CanTpChannelMode: 'CANTP_MODE_NORMAL',
              CanTpRxTaType: 'CANTP_RXTA_EXTENDED',
            },
          },
        ],
      }),
    ]);
    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe('CHOICE_CONTAINER_EXCLUSIVE');
    expect(errors[0].severity).toBe('error');
  });

  it('should pass when no instances configured', () => {
    const validator = createChoiceContainerValidator([schema]);
    const errors = validator.validate([makeConfig('CanTp')]);
    expect(errors).toHaveLength(0);
  });

  it('should count child containers as members', () => {
    const schemaWithChild = makeSchema('Spi', {
      containers: [
        {
          name: 'SpiDriver',
          label: 'SpiDriver',
          description: '驱动配置',
          xChoiceContainer: true,
          parameters: [],
          children: [
            {
              name: 'SpiMasterMode',
              label: 'SpiMasterMode',
              description: '主模式',
              parameters: [],
            },
            { name: 'SpiSlaveMode', label: 'SpiSlaveMode', description: '从模式', parameters: [] },
          ],
        },
      ],
    });
    const validator = createChoiceContainerValidator([schemaWithChild]);

    // 只配一个子容器 → OK
    const ok = validator.validate([
      makeConfig('Spi', {
        SpiDriver: [
          {
            id: 'd1',
            parameters: {},
            children: {
              SpiMasterMode: [{ id: 'm1', parameters: {} }],
            },
          },
        ],
      }),
    ]);
    expect(ok).toHaveLength(0);

    // 两个子容器都配 → 违反互斥
    const fail = validator.validate([
      makeConfig('Spi', {
        SpiDriver: [
          {
            id: 'd1',
            parameters: {},
            children: {
              SpiMasterMode: [{ id: 'm1', parameters: {} }],
              SpiSlaveMode: [{ id: 's1', parameters: {} }],
            },
          },
        ],
      }),
    ]);
    expect(fail).toHaveLength(1);
    expect(fail[0].code).toBe('CHOICE_CONTAINER_EXCLUSIVE');
  });

  it('should skip unknown modules', () => {
    const validator = createChoiceContainerValidator([schema]);
    const errors = validator.validate([makeConfig('UnknownMod', { X: [{ id: 'x' }] })]);
    expect(errors).toHaveLength(0);
  });

  it('should only count xChoiceParams when specified (Id etc. not exclusive)', () => {
    const schemaWithParams = makeSchema('WdgIf', {
      containers: [
        {
          name: 'WdgIfDevice',
          label: 'WdgIfDevice',
          description: '设备配置',
          xChoiceContainer: true,
          xChoiceParams: ['WdgIfTriggeredMode'],
          parameters: ['WdgIfDeviceId', 'WdgIfTriggeredMode', 'WdgIfDevErrorDetect'],
        },
      ],
    });
    const validator = createChoiceContainerValidator([schemaWithParams]);

    // DeviceId + 一个触发模式 → 不违反 (Id 不在互斥组)
    const ok = validator.validate([
      makeConfig('WdgIf', {
        WdgIfDevice: [
          {
            id: 'd1',
            parameters: {
              WdgIfDeviceId: 0,
              WdgIfTriggeredMode: 'WDGIF_TRIGGERED_MODE_PRETRIGGER',
            },
          },
        ],
      }),
    ]);
    expect(ok).toHaveLength(0);
  });

  describe('defensive: instance without parameters (Fix 21 K8)', () => {
    it('should not crash when instance lacks the parameters field (fallback branch)', () => {
      const validator = createChoiceContainerValidator([schema]);
      const errors = validator.validate([
        makeConfig('CanTp', {
          CanTpChannel: [{ id: 'ch1' }], // 无 parameters 字段
        }),
      ]);
      expect(errors).toHaveLength(0);
    });

    it('should not crash when instance lacks parameters with xChoiceParams branch', () => {
      const schemaWithX = makeSchema('WdgIf', {
        containers: [
          {
            name: 'WdgIfDevice',
            label: 'WdgIfDevice',
            description: '设备配置',
            xChoiceContainer: true,
            xChoiceParams: ['WdgIfTriggeredMode'],
            parameters: ['WdgIfDeviceId', 'WdgIfTriggeredMode'],
          },
        ],
      });
      const validator = createChoiceContainerValidator([schemaWithX]);
      const errors = validator.validate([makeConfig('WdgIf', { WdgIfDevice: [{ id: 'd1' }] })]);
      expect(errors).toHaveLength(0);
    });
  });
});
