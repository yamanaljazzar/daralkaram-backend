// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import perfectionist from 'eslint-plugin-perfectionist';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    plugins: {
      perfectionist: perfectionist,
      'unused-imports': unusedImports,
    },
    rules: {
      // General rules
      'no-console': 'off',
      'no-unused-vars': 'off',
      'no-param-reassign': 'off',
      'no-underscore-dangle': 'off',
      'no-promise-executor-return': 'off',
      'prefer-destructuring': [
        'warn',
        {
          object: true,
          array: false,
        },
      ],

      // TypeScript rules
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          args: 'none',
        },
      ],
      '@typescript-eslint/naming-convention': 'off',
      '@typescript-eslint/no-use-before-define': 'off',

      // Unused imports
      'unused-imports/no-unused-imports': 'warn',
      'unused-imports/no-unused-vars': [
        'off',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],

      // Perfectionist rules
      'perfectionist/sort-named-imports': [
        'warn',
        {
          order: 'asc',
          type: 'line-length',
        },
      ],
      'perfectionist/sort-named-exports': [
        'warn',
        {
          order: 'asc',
          type: 'line-length',
        },
      ],
      'perfectionist/sort-exports': [
        'warn',
        {
          order: 'asc',
          type: 'line-length',
        },
      ],
      'perfectionist/sort-imports': [
        'warn',
        {
          order: 'asc',
          type: 'line-length',
          newlinesBetween: 'always',
          groups: [
            ['builtin', 'external'],
            'custom-nestjs',
            'custom-prisma',
            'custom-utils',
            'internal',
            'custom-modules',
            'custom-core',
            'custom-database',
            'custom-config',
            'custom-common',
            ['parent', 'sibling', 'index'],
            'object',
            'unknown',
          ],
          customGroups: {
            value: {
              'custom-nestjs': '@nestjs/.*',
              'custom-prisma': '@prisma/.*',
              'custom-utils': 'src/utils/.*',
              'custom-modules': 'src/modules/.*',
              'custom-core': 'src/core/.*',
              'custom-database': 'src/database/.*',
              'custom-config': 'src/config/.*',
              'custom-common': 'src/common/.*',
            },
          },
          internalPattern: ['src/.*', '@/.*'],
        },
      ],
      'perfectionist/sort-objects': [
        'warn',
        {
          type: 'natural',
          order: 'asc',
        },
      ],
      'perfectionist/sort-array-includes': [
        'warn',
        {
          type: 'natural',
          order: 'asc',
        },
      ],
    },
  },
  // Separate config for test files
  {
    files: ['**/*.spec.ts', '**/*.test.ts', 'test/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      'no-console': 'off',
      'unused-imports/no-unused-imports': 'off',
      'perfectionist/sort-objects': 'off',
      'perfectionist/sort-array-includes': 'off',
    },
  },
);
