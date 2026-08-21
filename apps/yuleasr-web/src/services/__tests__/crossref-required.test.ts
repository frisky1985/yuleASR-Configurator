import { describe, expect, it } from 'vitest';
import { CrossModuleValidator } from '@yuletech/core/validators';
import { loadPreferredSchemas } from '../schemaSource';

function makeValidator() {
  const schemas = loadPreferredSchemas();
  return new CrossModuleValidator(new Map(schemas.map(s => [s.name, s])));
}

describe('T10 required 依赖必须存在（老板钦定：Can 依赖时钟未配置 → 报错）', () => {
  it('Can 配置但 Mcu 时钟未配置 → CROSS_REF_REQUIRED 报错', () => {
    const v = makeValidator();
    const configs = [
      { module: 'Can', parameters: { CAN_NUM_CONTROLLERS: 2, CAN_BAUDRATE_500K: 1 } },
      // Mcu 缺失 = 时钟未配置
    ];
    const errors = v.validate(configs as any);
    console.log(
      `[T10] 全部错误 ${errors.length} 条: ${errors.map(e => e.code + ':' + e.message).join(' | ')}`
    );
    const req = errors.filter(e => e.code === 'CROSS_REF_REQUIRED');
    console.log(
      `[T10] Can 无 Mcu → ${req.length} 条 required 错误: ${req.map(e => e.message).join(' | ')}`
    );
    expect(req.length).toBeGreaterThan(0);
    expect(req.some(e => e.message.includes('Mcu'))).toBe(true);
  });

  it('Can 配置 + Mcu 时钟已配置 → 通过', () => {
    const v = makeValidator();
    const configs = [
      { module: 'Can', parameters: { CAN_NUM_CONTROLLERS: 2, CAN_BAUDRATE_500K: 1 } },
      { module: 'Mcu', parameters: { MCU_SYSTEM_CLOCK_HZ: 160000000 } },
    ];
    const errors = v.validate(configs as any);
    const req = errors.filter(e => e.code === 'CROSS_REF_REQUIRED');
    console.log(`[T10] Can + Mcu → required 错误 ${req.length} 条`);
    expect(req).toHaveLength(0);
  });

  it('CanTp 配置但 Can 未配置 → 报错', () => {
    const v = makeValidator();
    const configs = [{ module: 'CanTp', parameters: { CANTP_NUM_CHANNELS: 1 } }];
    const errors = v.validate(configs as any);
    const req = errors.filter(e => e.code === 'CROSS_REF_REQUIRED');
    console.log(`[T10] CanTp 无 Can → ${req.length} 条: ${req.map(e => e.message).join(' | ')}`);
    expect(req.length).toBeGreaterThan(0);
    expect(req.some(e => e.message.includes('Can'))).toBe(true);
  });

  it('required 缺失是 error 级（不是 warning）', () => {
    const v = makeValidator();
    const errors = v.validate([{ module: 'Can', parameters: { CAN_NUM_CONTROLLERS: 2 } }] as any);
    const req = errors.filter(e => e.code === 'CROSS_REF_REQUIRED');
    expect(req.length).toBeGreaterThan(0);
    expect(req.every(e => e.severity === 'error')).toBe(true);
  });
});
