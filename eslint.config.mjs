import js from '@eslint/js';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier/flat';
import importPlugin from 'eslint-plugin-import';
import unicorn from 'eslint-plugin-unicorn';
import { defineConfig, globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';

const eslintConfig = defineConfig(
  js.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
  },

  // Disable type-checked rules for JavaScript files
  // Warning: This configuration is not considered "stable" under Semantic Versioning (semver). Its enabled rules and/or their options may change outside of major version updates.
  // https://typescript-eslint.io/troubleshooting/typed-linting#how-can-i-disable-type-aware-linting-for-a-subset-of-files
  {
    files: ['**/*.js', '**/*.mjs', '**/*.cjs'],
    ...tseslint.configs.disableTypeChecked,
  },

  ...nextVitals,
  ...nextTs,
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      'no-implicit-coercion': 'error',
      'prefer-template': 'error',
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        {
          allowNumber: true,
          allowBoolean: true,
          allowAny: false,
          allowNever: false,
          allowNullish: false,
          allowRegExp: false,
        },
      ],
      '@typescript-eslint/strict-boolean-expressions': [
        'error',
        {
          allowString: false,
          allowNumber: false,
          allowNullableObject: false,
        },
      ],
      '@typescript-eslint/restrict-plus-operands': [
        'error',
        {
          allowAny: false,
          allowBoolean: false,
          allowNullish: false,
          allowNumberAndString: false,
          allowRegExp: false,
        },
      ],
      '@typescript-eslint/switch-exhaustiveness-check': [
        'error',
        {
          allowDefaultCaseForExhaustiveSwitch: false,
          requireDefaultForNonUnion: false,
        },
      ],
      '@typescript-eslint/method-signature-style': 'error',
      '@typescript-eslint/require-array-sort-compare': [
        'error',
        {
          ignoreStringArrays: true,
        },
      ],
    },
  },
  {
    plugins: {
      unicorn,
      import: importPlugin,
    },
    rules: {
      'unicorn/prefer-switch': 'error',
      'import/no-cycle': 'error',
    },
  },

  // Enforce the DAL/DTO boundary:
  // - app/ and components/ must go through lib/dto/, never the DAL resource
  //   modules (lib/dal/session is intentionally allowed for session reads).
  // - render-tree code must call verifySession() / getOptionalSession()
  //   instead of importing auth() directly.
  {
    files: ['src/app/**/*.{ts,tsx}', 'src/components/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@/lib/auth',
              importNames: ['auth'],
              message:
                'Use verifySession() / getOptionalSession() from @/lib/dal/session instead of calling auth() directly.',
            },
          ],
          patterns: [
            {
              group: [
                '@/lib/dal/client',
                '@/lib/dal/wordbooks',
                '@/lib/dal/words',
                '@/lib/dal/meanings',
                '@/lib/dal/examples',
                '@/lib/dal/settings',
              ],
              message:
                'Import from @/lib/dto instead. The DAL is reserved for lib/dto and lib/actions.',
            },
          ],
        },
      ],
    },
  },
  prettier,

  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    // Playwright E2E tests
    'e2e/**',
  ])
);

export default eslintConfig;
