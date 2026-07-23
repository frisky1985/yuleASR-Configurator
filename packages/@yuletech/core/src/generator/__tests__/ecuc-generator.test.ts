import { describe, it, expect } from 'vitest';

import type { ModuleConfig, ModuleSchema } from '../../types';
import { EcucCodeGenerator } from '../ecuc-generator';

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
    expect(header!.content).toContain('#ifndef ECUC_CAN_CFG_H');
    expect(header!.content).toContain('#define ECUC_CAN_CFG_H');
    expect(header!.content).toContain('#endif /* ECUC_CAN_CFG_H */');
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

  it('should NOT include Init/DeInit/MainFunction declarations in ECUC header (those go in driver headers)', async () => {
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
    expect(header).not.toContain('Std_ReturnType Can_Init');
    expect(header).not.toContain('Std_ReturnType Can_DeInit');
    expect(header).not.toContain('void Can_GetVersionInfo');
    expect(header).not.toContain('void Can_MainFunction');
    expect(header).not.toContain('boolean Can_IsInitialized');
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
    expect(paths).toContain('./output/Ecuc_Mcu_Cfg.h');
    expect(paths).toContain('./output/Ecuc_Mcu.c');
    expect(paths).toContain('./output/Ecuc_Mcu_PBcfg.c');
    expect(paths).toContain('./output/Ecuc_Mcu_Lcfg.c');
  });
});

describe('EcucCodeGenerator - Container generation', () => {
  const generator = new EcucCodeGenerator();

  const schemaWithContainers: ModuleSchema = {
    name: 'Can',
    label: 'CAN Driver',
    layer: 'MCAL',
    version: '1.0.0',
    parameters: [{ name: 'canDevErrorDetect', type: 'boolean', required: false }],
    containers: [
      {
        name: 'CanController',
        label: 'CAN Controller',
        multiple: true,
        minInstances: 1,
        maxInstances: 4,
        parameters: ['canBaudrate', 'canControllerId'],
      },
    ],
  };

  it('should generate container count macros', async () => {
    const config: ModuleConfig = {
      module: 'Can',
      version: '1.0.0',
      parameters: { canDevErrorDetect: false },
      containers: {
        CanController: [
          { id: 'ctrl0', parameters: { canBaudrate: 500000, canControllerId: 0 } },
          { id: 'ctrl1', parameters: { canBaudrate: 250000, canControllerId: 1 } },
        ],
      },
    };
    const result = await generator.generate(config, schemaWithContainers, {
      outputDir: './out',
    });
    const header = result.files.find(f => f.path.endsWith('.h'))!.content;
    expect(header).toContain('CAN_CANCONTROLLER_COUNT');
  });

  it('should reject container count below minimum', async () => {
    const config: ModuleConfig = {
      module: 'Can',
      version: '1.0.0',
      parameters: {},
      containers: { CanController: [] }, // 0 < minInstances=1
    };
    const result = await generator.generate(config, schemaWithContainers, {
      outputDir: './out',
    });
    expect(result.success).toBe(false);
    expect(result.errors![0]).toContain('CanController');
  });

  it('should generate PBcfg file with post-build content', async () => {
    const config: ModuleConfig = {
      module: 'Can',
      version: '1.0.0',
      parameters: { canDevErrorDetect: false },
      containers: {
        CanController: [{ id: 'ctrl0', parameters: { canBaudrate: 500000, canControllerId: 0 } }],
      },
    };
    const result = await generator.generate(config, schemaWithContainers, {
      outputDir: './out',
      generateComments: true,
    });
    const pbcfg = result.files.find(f => f.path.endsWith('_PBcfg.c'));
    expect(pbcfg).toBeDefined();
    expect(pbcfg!.content).toContain('Post-Build Configuration');
  });

  it('should generate Lcfg file with link-time content', async () => {
    const config: ModuleConfig = {
      module: 'Can',
      version: '1.0.0',
      parameters: { canDevErrorDetect: false },
      containers: {
        CanController: [{ id: 'ctrl0', parameters: { canBaudrate: 500000, canControllerId: 0 } }],
      },
    };
    const result = await generator.generate(config, schemaWithContainers, {
      outputDir: './out',
    });
    const lcfg = result.files.find(f => f.path.endsWith('_Lcfg.c'));
    expect(lcfg).toBeDefined();
    expect(lcfg!.content).toContain('Link-Time Configuration');
  });

  it('should generate container type definitions in header', async () => {
    const config: ModuleConfig = {
      module: 'Can',
      version: '1.0.0',
      parameters: { canDevErrorDetect: false },
      containers: {
        CanController: [{ id: 'ctrl0', parameters: { canBaudrate: 500000, canControllerId: 0 } }],
      },
    };
    const result = await generator.generate(config, schemaWithContainers, {
      outputDir: './out',
    });
    const header = result.files.find(f => f.path.endsWith('.h'))!.content;
    expect(header).toContain('Can_CanControllerType');
    expect(header).toContain('Can_ConfigSetType');
    expect(header).not.toContain('Can_ConfigType'); // ConfigType defined in driver header, not ECUC
  });
});

