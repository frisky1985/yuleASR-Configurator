import { describe, it, expect } from 'vitest';
import { EcucCodeGenerator } from '../ecuc-generator';
import type { ModuleConfig, ModuleSchema } from '../../types';

describe('EcucCodeGenerator', () => {
  const generator = new EcucCodeGenerator();

  const baseSchema: ModuleSchema = {
    name: 'Can',
    label: 'CAN Driver',
    layer: 'MCAL',
    version: '1.0.0',
    parameters: [
      { name: 'canBaudrate', type: 'integer', required: true, description: 'CAN baud rate' },
      { name: 'canDevErrorDetect', type: 'boolean', required: false, description: 'DET enable' },
    ],
    containers: [],
  };

  it('should have correct metadata', () => {
    expect(generator.name).toBe('EcucCodeGenerator');
    expect(generator.version).toBe('1.0.0');
  });

  it('should support all modules', () => {
    expect(generator.supports('Can')).toBe(true);
    expect(generator.supports('CanIf')).toBe(true);
    expect(generator.supports('EcuM')).toBe(true);
    expect(generator.supports('OS')).toBe(true);
  });

  it('should return generation result with files on valid config', async () => {
    const config: ModuleConfig = {
      module: 'Can',
      version: '1.0.0',
      parameters: { canBaudrate: 500000, canDevErrorDetect: false },
      containers: {},
    };
    const result = await generator.generate(config, baseSchema, {
      outputDir: './out',
      generateComments: true,
    });
    expect(result.success).toBe(true);
    expect(result.files.length).toBe(4); // .h + .c + _PBcfg.c + _Lcfg.c
    expect(result.files[0].language).toBe('h');
    expect(result.files[1].language).toBe('c');
  });

  it('should produce valid include guard in header', async () => {
    const config: ModuleConfig = {
      module: 'Can',
      version: '1.0.0',
      parameters: { canBaudrate: 500000 },
      containers: {},
    };
    const result = await generator.generate(config, baseSchema, {
      outputDir: './out',
    });
    const header = result.files.find(f => f.path.endsWith('.h'));
    expect(header).toBeDefined();
    expect(header!.content).toContain('#ifndef ECUC_CAN_H');
    expect(header!.content).toContain('#define ECUC_CAN_H');
    expect(header!.content).toContain('#endif /* ECUC_CAN_H */');
  });

  it('should include parameter macros in header', async () => {
    const config: ModuleConfig = {
      module: 'Can',
      version: '1.0.0',
      parameters: { canBaudrate: 500000, canDevErrorDetect: false },
      containers: {},
    };
    const result = await generator.generate(config, baseSchema, {
      outputDir: './out',
      generateComments: true,
    });
    const header = result.files.find(f => f.path.endsWith('.h'))!.content;
    expect(header).toContain('CAN_CANBAUDRATE');
    expect(header).toContain('CAN_CANDEVERRORDETECT');
  });

  it('should include Init/DeInit function declarations in header', async () => {
    const config: ModuleConfig = {
      module: 'Can',
      version: '1.0.0',
      parameters: { canBaudrate: 500000 },
      containers: {},
    };
    const result = await generator.generate(config, baseSchema, {
      outputDir: './out',
    });
    const header = result.files.find(f => f.path.endsWith('.h'))!.content;
    expect(header).toContain('Std_ReturnType Can_Init');
    expect(header).toContain('void Can_DeInit');
    expect(header).toContain('void Can_GetVersionInfo');
  });

  it('should fail on missing required parameter', async () => {
    const config: ModuleConfig = {
      module: 'Can',
      version: '1.0.0',
      parameters: {}, // missing required canBaudrate
      containers: {},
    };
    const result = await generator.generate(config, baseSchema, {
      outputDir: './out',
    });
    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
    expect(result.errors![0]).toContain('canBaudrate');
  });

  it('should generate all four file types', async () => {
    const config: ModuleConfig = {
      module: 'Mcu',
      version: '1.0.0',
      parameters: {},
      containers: {},
    };
    const schema: ModuleSchema = {
      name: 'Mcu',
      label: 'MCU Driver',
      layer: 'MCAL',
      version: '1.0.0',
      parameters: [],
      containers: [],
    };
    const result = await generator.generate(config, schema, {
      outputDir: './output',
    });
    expect(result.files.length).toBe(4);
    const paths = result.files.map(f => f.path);
    expect(paths).toContain('./output/Ecuc_Mcu.h');
    expect(paths).toContain('./output/Ecuc_Mcu.c');
    expect(paths).toContain('./output/Ecuc_Mcu_PBcfg.c');
    expect(paths).toContain('./output/Ecuc_Mcu_Lcfg.c');
  });
});
