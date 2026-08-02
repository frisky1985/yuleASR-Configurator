import { describe, it, expect } from 'vitest';

// Fix 24 (W1): Editor.tsx selectedModule 精确匹配
// 原实现 `selectedPath.includes(m.id)` 是 substring 匹配，选中 Cantp 时误匹配 Can 模块。
// 修复后使用 `new RegExp(\`module:${m.id}(/|$)\`)` 精确匹配 module:<id> 段。
// 此测试直接验证该正则行为，防止回归。
function modulePathMatches(moduleId: string, selectedPath: string): boolean {
  return new RegExp(`module:${moduleId}(/|$)`).test(selectedPath);
}

describe('Fix 24: selectedModule 精确匹配', () => {
  it('选中 Cantp 时不会误匹配 Can 模块（substring 回归用例）', () => {
    const path = 'layer:MCAL/module:cantp/container:cantpconfigset';
    expect(modulePathMatches('can', path)).toBe(false);
    expect(modulePathMatches('cantp', path)).toBe(true);
  });

  it('module:<id> 后跟 / 时精确匹配', () => {
    const path = 'layer:MCAL/module:can/container:CanController/instance:CanController_0/param:baudrate';
    expect(modulePathMatches('can', path)).toBe(true);
    expect(modulePathMatches('cantp', path)).toBe(false);
  });

  it('路径恰以 module:<id> 结尾时匹配（$ 分支）', () => {
    expect(modulePathMatches('can', 'layer:MCAL/module:can')).toBe(true);
    expect(modulePathMatches('mcu', 'layer:MCAL/module:mcu')).toBe(true);
  });

  it('非模块路径不匹配', () => {
    expect(modulePathMatches('can', 'layer:MCAL/container:something')).toBe(false);
    expect(modulePathMatches('can', '')).toBe(false);
  });

  it('前缀相同的模块 id 互不误匹配', () => {
    const path = 'layer:MCAL/module:mcu/param:x';
    expect(modulePathMatches('mcu', path)).toBe(true);
    expect(modulePathMatches('mc', path)).toBe(false);
    expect(modulePathMatches('mcuu', path)).toBe(false);
  });
});
