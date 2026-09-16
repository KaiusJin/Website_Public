import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default [
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
  {
    files: ['src/**/*.{js,jsx}'],
    plugins: {
      ...reactHooks.configs.flat.recommended.plugins,
      ...reactRefresh.configs.vite.plugins,
    },
    languageOptions: {
      ecmaVersion: 'latest',
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      ...reactRefresh.configs.vite.rules,
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^[A-Z_]' }],
    },
  },
  {
    files: ['src/main.jsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
  {
    files: ['scripts/**/*.mjs', 'tests/**/*.mjs', 'vite.config.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: globals.node,
      sourceType: 'module',
    },
    rules: js.configs.recommended.rules,
  },
];