describe('EcucCodeGenerator - Edge cases', () => {
  const generator = new EcucCodeGenerator();

  const baseSchema: ModuleSchema = {
    name: 'Can',
    label: 'CAN Driver',
    layer: 'MCAL',
    version: '1.0.0',
    parameters: [{ name: 'canBaudrate', type: 'integer', required: true }],
    containers: [],
  };

  it('should handle empty module name without crashing', async () => {
    const config: ModuleConfig = { module: '', version: '1.0', parameters: {}, containers: {} };
    const schema: ModuleSchema = {
      name: '',
      label: '',
      layer: 'MCAL',
      version: '1.0',
      parameters: [],
      containers: [],
    };
    const result = await generator.generate(config, schema, { outputDir: './out' });
    expect(result.files.length).toBe(4);
  });

  it('should handle negative numeric parameters', async () => {
    const config: ModuleConfig = {
      module: 'Can',
      version: '1.0',
      parameters: { canBaudrate: -1 },
      containers: {},
    };
    const result = await generator.generate(config, baseSchema, { outputDir: './out' });
    expect(result.success).toBe(true);
    const header = result.files[0].content;
    expect(header).toContain('-1');
  });

  it('should handle zero numeric parameters', async () => {
    const config: ModuleConfig = {
      module: 'Can',
      version: '1.0',
      parameters: { canBaudrate: 0 },
      containers: {},
    };
    const result = await generator.generate(config, baseSchema, { outputDir: './out' });
    expect(result.success).toBe(true);
  });

  it('should handle boolean false in generated macros', async () => {
    const config: ModuleConfig = {
      module: 'Can',
      version: '1.0',
      parameters: { canBaudrate: 500000 },
      containers: {},
    };
    const schema: ModuleSchema = {
      name: 'Can',
      label: 'CAN',
      layer: 'MCAL',
      version: '1.0',
      parameters: [
        { name: 'canBaudrate', type: 'integer', required: true },
        { name: 'canDevErrorDetect', type: 'boolean', required: false },
      ],
      containers: [],
    };
    const result = await generator.generate(config, schema, { outputDir: './out' });
    expect(result.success).toBe(true);
    const header = result.files[0].content;
    expect(header).toContain('CAN_CANBAUDRATE');
  });

  it('should handle null parameters gracefully', async () => {
    const config: ModuleConfig = {
      module: 'Can',
      version: '1.0',
      parameters: { canBaudrate: null },
      containers: {},
    };
    const result = await generator.generate(config, baseSchema, { outputDir: './out' });
    // null should be treated as missing — required param check triggers error
    expect(result.success).toBe(false);
  });

  it('should handle missing version', async () => {
    const config: ModuleConfig = {
      module: 'Can',
      version: '',
      parameters: { canBaudrate: 500000 },
      containers: {},
    };
    const result = await generator.generate(config, baseSchema, { outputDir: './out' });
    expect(result.success).toBe(true);
    const header = result.files[0].content;
    expect(header).toContain('CAN_MODULE_ID');
  });

  it('should handle long module names', async () => {
    const longName = 'A'.repeat(100);
    const config: ModuleConfig = {
      module: longName,
      version: '1.0',
      parameters: {},
      containers: {},
    };
    const schema: ModuleSchema = {
      name: longName,
      label: longName,
      layer: 'MCAL',
      version: '1.0',
      parameters: [],
      containers: [],
    };
    const result = await generator.generate(config, schema, { outputDir: './out' });
    expect(result.success).toBe(true);
    const header = result.files[0].content;
    expect(header).toContain(`${longName.toUpperCase()}_CFG_H`);
  });
});
