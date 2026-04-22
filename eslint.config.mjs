import nextPlugin from '@next/eslint-plugin-next'
import reactPlugin from 'eslint-plugin-react'
import hooksPlugin from 'eslint-plugin-react-hooks'
import tsParser from '@typescript-eslint/parser'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import globals from 'globals'

const eslintConfig = [
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
    ],
  },
  {
    files: ['**/*.{js,jsx,mjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      '@next/next': nextPlugin,
      'react': reactPlugin,
      'react-hooks': hooksPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
      ...reactPlugin.configs.recommended.rules,
      ...hooksPlugin.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off', // Not needed in Next.js
      'react/prop-types': 'off', // We use TypeScript for type checking
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        project: './tsconfig.json',
      },
    },
    plugins: {
      '@next/next': nextPlugin,
      '@typescript-eslint': tsPlugin,
      'react': reactPlugin,
      'react-hooks': hooksPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
      ...tsPlugin.configs.recommended.rules,
      ...reactPlugin.configs.recommended.rules,
      ...hooksPlugin.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      // Heading id / URL fragment slugs must go through `slugify` in src/app/utils/slugify.ts
      // so ContentEntry, rehype-danish-slug, and extractTableOfContents all agree.
      // See .cursor/rules/slugs-and-heading-ids.mdc for rationale.
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'github-slugger',
              message:
                "Use `slugify` from '@/app/utils/slugify' instead. github-slugger produces different slugs for æ/ø/å/ü than the rest of the app and breaks TOC anchor scrolling.",
            },
            {
              name: 'rehype-slug',
              message:
                "Use `rehypeDanishSlug` from '@/lib/mdx/rehype-danish-slug' instead. rehype-slug uses github-slugger internally, which produces inconsistent slugs for Danish characters.",
            },
          ],
        },
      ],
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
]

export default eslintConfig

