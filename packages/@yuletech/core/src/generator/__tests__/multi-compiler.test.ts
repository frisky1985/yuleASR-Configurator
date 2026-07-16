/**
 * @yuletech/core - Multi-Compiler Support Tests
 *
 * Tests that verify the compiler-specific code generation:
 * - GCC (default)
 * - IAR Embedded Workbench
 * - Tasking (Tricore)
 * - GHS (Green Hills)
 */

import { describe, it, expect } from 'vitest';
import type { ModuleConfig, ModuleSchema } from '../../types';
import { EcucCodeGenerator } from '../ecuc-generator';
import {
  getCompilerAbstraction,
  CompilerAbstraction,
  GccCompilerAbstraction,
  IarCompilerAbstraction,
  TaskingCompilerAbstraction,
  GhsCompilerAbstraction,
} from '../autosar-format';

// =========================================================================
// Test data
// =========================================================================

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

const baseConfig: ModuleConfig = {
  module: 'Can',
  version: '1.0.0',
  parameters: { canBaudrate: 500000, canDevErrorDetect: false },
  containers: {},
};

// =========================================================================
// 1. CompilerAbstraction Factory
// =========================================================================

describe('getCompilerAbstraction', () => {
  it('should return GccCompilerAbstraction for undefined compiler', () => {
    const abst = getCompilerAbstraction(undefined);
    expect(abst).toBeInstanceOf(GccCompilerAbstraction);
    expect(abst.compiler).toBe('gcc');
  });

  it('should return GccCompilerAbstraction for "gcc"', () => {
    const abst = getCompilerAbstraction('gcc');
    expect(abst).toBeInstanceOf(GccCompilerAbstraction);
    expect(abst.compiler).toBe('gcc');
  });

  it('should return IarCompilerAbstraction for "iar"', () => {
    const abst = getCompilerAbstraction('iar');
    expect(abst).toBeInstanceOf(IarCompilerAbstraction);
    expect(abst.compiler).toBe('iar');
  });

  it('should return TaskingCompilerAbstraction for "tasking"', () => {
    const abst = getCompilerAbstraction('tasking');
    expect(abst).toBeInstanceOf(TaskingCompilerAbstraction);
    expect(abst.compiler).toBe('tasking');
  });

  it('should return GhsCompilerAbstraction for "ghs"', () => {
    const abst = getCompilerAbstraction('ghs');
    expect(abst).toBeInstanceOf(GhsCompilerAbstraction);
    expect(abst.compiler).toBe('ghs');
  });
});

// =========================================================================
// 2. IRQ Function Syntax per Compiler
// =========================================================================

describe('Interrupt function syntax', () => {
  it('GCC: should use __attribute__((interrupt()))', () => {
    const gcc = new GccCompilerAbstraction();
    expect(gcc.interruptAttribute()).toBe('__attribute__((interrupt()))');
    expect(gcc.interruptAttribute(42)).toBe('__attribute__((interrupt()))');
  });

  it('IAR: should use __interrupt keyword', () => {
    const iar = new IarCompilerAbstraction();
    expect(iar.interruptAttribute()).toBe('__interrupt');
    expect(iar.interruptAttribute(42)).toBe('__interrupt __irq');
  });

  it('Tasking: should use ISR() macro', () => {
    const tasking = new TaskingCompilerAbstraction();
    expect(tasking.interruptAttribute(0)).toBe('ISR(0)');
    expect(tasking.interruptAttribute(42)).toBe('ISR(42)');
    expect(tasking.interruptAttribute()).toBe('ISR(0)');
  });

  it('GHS: should use __interrupt keyword', () => {
    const ghs = new GhsCompilerAbstraction();
    expect(ghs.interruptAttribute()).toBe('__interrupt');
    expect(ghs.interruptAttribute(42)).toBe('__interrupt');
  });

  it('should produce valid IRQ function declarations for all compilers', () => {
    const cases: Array<{ name: string; abst: CompilerAbstraction; expected: string }> = [
      { name: 'GCC', abst: new GccCompilerAbstraction(), expected: '__attribute__((interrupt())) void Can_IRQHandler(void)' },
      { name: 'IAR', abst: new IarCompilerAbstraction(), expected: '__interrupt void Can_IRQHandler(void)' },
      { name: 'Tasking', abst: new TaskingCompilerAbstraction(), expected: 'ISR(0) void Can_IRQHandler(void)' },
      { name: 'GHS', abst: new GhsCompilerAbstraction(), expected: '__interrupt void Can_IRQHandler(void)' },
    ];

    for (const { name, abst, expected } of cases) {
      const attr = abst.interruptAttribute();
      const decl = `${attr} void Can_IRQHandler(void)`;
      expect(decl).toBe(expected);
    }
  });
});

