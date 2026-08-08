import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'plugins/index': 'src/plugins/index.ts',
    'schema/index': 'src/schema/index.ts',
    'schema/generated/index': 'src/schema/generated/index.ts',
    'schema/load-generated': 'src/schema/load-generated.ts',
    'types/index': 'src/types/index.ts',
    'validator/index': 'src/validator/index.ts',
    'generator/index': 'src/generator/index.ts',
    'schema-extractor/index': 'src/schema-extractor/index.ts',
    'validators/index': 'src/validators/index.ts',
    'adapters/arxml-parser': 'src/adapters/arxml-parser.ts',
    'arxml-import/index': 'src/arxml-import/index.ts',
    'conditions/index': 'src/conditions/index.ts',
  },
  format: ['cjs', 'esm'],
  dts: false,
  splitting: false,
  sourcemap: true,
  clean: true,
});
