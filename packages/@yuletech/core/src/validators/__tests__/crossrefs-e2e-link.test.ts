import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { schemaExtractor } from '../../schema-extractor';
import { loadModuleSchemas } from '../../schema/load-generated';
import { createCrossModuleValidator } from '../cross-module-validator';
import type { ModuleConfig } from '../../types';

describe('P2-2 crossReferences end-to-end link', () => {
  it('schemaExtractor should expose 54+ generated schemas', () => {
    const all = schemaExtractor.getAllSchemas();
    expect(all.length).toBeGreaterThanOrEqual(54);
  });

  it('loaded schemas should include crossReferences on annotated modules', () => {
    const schemas = loadModuleSchemas();
    const withRefs = schemas.filter(s => s.crossReferences && s.crossReferences.length > 0);
    expect(withRefs.length).toBeGreaterThanOrEqual(15);

    // 宏名版全集（extracted-cfgh）目标参数索引：宏名版引用（CfgH-Extracted 模块）
    // 的目标参数（如 Dem.DEM_NUM_DTCS）只在宏名版 schema 存在；generated/ 中目标模块
    // 可能是手写版（ARXML 参数名），故目标存在性需在两个全集中任一命中。
    const macroParams = new Map<string, Set<string>>();
    const macroContainers = new Map<string, Set<string>>();
    const macroDir = join(__dirname, '../../../../../..', 'verification/extracted-cfgh');
    for (const f of readdirSync(macroDir).filter(f => f.endsWith('.json'))) {
      const j = JSON.parse(readFileSync(join(macroDir, f), 'utf8')) as {
        'x-display-name'?: string;
        properties?: Record<string, unknown>;
      };
      const key = (j['x-display-name'] || f.replace(/\.json$/, '')).toLowerCase();
      macroParams.set(key, new Set(Object.keys(j.properties || {})));
    }

    // Every crossReference must point to real params in the loaded schema set
    for (const s of withRefs) {
      for (const ref of s.crossReferences!) {
        expect(ref.sourceParam, `${s.name}.${ref.sourceParam} should exist`).toBeTruthy();
        const target = schemas.find(t => t.name === ref.module);
        expect(target, `target module ${ref.module} should exist`).toBeDefined();
        const targetParams = new Set(target!.parameters.map(p => p.name));
        // container names also count as targets for in_enum refs
        const targetContainers = new Set((target!.containers || []).map(c => c.name));
        const macroHits = macroParams.get(ref.module.toLowerCase());
        expect(
          targetParams.has(ref.param) ||
            targetContainers.has(ref.param) ||
            (macroHits !== undefined && macroHits.has(ref.param)),
          `${ref.module}.${ref.param} should exist (generated 或宏名版 extracted-cfgh)`
        ).toBe(true);
      }
    }
  });

  it('end-to-end: validator flags a real cross-module violation', () => {
    const schemas = loadModuleSchemas();
    const validator = createCrossModuleValidator(schemas);

    // Can.CanControllerBaudRate (100000) must be > CanTrcv.CanTrcvMaxBaudrate? No —
    // relation is less_than: Can baudrate must be < CanTrcv max. 100000 < 250000 → OK.
    const okConfigs: ModuleConfig[] = [
      { module: 'Can', version: '4.4.0', parameters: { CanControllerBaudRate: 100000 } },
      { module: 'CanTrcv', version: '4.4.0', parameters: { CanTrcvMaxBaudrate: 250000 } },
    ];
    expect(validator.validate(okConfigs)).toHaveLength(0);

    // Violation: Can baudrate 500000 > CanTrcv max 250000 → less_than violated
    const badConfigs: ModuleConfig[] = [
      { module: 'Can', version: '4.4.0', parameters: { CanControllerBaudRate: 500000 } },
      { module: 'CanTrcv', version: '4.4.0', parameters: { CanTrcvMaxBaudrate: 250000 } },
    ];
    const errors = validator.validate(badConfigs);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].code).toBe('CROSS_REF_LESS_THAN');
  });
});