// =========================================================================
// 3. Compiler-specific Pragma / Section Styles
// =========================================================================

describe('Pragma / Section Styles', () => {
  describe('GCC pragma style', () => {
    const gcc = new GccCompilerAbstraction();

    it('should use AUTOSAR standard MemMap.h pattern', () => {
      const result = gcc.wrapMemMapSection('Can', 'CONST_UNSPECIFIED', 'const int x = 1;\n');
      expect(result).toContain('#define CAN_START_SEC_CONST_UNSPECIFIED');
      expect(result).toContain('#include "MemMap.h"');
      expect(result).toContain('#define CAN_STOP_SEC_CONST_UNSPECIFIED');
      expect(result).toContain('const int x = 1;');
    });

    it('should not emit non-standard #pragma lines', () => {
      const result = gcc.wrapMemMapSection('Can', 'CODE', 'void func(void) {}\n');
      expect(result).not.toContain('#pragma');
    });
  });

  describe('IAR pragma style', () => {
    const iar = new IarCompilerAbstraction();

    it('should use #pragma section for section placement', () => {
      const result = iar.wrapMemMapSection('Can', 'CONST_UNSPECIFIED', 'const int x = 1;\n');
      expect(result).toContain('#pragma section = "CONST_UNSPECIFIED"');
      expect(result).toContain('#pragma location = "CONST_UNSPECIFIED"');
      expect(result).toContain('/* IAR: MemMap section Can_START_SEC_CONST_UNSPECIFIED */');
    });

    it('should use __IO / __I / __O register qualifiers', () => {
      expect(iar.registerQualifier('in')).toBe('__I');
      expect(iar.registerQualifier('out')).toBe('__O');
      expect(iar.registerQualifier('inout')).toBe('__IO');
    });

    it('should use __no_init for uninitialized RAM', () => {
      expect(iar.noInitAttribute()).toBe('__no_init');
    });

    it('should use __root for root/retain', () => {
      expect(iar.rootAttribute()).toBe('__root');
    });

    it('should use @ for address placement', () => {
      const attr = iar.addressAttribute(0x40001000);
      expect(attr).toBe('@ 0x40001000');
    });

    it('should use @ "section" for section placement', () => {
      expect(iar.sectionAttribute('.text')).toBe('@ ".text"');
    });
  });

  describe('Tasking pragma style', () => {
    const tasking = new TaskingCompilerAbstraction();

    it('should use #pragma section farrom for ROM sections', () => {
      const result = tasking.wrapMemMapSection('Can', 'CONST_UNSPECIFIED', 'const int x = 1;\n');
      expect(result).toContain('#pragma section farrom "CAN_CONST_UNSPECIFIED"');
      expect(result).toContain('#pragma section farrom restore');
      expect(result).toContain('/* Tasking: MemMap section Can_START_SEC_CONST_UNSPECIFIED */');
    });

    it('should use __at() for address placement', () => {
      expect(tasking.addressAttribute(0x60000000)).toBe('__at(0x60000000)');
    });

    it('should use __near for no-init', () => {
      expect(tasking.noInitAttribute()).toBe('__near');
    });

    it('should return appropriate __far/__near for sections', () => {
      expect(tasking.sectionAttribute('.text')).toBe('__far');
      expect(tasking.sectionAttribute('CODE')).toBe('__far');
      expect(tasking.sectionAttribute('.bss')).toBe('__near');
      expect(tasking.sectionAttribute('NOINIT')).toBe('__near');
    });
  });

  describe('GHS pragma style', () => {
    const ghs = new GhsCompilerAbstraction();

    it('should use #pragma ghs section for section placement', () => {
      const result = ghs.wrapMemMapSection('Can', 'CONST_UNSPECIFIED', 'const int x = 1;\n');
      expect(result).toContain('#pragma ghs section text="CAN_CONST_UNSPECIFIED"');
      expect(result).toContain('#pragma ghs section text=default');
      expect(result).toContain('/* GHS: MemMap section Can_START_SEC_CONST_UNSPECIFIED */');
    });

    it('should use __attribute__((section)) for section attribute', () => {
      expect(ghs.sectionAttribute('.text')).toBe('__attribute__((section(".text")))');
    });

    it('should use __attribute__((at())) for address placement', () => {
      expect(ghs.addressAttribute(0x40000000)).toBe('__attribute__((at(0x40000000)))');
    });

    it('should use __attribute__((used)) for root/retain', () => {
      expect(ghs.rootAttribute()).toBe('__attribute__((used))');
    });
  });
});

