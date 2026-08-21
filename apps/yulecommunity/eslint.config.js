import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // Fix 13: 禁止空接口/空对象类型（类型形同虚设的护栏；v8 起用 no-empty-object-type 替代已废弃的 no-empty-interface）
      '@typescript-eslint/no-empty-object-type': [
        'error',
        { allowInterfaces: 'never', allowObjectTypes: 'never' },
      ],
    },
  },
]);
