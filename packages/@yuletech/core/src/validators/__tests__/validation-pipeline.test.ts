import { describe, it, expect } from 'vitest';

import type { ModuleConfig, ModuleSchema, ModuleParameter } from '../../types';
import { ValidationPipeline, validateAll } from '../validation-pipeline';

// ─── Helpers ─────────────────────────────────────────────────────────────

function makeConfig(module: string, params: Record<string, unknown> = {}): ModuleConfig {
  return {
    module,
    version: '4.4.0',
    parameters: params,
  };
}

function makeSchema(name: string, params: ModuleParameter[] = []): ModuleSchema {
  return {
    name,
    layer: 'MCAL',
    version: '4.4.0',
    parameters: params,
    label: name,
  };
}

// ─── Tests ───────────────────────────────────────────────────────────────

describe('ValidationPipeline', () => {
  const pipeline = new ValidationPipeline();

  describe('正常配置', () => {
    it('should pass for valid module configurations', () => {
      const configs: ModuleConfig[] = [
        makeConfig('Mcu', { clock_frequency: 160_000_000, core_count: 2 }),
        makeConfig('Can', { baudrate: 500_000, controller_count: 2 }),
      ];
      const schemas: ModuleSchema[] = [
        makeSchema('Mcu'),
        makeSchema('Can'),
      ];

      const result = pipeline.validate(configs, schemas);

      expect(result.moduleCount).toBe(2);
      expect(result.isValid).toBe(true);
      expect(result.allErrors).toHaveLength(0);
      expect(result.moduleErrors).toHaveLength(0);
      expect(result.crossModuleErrors).toHaveLength(0);
      expect(result.conditionErrors).toHaveLength(0);
    });
  });

  describe('有跨模块错误', () => {
    it('should capture cross-module dependency errors', () => {
      // CanTp requires CanIf and PduR — neither is present
      const configs: ModuleConfig[] = [
        makeConfig('CanTp'),
      ];
      const schemas: ModuleSchema[] = [
        makeSchema('CanTp'),
      ];

      const result = pipeline.validate(configs, schemas);

      expect(result.moduleCount).toBe(1);
      // Should have error-level cross-module dependency errors
      // YuleasrValidator.validateModules checks local dependency rules (CanIf, PduR)
      expect(result.moduleErrors.length).toBeGreaterThan(0);
      // CrossModuleValidator won't find cross-references (schema has none)
      expect(result.crossModuleErrors).toHaveLength(0);
      // Combined
      expect(result.isValid).toBe(false);
      expect(result.allErrors.filter((e) => e.severity === 'error').length).toBeGreaterThanOrEqual(1);
      const msgs = result.allErrors.map((e) => e.message).join(' ');
      expect(msgs).toMatch(/CanTp/);
    });

    it('should detect cross-reference constraint violations', () => {
      // Create a schema with a cross-reference
      const sourceSchema: ModuleSchema = {
        name: 'Can',
        layer: 'MCAL',
        version: '4.4.0',
        parameters: [
          {
            name: 'baudrate',
            type: 'integer',
            crossReferences: [
              {
                module: 'CanTrcv',
                param: 'supported_baudrates',
                relation: 'in_range',
                severity: 'error',
                description: 'Can baudrate must be supported by CanTrcv',
              },
            ],
          },
        ],
      };
      // CanTrcv schema — for in_range we need min/max on the target param
      const targetSchema: ModuleSchema = {
        name: 'CanTrcv',
        layer: 'ECUAL',
        version: '4.4.0',
        parameters: [
          {
            name: 'supported_baudrates',
            type: 'integer',
            min: 100_000,
            max: 500_000,
          },
        ],
      };

      // Can baudrate is 1_000_000 which exceeds CanTrcv.max (500_000)
      const configs: ModuleConfig[] = [
        makeConfig('Can', { baudrate: 1_000_000 }),
        makeConfig('CanTrcv', { supported_baudrates: 500_000 }),
      ];

      const result = pipeline.validate(configs, [sourceSchema, targetSchema]);

      expect(result.isValid).toBe(false);
      expect(result.crossModuleErrors.length).toBeGreaterThan(0);
      const crossMsg = result.crossModuleErrors.map((e) => e.message).join(' ');
      expect(crossMsg).toMatch(/500000|最大|min|max/i);
    });
  });

  describe('有条件错误', () => {
    it('should capture condition expression evaluation errors', () => {
      const configs: ModuleConfig[] = [
        makeConfig('Can', { baudrate: 500_000 }),
      ];
      const schemas: ModuleSchema[] = [
        makeSchema('Can'),
      ];

      // Malformed condition expression that will cause a parse error
      const conditions: Record<string, string> = {
        visibleWhen: 'Can.baudrate == ', // incomplete expression
      };

      const result = pipeline.validate(configs, schemas, conditions);

      expect(result.conditionErrors.length).toBeGreaterThan(0);
      expect(result.conditionErrors[0].path).toContain('condition:');
      expect(result.conditionErrors[0].severity).toBe('error');
      // Should be invalid because condition error has error severity
      expect(result.isValid).toBe(false);
    });

    it('should pass with valid condition expressions', () => {
      const configs: ModuleConfig[] = [
        makeConfig('Can', { baudrate: 500_000 }),
        makeConfig('CanIf'),
      ];
      const schemas: ModuleSchema[] = [
        makeSchema('Can'),
        makeSchema('CanIf'),
      ];

      // Valid condition
      const conditions: Record<string, string> = {
        visibleWhen: 'Can.baudrate == 500000',
      };

      const result = pipeline.validate(configs, schemas, conditions);

      expect(result.isValid).toBe(true);
      expect(result.conditionErrors).toHaveLength(0);
    });
  });

  describe('去重', () => {
    it('should deduplicate identical errors', () => {
      const configs: ModuleConfig[] = [
        makeConfig('CanTp'),
      ];
      const schemas: ModuleSchema[] = [
        makeSchema('CanTp'),
      ];

      const result = pipeline.validate(configs, schemas);

      // allErrors should be deduplicated
      const allKeys = result.allErrors.map((e) => `${e.path}|${e.message}`);
      const uniqueKeys = new Set(allKeys);
      expect(allKeys.length).toBe(uniqueKeys.size);
    });
  });

  describe('validateAll convenience function', () => {
    it('should work as a one-shot validator', () => {
      const configs: ModuleConfig[] = [
        makeConfig('Mcu', { clock_frequency: 160_000_000, core_count: 1 }),
      ];
      const schemas: ModuleSchema[] = [
        makeSchema('Mcu'),
      ];

      const result = validateAll(configs, schemas);
      expect(result.isValid).toBe(true);
      expect(result.moduleCount).toBe(1);
    });

    it('should accept optional conditions parameter', () => {
      const configs: ModuleConfig[] = [
        makeConfig('Can', { baudrate: 500_000 }),
      ];
      const schemas: ModuleSchema[] = [
        makeSchema('Can'),
      ];

      const result = validateAll(configs, schemas, { enabledWhen: 'Can.baudrate > 0' });
      expect(result.isValid).toBe(true);
    });
  });

  describe('空输入', () => {
    it('should handle empty configs array', () => {
      const result = pipeline.validate([], []);
      expect(result.moduleCount).toBe(0);
      expect(result.isValid).toBe(true);
      expect(result.allErrors).toHaveLength(0);
    });
  });
});
