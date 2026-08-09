import { describe, it, expect } from 'vitest';

import { loadModuleSchemas, generatedJsonToModuleSchema, moduleSchemas } from '../load-generated';

describe('loadModuleSchemas (P2-2 loader)', () => {
  it('should load all 117 generated modules', () => {
    const schemas = loadModuleSchemas();
    // 117 JSON + index.ts 导出 117 个
    expect(schemas.length).toBe(117);
  });

  it('should preserve module metadata (layer/version/description)', () => {
    const schemas = loadModuleSchemas();
    const can = schemas.find(s => s.name === 'Can');
    expect(can).toBeDefined();
    // 分层来自 JSON x-layer（与 TASK_STATUS 统计一致），此处仅断言合法值
    expect(['MCAL', 'ECUAL', 'Service', 'RTE', 'ASW']).toContain(can!.layer);
    expect(can!.version).toBeTruthy();

    const nvm = schemas.find(s => s.name === 'NvM');
    expect(nvm!.layer).toBe('Service');
  });

  it('should convert containers into flat parameters without loss', () => {
    const schemas = loadModuleSchemas();
    const can = schemas.find(s => s.name === 'Can')!;
    expect(can.containers?.length ?? 0).toBeGreaterThan(0);
    expect(can.parameters.length).toBeGreaterThan(0);
    // 容器应包含名称与描述
    expect(can.containers?.[0]?.name).toBeTruthy();
    expect(can.containers?.[0]?.description).toBeTruthy();
  });

  it('should handle ASW modules without x-source (appswc/compswc)', () => {
    const schemas = loadModuleSchemas();
    const appswc = schemas.find(s => s.name === 'AppSwc');
    const compswc = schemas.find(s => s.name === 'CompSwc');
    expect(appswc).toBeDefined();
    expect(compswc).toBeDefined();
    expect(appswc!.layer).toBe('ASW');
  });

  it('should preserve module-level crossReferences', () => {
    const schemas = loadModuleSchemas();
    const can = schemas.find(s => s.name === 'Can')!;
    expect(can.crossReferences).toBeDefined();
    expect(can.crossReferences!.length).toBeGreaterThan(0);
    expect(can.crossReferences![0].module).toBe('CanTrcv');
  });

  it('should produce parameter type mappings from JSON schema types', () => {
    const schemas = loadModuleSchemas();
    const can = schemas.find(s => s.name === 'Can')!;
    const baudrate = can.parameters.find(p => p.name === 'CanControllerBaudRate');
    expect(baudrate).toBeDefined();
    expect(['integer', 'float']).toContain(baudrate!.type);
    if (baudrate!.min !== undefined) {
      expect(baudrate!.min).toBeLessThanOrEqual(baudrate!.max ?? Infinity);
    }
  });

  it('should expose singleton moduleSchemas with 117 entries', () => {
    expect(moduleSchemas.length).toBe(117);
  });

  it('should convert a minimal JSON with non-container top-level props', () => {
    const schema = generatedJsonToModuleSchema('Xcp', {
      title: 'Xcp',
      description: 'Xcp module',
      'x-layer': 'Service',
      'x-version': '4.4.0',
      properties: {
        ComponentName: { type: 'string', description: 'name' },
      },
    });
    expect(schema.parameters.find(p => p.name === 'ComponentName')).toBeDefined();
    expect(schema.containers).toHaveLength(0);
  });
});
