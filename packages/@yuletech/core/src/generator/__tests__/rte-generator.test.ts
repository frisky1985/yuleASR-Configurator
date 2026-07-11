import { describe, it, expect } from 'vitest';
import { RteCodeGenerator } from '../rte-generator';
import type { ModuleConfig, ModuleSchema } from '../../types';

describe('RteCodeGenerator', () => {
  const generator = new RteCodeGenerator();
  const mockSchema: ModuleSchema = {
    name: 'Rte',
    label: 'Runtime Environment',
    layer: 'RTE',
    version: '1.0.0',
    parameters: [],
    containers: [],
  };

  it('should support RTE modules only', () => {
    expect(generator.supports('RTE')).toBe(true);
    expect(generator.supports('Rte')).toBe(true);
    expect(generator.supports('Os')).toBe(true);
    expect(generator.supports('Can')).toBe(false);
    expect(generator.supports('Mcu')).toBe(false);
  });

  it('should have correct metadata', () => {
    expect(generator.name).toBe('RteCodeGenerator');
    expect(generator.version).toBe('1.0.0');
  });

  it('should generate standard set of RTE files', async () => {
    const config: ModuleConfig = {
      module: 'Rte',
      version: '1.0.0',
      parameters: {},
      containers: {},
    };
    const result = await generator.generate(config, mockSchema, {
      outputDir: './out',
    });
    expect(result.success).toBe(true);
    const filenames = result.files.map(f => f.path);
    expect(filenames).toContain('./out/Rte.h');
    expect(filenames).toContain('./out/Rte.c');
    expect(filenames).toContain('./out/Rte_Type.h');
    expect(filenames).toContain('./out/Rte_Callbacks.h');
    expect(filenames).toContain('./out/Rte_Cfg.h');
    expect(filenames).toContain('./out/Rte_Lcfg.c');
    expect(result.files.length).toBe(6);
  });

  it('should generate Rte.h with proper header guard', async () => {
    const config: ModuleConfig = {
      module: 'Rte',
      version: '1.0.0',
      parameters: {},
      containers: {},
    };
    const result = await generator.generate(config, mockSchema, {
      outputDir: './out',
    });
    const rteH = result.files.find(f => f.path.endsWith('/Rte.h'))?.content || '';
    expect(rteH).toContain('#ifndef RTE_H');
    expect(rteH).toContain('#define RTE_H');
    expect(rteH).toContain('#endif /* RTE_H */');
    expect(rteH).toContain('Std_ReturnType Rte_Init');
    expect(rteH).toContain('Std_ReturnType Rte_Start');
    expect(rteH).toContain('Std_ReturnType Rte_Stop');
    expect(rteH).toContain('void Rte_GetVersionInfo');
  });

  it('should include standard RTE error codes in header', async () => {
    const config: ModuleConfig = {
      module: 'Rte',
      version: '1.0.0',
      parameters: {},
      containers: {},
    };
    const result = await generator.generate(config, mockSchema, {
      outputDir: './out',
    });
    const rteH = result.files.find(f => f.path.endsWith('/Rte.h'))?.content || '';
    expect(rteH).toContain('RTE_E_OK');
    expect(rteH).toContain('RTE_E_NOK');
    expect(rteH).toContain('RTE_E_TIMEOUT');
    expect(rteH).toContain('RTE_E_INVALID');
  });

  it('should parse and include RteInterfaces in source', async () => {
    const config: ModuleConfig = {
      module: 'Rte',
      version: '1.0.0',
      parameters: {
        RteInterfaces: [
          { name: 'SpeedSignal', type: 'SenderReceiver', dataType: 'uint16' },
          { name: 'DoorCommand', type: 'ClientServer', dataType: 'uint8' },
        ],
        RteTasks: [
          { name: 'Task_10ms', priority: 5, periodMs: 10, activationType: 'cyclic', runnableList: ['Runnable_Speed'] },
        ],
      },
      containers: {},
    };
    const result = await generator.generate(config, mockSchema, {
      outputDir: './out',
      generateComments: true,
    });
    const rteC = result.files.find(f => f.path.endsWith('/Rte.c'))?.content || '';
    expect(rteC).toContain('SpeedSignal');
    expect(rteC).toContain('DoorCommand');
    expect(rteC).toContain('Task_10ms');
    expect(rteC).toContain('cyclic');
  });

  it('should generate Rte_Cfg.h for configuration defines', async () => {
    const config: ModuleConfig = {
      module: 'Rte',
      version: '1.0.0',
      parameters: {},
      containers: {},
    };
    const result = await generator.generate(config, mockSchema, {
      outputDir: './out',
    });
    const cfg = result.files.find(f => f.path.endsWith('_Cfg.h'))?.content || '';
    expect(cfg).toBeDefined();
    expect(cfg.length).toBeGreaterThan(0);
  });
});
