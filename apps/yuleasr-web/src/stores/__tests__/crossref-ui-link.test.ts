import { describe, expect, it } from 'vitest';
import { create } from 'zustand';
import type { ConfigFile, ModuleConfig } from '@yuletech/core';
import { CrossModuleValidator } from '@yuletech/core/validators';
import { loadPreferredSchemas } from '../../services/schemaSource';

// 复刻 configStore.validateCrossModuleChanges 的核心链路（不依赖完整 store 状态）
function uiValidate(configs: ModuleConfig[], changedModule: string, changedParam: string) {
  const schemas = loadPreferredSchemas();
  const validator = new CrossModuleValidator(new Map(schemas.map(s => [s.name, s])));
  const errors = validator.validateAffectedBy(
    [{ module: changedModule, param: changedParam }],
    configs
  );
  return errors;
}

describe('T9 UI 层实时校验链路（configStore 同款）', () => {
  it('编辑 Fee.FEE_BLOCK_SIZE_512 时实时检测 Fls 依赖违反', () => {
    const configs: ModuleConfig[] = [
      { module: 'Fee', parameters: { FEE_BLOCK_SIZE_512: 4096 } },
      { module: 'Fls', parameters: { FLS_MAX_READ_NORMAL_MODE: 256 } },
      { module: 'MemIf', parameters: { MEMIF_NUMBER_OF_DEVICES: 1 } },
      { module: 'NvM', parameters: { NVM_NUM_OF_NVRAM_BLOCKS: 1 } },
      { module: 'Ea', parameters: { EA_NUM_BLOCKS: 1 } },
    ];
    const errors = uiValidate(configs, 'Fee', 'FEE_BLOCK_SIZE_512');
    console.log(`[T9] Fee 编辑实时检测: ${errors.length} 条`);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].code).toBe('CROSS_REF_LESS_THAN');
  });

  it('合法配置不误报', () => {
    const configs: ModuleConfig[] = [
      { module: 'Fee', parameters: { FEE_BLOCK_SIZE_512: 128 } },
      { module: 'Fls', parameters: { FLS_MAX_READ_NORMAL_MODE: 256 } },
      { module: 'MemIf', parameters: { MEMIF_NUMBER_OF_DEVICES: 1 } },
      { module: 'NvM', parameters: { NVM_NUM_OF_NVRAM_BLOCKS: 1 } },
      { module: 'Ea', parameters: { EA_NUM_BLOCKS: 1 } },
    ];
    const errors = uiValidate(configs, 'Fee', 'FEE_BLOCK_SIZE_512');
    expect(errors).toHaveLength(0);
  });

  it('编辑 Dio.DIO_NUM_PORTS 时 equals 依赖 Port 实时检测', () => {
    const configs: ModuleConfig[] = [
      { module: 'Dio', parameters: { DIO_NUM_PORTS: 3 } },
      { module: 'Port', parameters: { PORT_NUM_PORTS: 2, PORT_TOTAL_NUM_PINS: 16 } },
    ];
    const errors = uiValidate(configs, 'Dio', 'DIO_NUM_PORTS');
    console.log(`[T9] Dio equals 实时检测: ${errors.length} 条`);
    expect(errors.length).toBeGreaterThan(0);
  });
});