// =========================================================================
// 4. MemMap.h Section Wrapping — Compiler Conditional Compilation
// =========================================================================

describe('MemMap.h section wrapping per compiler', () => {
  const body = 'const Can_ConfigSetType Can_ConfigSet = { .moduleId = 80 };';

  it('GCC: uses #define MODULE_START_SEC_XXX / #include "MemMap.h" pattern', () => {
    const result = new GccCompilerAbstraction().wrapMemMapSection('Can', 'CONST_UNSPECIFIED', body);
    expect(result).toBe(
      '#define CAN_START_SEC_CONST_UNSPECIFIED\n' +
      '#include "MemMap.h"\n' +
      'const Can_ConfigSetType Can_ConfigSet = { .moduleId = 80 };\n' +
      '#define CAN_STOP_SEC_CONST_UNSPECIFIED\n' +
      '#include "MemMap.h"\n'
    );
  });

  it('IAR: uses #pragma section/location markers', () => {
    const result = new IarCompilerAbstraction().wrapMemMapSection('Can', 'CONST_UNSPECIFIED', body);
    expect(result).toContain('#pragma section = "CONST_UNSPECIFIED"');
    expect(result).toContain('#pragma location = "CONST_UNSPECIFIED"');
    expect(result).toContain(body);
  });

  it('Tasking: uses #pragma section farrom markers', () => {
    const result = new TaskingCompilerAbstraction().wrapMemMapSection('Can', 'CONST_UNSPECIFIED', body);
    expect(result).toContain('#pragma section farrom "CAN_CONST_UNSPECIFIED"');
    expect(result).toContain('#pragma section farrom restore');
    expect(result).toContain(body);
  });

  it('GHS: uses #pragma ghs section markers', () => {
    const result = new GhsCompilerAbstraction().wrapMemMapSection('Can', 'CONST_UNSPECIFIED', body);
    expect(result).toContain('#pragma ghs section text="CAN_CONST_UNSPECIFIED"');
    expect(result).toContain('#pragma ghs section text=default');
    expect(result).toContain(body);
  });
});

// =========================================================================
// 5. EcucCodeGenerator with Compiler Options
// =========================================================================

describe('EcucCodeGenerator - Compiler option integration', () => {
  const generator = new EcucCodeGenerator();

  it('should default to GCC MemMap pattern when no compiler specified', async () => {
    const result = await generator.generate(baseConfig, baseSchema, { outputDir: './out' });
    expect(result.success).toBe(true);
    const sourceContent = result.files[1].content;
    // GCC uses the AUTOSAR standard #define/#include pattern
    expect(sourceContent).toContain('#define CAN_START_SEC_CONST_UNSPECIFIED');
    expect(sourceContent).toContain('#include "MemMap.h"');
  });

  it('should produce GCC-compatible output with compiler: "gcc"', async () => {
    const result = await generator.generate(baseConfig, baseSchema, { outputDir: './out', compiler: 'gcc' });
    expect(result.success).toBe(true);
    const sourceContent = result.files[1].content;
    expect(sourceContent).toContain('#include "MemMap.h"');
    expect(sourceContent).toContain('#define CAN_START_SEC_CONST_UNSPECIFIED');
  });

  it('should produce IAR-compatible MemMap section markers with compiler: "iar"', async () => {
    const result = await generator.generate(baseConfig, baseSchema, { outputDir: './out', compiler: 'iar' });
    expect(result.success).toBe(true);
    const sourceContent = result.files[1].content;
    expect(sourceContent).toContain('#pragma section = "CONST_UNSPECIFIED"');
    expect(sourceContent).toContain('#pragma location = "CONST_UNSPECIFIED"');
    // IAR should NOT emit GCC-style #define/#include MemMap.h markers
    expect(sourceContent).not.toContain('#define CAN_START_SEC_CONST_UNSPECIFIED');
  });

  it('should produce Tasking-compatible MemMap section markers with compiler: "tasking"', async () => {
    const result = await generator.generate(baseConfig, baseSchema, { outputDir: './out', compiler: 'tasking' });
    expect(result.success).toBe(true);
    const sourceContent = result.files[1].content;
    expect(sourceContent).toContain('#pragma section farrom "CAN_CONST_UNSPECIFIED"');
    expect(sourceContent).toContain('#pragma section farrom restore');
  });

  it('should produce GHS-compatible MemMap section markers with compiler: "ghs"', async () => {
    const result = await generator.generate(baseConfig, baseSchema, { outputDir: './out', compiler: 'ghs' });
    expect(result.success).toBe(true);
    const sourceContent = result.files[1].content;
    expect(sourceContent).toContain('#pragma ghs section text="CAN_CONST_UNSPECIFIED"');
    expect(sourceContent).toContain('#pragma ghs section text=default');
  });

  it('should not break existing GCC output when compiler is specified', async () => {
    // Verify GCC output matches the original pattern
    const resultGcc = await generator.generate(baseConfig, baseSchema, { outputDir: './out', compiler: 'gcc' });
    const resultDefault = await generator.generate(baseConfig, baseSchema, { outputDir: './out' });
    expect(resultGcc.files.length).toBe(4);
    expect(resultDefault.files.length).toBe(4);
    // Both should produce output files with the same structure
    expect(resultGcc.files[0].path).toBe(resultDefault.files[0].path);
    expect(resultGcc.files[1].path).toBe(resultDefault.files[1].path);
  });

  it('should still output all files with any compiler option', async () => {
    for (const compiler of ['gcc', 'iar', 'tasking', 'ghs'] as const) {
      const result = await generator.generate(baseConfig, baseSchema, { outputDir: './out', compiler });
      expect(result.success).toBe(true);
      expect(result.files.length).toBe(4);
      expect(result.files[0].language).toBe('h');
      expect(result.files[1].language).toBe('c');
    }
  });
});

