// eslint.config.js
import js from '@eslint/js';
import globals from 'globals';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import importPlugin from 'eslint-plugin-import';

export default [
  // ── Ignores ────────────────────────────────────────────────────────────────
  {
    ignores: ['node_modules', 'dist', 'build'],
  },

  // ── Base config (all files) ────────────────────────────────────────────────
  js.configs.recommended,
  prettierRecommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...Object.fromEntries(Object.entries(globals.browser).map(([k, v]) => [k.trim(), v])),
        ...globals.es2015,
        ...globals.node,
        React: 'readonly',
      },
    },
    rules: {
      'no-console': 'error',
      'prettier/prettier': ['error'],
    },
  },

  // ── React (JS / JSX / TS / TSX) ───────────────────────────────────────────
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      react,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
    },
    settings: {
      'react': { version: 'detect' },
      'formComponents': ['Form'],
      'linkComponents': [
        { name: 'Link', linkAttribute: 'to' },
        { name: 'NavLink', linkAttribute: 'to' },
      ],
      'import/resolver': { typescript: {} },
    },
    rules: {
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...jsxA11y.configs.recommended.rules,
      'react/jsx-sort-props': ['error', { callbacksLast: true, shorthandFirst: true }],
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },

  // ── TypeScript ─────────────────────────────────────────────────────────────
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      '@typescript-eslint': tsPlugin,
      'import': importPlugin,
    },
    languageOptions: {
      parser: tsParser,
      globals: {
        ...globals.node,
        NodeJS: 'readonly',
        JSX: 'readonly',
      },
    },
    settings: {
      'import/internal-regex': '^~/',
      'import/resolver': {
        node: { extensions: ['.ts', '.tsx'] },
        typescript: { alwaysTryTypes: true },
      },
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      ...importPlugin.configs.recommended.rules,
      ...importPlugin.configs.typescript.rules,
      'no-redeclare': 'off',
      '@typescript-eslint/no-redeclare': 'error',
      'import/order': [
        'error',
        {
          'groups': ['builtin', 'external', ['internal', 'sibling', 'parent'], 'index', 'type'],
          'alphabetize': { order: 'asc', caseInsensitive: true },
          'newlines-between': 'always',
        },
      ],
      'import/namespace': 'warn',
    },
  },

  // ── Node environment for the ESLint config file itself ─────────────────────
  {
    files: ['eslint.config.{js,mjs,cjs}'],
    languageOptions: {
      globals: globals.node,
    },
  },
];
