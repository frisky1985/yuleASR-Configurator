import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'schema/index': 'src/schema/index.ts',
    'types/index': 'src/types/index.ts',
    'validator/index': 'src/validator/index.ts',
    'generator/index': 'src/generator/index.ts',
    'schema-extractor/index': 'src/schema-extractor/index.ts',
    'validators/index': 'src/validators/index.ts',
    'conditions/index': 'src/conditions/index.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
});
