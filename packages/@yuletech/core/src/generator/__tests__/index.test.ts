import { describe, it, expect } from 'vitest';

import type { GeneratorOptions, GeneratedFile, GenerationResult } from '../index';

describe('Generator Interfaces', () => {
  it('should accept valid GeneratorOptions', () => {
    const options: GeneratorOptions = {
      outputDir: './output',
      targetPlatform: 'S32K312',
      compiler: 'gcc',
      generateComments: true,
    };
    expect(options.outputDir).toBe('./output');
  });

  it('should accept minimal GeneratorOptions', () => {
    const options: GeneratorOptions = { outputDir: './out' };
    expect(options.outputDir).toBe('./out');
  });

  it('should validate GeneratedFile structure', () => {
    const file: GeneratedFile = {
      path: 'Ecuc_Can.h',
      content: '#ifndef ECUC_CAN_H',
      language: 'h',
    };
    expect(['c', 'h', 'xml', 'json', 'other']).toContain(file.language);
  });

  it('should validate GeneratedFile with each language type', () => {
    const files: GeneratedFile[] = [
      { path: 'a.c', content: '', language: 'c' },
      { path: 'a.h', content: '', language: 'h' },
      { path: 'a.xml', content: '', language: 'xml' },
      { path: 'a.json', content: '', language: 'json' },
      { path: 'a.xyz', content: '', language: 'other' },
    ];
    for (const f of files) {
      expect(['c', 'h', 'xml', 'json', 'other']).toContain(f.language);
    }
  });

  it('should validate GenerationResult with errors', () => {
    const result: GenerationResult = {
      success: false,
      files: [],
      errors: ['Module name is required'],
    };
    expect(result.success).toBe(false);
    expect(result.errors).toHaveLength(1);
  });

  it('should validate GenerationResult with warnings', () => {
    const result: GenerationResult = {
      success: true,
      files: [{ path: 'out.h', content: '...', language: 'h' }],
      warnings: ['Config missing version info'],
    };
    expect(result.success).toBe(true);
    expect(result.warnings).toHaveLength(1);
  });

  it('should allow empty errors/warnings in GenerationResult', () => {
    const result: GenerationResult = {
      success: true,
      files: [],
    };
    expect(result.success).toBe(true);
    expect(result.files).toEqual([]);
  });
});
