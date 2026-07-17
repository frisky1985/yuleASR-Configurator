/**
 * AUTOSAR C Code Generator (Web Layer)
 *
 * Bridge between UI ConfigModule data and the core EcucCodeGenerator.
 * Generates complete AUTOSAR C code: .h + .c + _PBcfg.c + _Lcfg.c
 *
 * Uses @yuletech/core's schema-driven EcucCodeGenerator + ui-adapter.
 * Replaces the old per-module hardcoded generator functions.
 */

import { EcucCodeGenerator } from '@yuletech/core/generator';

import { uiModuleToGenerator, uiModulesToGenerator } from './ui-adapter';

import type { ConfigModule } from '@/types/config';

export interface GeneratedFile {
  filename: string;
  content: string;
  language: 'c' | 'h';
}

const generator = new EcucCodeGenerator();

/**
 * Generate all files for all enabled modules.
 * Returns an array of { filename, content, language } objects.
 */
export async function generateAllHeaders(modules: ConfigModule[]): Promise<GeneratedFile[]> {
  const files: GeneratedFile[] = [];
  const results = uiModulesToGenerator(modules);

  for (const { config, schema } of results) {
    const result = await generator.generate(config, schema, {
      outputDir: '',
      generateComments: true,
    });
    if (!result.success) continue;

    for (const f of result.files) {
      const name = f.path.replace(/^\//, '');
      files.push({ filename: name, content: f.content, language: f.language as 'c' | 'h' });
    }
  }

  return files;
}

/**
 * Generate header file (first generated file) for a single module.
 * Returns null if the module can't be generated.
 */
export async function generateHeader(module: ConfigModule): Promise<GeneratedFile | null> {
  const adapterResult = uiModuleToGenerator(module);
  if (!adapterResult) return null;

  const result = await generator.generate(adapterResult.config, adapterResult.schema, {
    outputDir: '',
    generateComments: true,
  });
  if (!result.success || result.files.length === 0) return null;

  const first = result.files[0];
  return {
    filename: first.path.replace(/^\//, ''),
    content: first.content,
    language: first.language as 'c' | 'h',
  };
}
