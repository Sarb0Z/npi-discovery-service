import { defineConfig, globalIgnores } from 'eslint/config'
import js from '@eslint/js'
import eslintConfigPrettier from 'eslint-config-prettier'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import globals from 'globals'
import tseslint from 'typescript-eslint'

const typedConfigFiles = ['**/*.{ts,tsx,mts}']

const eslintConfig = defineConfig([
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked.map((config) => ({
    ...config,
    files: typedConfigFiles,
  })),
  ...tseslint.configs.stylisticTypeChecked.map((config) => ({
    ...config,
    files: typedConfigFiles,
  })),
  ...nextVitals,
  ...nextTs,
  eslintConfigPrettier,
  {
    files: typedConfigFiles,
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      curly: ['error', 'all'],
      eqeqeq: ['error', 'always'],
      'no-var': 'error',
      'prefer-const': 'error',
    },
  },
  globalIgnores([
    '.next/**',
    'coverage/**',
    'out/**',
    'build/**',
    'eslint.config.mjs',
    'next-env.d.ts',
  ]),
])

export default eslintConfig