// =========================================================================
// 6. Extended: Section Start/Stop Pragmas
// =========================================================================

describe('Section start/stop pragmas', () => {
  it('GCC: uses MemMap.h #define pattern', () => {
    const gcc = new GccCompilerAbstraction();
    expect(gcc.sectionStartPragma('Can', 'CODE')).toContain('#define CAN_START_SEC_CODE\n#include "MemMap.h"');
    expect(gcc.sectionStopPragma('Can', 'CODE')).toContain('#define CAN_STOP_SEC_CODE\n#include "MemMap.h"');
  });

  it('IAR: uses diagnostic #pragma', () => {
    const iar = new IarCompilerAbstraction();
    expect(iar.sectionStartPragma('Can', 'CODE')).toContain('#pragma diag_suppress=');
    expect(iar.sectionStopPragma('Can', 'CODE')).toContain('#pragma diag_default=');
  });

  it('Tasking: uses #pragma section farrom', () => {
    const tasking = new TaskingCompilerAbstraction();
    expect(tasking.sectionStartPragma('Can', 'CODE')).toBe('#pragma section farrom "Can_CODE"');
    expect(tasking.sectionStopPragma('Can', 'CODE')).toBe('#pragma section farrom restore');
  });

  it('GHS: uses #pragma ghs section', () => {
    const ghs = new GhsCompilerAbstraction();
    expect(ghs.sectionStartPragma('Can', 'CODE')).toBe('#pragma ghs section text="Can_CODE"');
    expect(ghs.sectionStopPragma('Can', 'CODE')).toBe('#pragma ghs section text=default');
  });
});

// =========================================================================
// 7. Register Qualifier Comparison
// =========================================================================

describe('Register qualifier comparison', () => {
  const cases: Array<{ name: string; abst: CompilerAbstraction; input: 'in' | 'out' | 'inout'; expected: string }> = [
    { name: 'GCC', abst: new GccCompilerAbstraction(), input: 'in', expected: 'const volatile' },
    { name: 'GCC', abst: new GccCompilerAbstraction(), input: 'out', expected: 'volatile' },
    { name: 'GCC', abst: new GccCompilerAbstraction(), input: 'inout', expected: 'volatile' },
    { name: 'IAR', abst: new IarCompilerAbstraction(), input: 'in', expected: '__I' },
    { name: 'IAR', abst: new IarCompilerAbstraction(), input: 'out', expected: '__O' },
    { name: 'IAR', abst: new IarCompilerAbstraction(), input: 'inout', expected: '__IO' },
    { name: 'Tasking', abst: new TaskingCompilerAbstraction(), input: 'in', expected: '__far const' },
    { name: 'Tasking', abst: new TaskingCompilerAbstraction(), input: 'out', expected: '__far' },
    { name: 'Tasking', abst: new TaskingCompilerAbstraction(), input: 'inout', expected: '__far' },
    { name: 'GHS', abst: new GhsCompilerAbstraction(), input: 'in', expected: 'const volatile' },
    { name: 'GHS', abst: new GhsCompilerAbstraction(), input: 'out', expected: 'volatile' },
    { name: 'GHS', abst: new GhsCompilerAbstraction(), input: 'inout', expected: 'volatile' },
  ];

  for (const { name, abst, input, expected } of cases) {
    it(`${name} registerQualifier('${input}') should be '${expected}'`, () => {
      expect(abst.registerQualifier(input)).toBe(expected);
    });
  }
});
