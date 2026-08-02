import { describe, it, expect } from 'vitest';

import type { PluginContext, ValidatorPlugin } from '@yuletech/plugin-sdk';
import schemaValidatorPlugin from '../schema-validator-plugin';
import { schemaCache } from '../../../schema';

function makeContext(): { context: PluginContext; validators: ValidatorPlugin[] } {
  const validators: ValidatorPlugin[] = [];
  const context: PluginContext = {
    config: {},
    logger: { info: () => {}, warn: () => {}, error: () => {}, debug: () => {} },
    registerCodeGenerator: () => {},
    registerValidator: v => {
      validators.push(v);
    },
    registerDataExporter: () => {},
  };
  return { context, validators };
}

describe('schema-validator-plugin (Fix 21 K1: schemaCache 空转)', () => {
  it('activate 时应填充全局 schemaCache（此前为空导致永远 info）', async () => {
    schemaCache.clear();
    expect(schemaCache.has('Mcu')).toBe(false);

    const { context } = makeContext();
    await schemaValidatorPlugin.activate(context);

    expect(schemaCache.has('Mcu')).toBe(true);
    expect(schemaCache.has('Can')).toBe(true);
    expect(schemaCache.getAll().size).toBeGreaterThanOrEqual(54);
  });

  it('required/enum/range 真实触发（不再因为缓存为空而跳过）', async () => {
    schemaCache.clear();
    schemaCache.set('TestMod', {
      name: 'TestMod',
      parameters: [
        { name: 'reqParam', type: 'string', required: true },
        { name: 'modeParam', type: 'enum', options: [{ value: 'A' }, { value: 'B' }] },
        { name: 'numParam', type: 'integer', min: 1, max: 10 },
      ],
    });

    const { context, validators } = makeContext();
    await schemaValidatorPlugin.activate(context);

    const validator = validators[0];
    expect(validator).toBeDefined();

    const results = await validator.validate({
      modules: {
        TestMod: {
          version: '4.4.0',
          parameters: { modeParam: 'C', numParam: 99 },
        },
      },
    });

    // 不再输出 "No AUTOSAR schema found" info（此前缓存为空时的表现）
    expect(results.some(r => r.message.includes('No AUTOSAR schema found'))).toBe(false);

    // required 真实报错
    expect(results.some(r => r.message.includes('Missing required parameter: reqParam'))).toBe(true);
    // enum 真实报错
    expect(results.some(r => r.message.includes('Invalid value "C" for modeParam'))).toBe(true);
    // range 真实报错（超出 max）
    expect(results.some(r => r.message.includes('exceeds maximum 10'))).toBe(true);
  });
});
