import { loadModuleSchemas } from '@yuletech/core/schema/load-generated';
import { describe, expect, it } from 'vitest';

import {
  buildSchemaCoverage,
  generateHeadersFromConfig,
  type ConfigModuleLike,
} from '../codegen';


/**
 * F2b — 配置数据 → schema 驱动全量生成 + 117 模块覆盖统计测试。
 *
 * 断言对象：
 *  - generateHeadersFromConfig：全 schema 生成（与 loadModuleSchemas 等长）；
 *    enabled 配置模块参数按名覆盖 schema 默认值；disabled/未配置模块用默认值；
 *    配置独有（无 schema）模块不参与生成；
 *  - buildSchemaCoverage：有 schema 可配 / 无 schema 仅展示 + enabled/disabled/absent
 *    三态 + 摘要计数。
 */

const SCHEMA_COUNT = loadModuleSchemas().length;

function fakeModule(
  name: string,
  enabled: boolean,
  parameters: Array<{ name: string; value: unknown }> = []
): ConfigModuleLike {
  return { name, enabled, parameters };
}

describe('generateHeadersFromConfig（F2b 配置合并生成）', () => {
  it('生成全部 schema 头文件（117），与 loadModuleSchemas 等长', async () => {
    const files = await generateHeadersFromConfig([]);
    expect(files.length).toBe(SCHEMA_COUNT);
    expect(SCHEMA_COUNT).toBeGreaterThanOrEqual(119);
    for (const f of files) {
      expect(f.filename.endsWith('_Cfg.h')).toBe(true);
      expect(f.content).toContain('#define');
    }
  });

  it('enabled 模块参数按名覆盖 schema 默认值（flash: FLS_CFG_VENDOR_ID 1 → 42）', async () => {
    const files = await generateHeadersFromConfig([
      fakeModule('flash', true, [{ name: 'FLS_CFG_VENDOR_ID', value: 42 }]),
    ]);
    const flash = files.find(f => f.filename === 'Flash_Cfg.h');
    expect(flash).toBeDefined();
    expect(flash?.content).toContain('#define FLS_CFG_VENDOR_ID    (42U)');
    expect(flash?.content).not.toContain('#define FLS_CFG_VENDOR_ID    (1U)');
  });

  it('disabled 模块参数不参与覆盖（回落 schema 默认值）', async () => {
    const files = await generateHeadersFromConfig([
      fakeModule('flash', false, [{ name: 'FLS_CFG_VENDOR_ID', value: 42 }]),
    ]);
    const flash = files.find(f => f.filename === 'Flash_Cfg.h');
    expect(flash?.content).toContain('#define FLS_CFG_VENDOR_ID    (1U)');
  });

  it('未配置模块按 schema 默认值生成（不抛错，宏完整）', async () => {
    const files = await generateHeadersFromConfig([fakeModule('dio', true)]);
    expect(files.length).toBe(SCHEMA_COUNT);
    const dio = files.find(f => f.filename === 'Dio_Cfg.h');
    expect(dio?.content).toContain('#define');
  });

  it('配置独有（无 schema）模块不参与生成（集合仍 = schema 数）', async () => {
    const files = await generateHeadersFromConfig([fakeModule('CustomFoo', true)]);
    expect(files.length).toBe(SCHEMA_COUNT);
    expect(files.some(f => f.filename === 'CustomFoo_Cfg.h')).toBe(false);
  });
});

describe('buildSchemaCoverage（117 模块覆盖展示）', () => {
  it('空配置：全部模块 absent，有 schema 全量可配', () => {
    const { rows, summary } = buildSchemaCoverage([]);
    expect(summary.total).toBeGreaterThanOrEqual(119);
    expect(summary.withSchema).toBe(SCHEMA_COUNT);
    expect(summary.withoutSchema).toBe(0);
    expect(summary.configured).toBe(0);
    expect(rows.every(r => r.hasSchema && r.configStatus === 'absent')).toBe(true);
  });

  it('配置模块三态区分：enabled / disabled / absent', () => {
    const { rows, summary } = buildSchemaCoverage([
      fakeModule('flash', true),
      fakeModule('can', false),
    ]);
    const flash = rows.find(r => r.name === 'flash') ?? rows.find(r => r.name === 'Flash');
    const can = rows.find(r => r.name === 'can') ?? rows.find(r => r.name === 'Can');
    expect(flash?.configStatus).toBe('enabled');
    expect(can?.configStatus).toBe('disabled');
    expect(summary.enabled).toBe(1);
    expect(summary.configured).toBe(2);
  });

  it('配置独有模块 → 无 schema 仅展示（hasSchema=false）', () => {
    const { rows, summary } = buildSchemaCoverage([fakeModule('CustomFoo', true)]);
    const custom = rows.find(r => r.name === 'CustomFoo');
    expect(custom?.hasSchema).toBe(false);
    expect(custom?.configStatus).toBe('enabled');
    expect(custom?.layer).toBeUndefined();
    expect(summary.withoutSchema).toBe(1);
  });

  it('schema 模块带参数/容器计数与层级（抽查 flash）', () => {
    const { rows } = buildSchemaCoverage([fakeModule('flash', true)]);
    const flash = rows.find(r => r.name.toLowerCase() === 'flash');
    expect(flash?.layer).toBe('MCAL');
    expect(flash?.paramCount).toBeGreaterThan(50);
    // D 类修复（2026-08-10）：提取版 schema 不再附加 CommonPublishedInformation 容器
    // （版本宏由手写头普通参数 rawMacroNames 原样保留，避免强加 8 个版本宏冲突）
    expect(flash?.containerCount).toBe(0);
  });
});
