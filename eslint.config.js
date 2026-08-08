import js from '@eslint/js'
import { defineConfig, globalIgnores } from 'eslint/config'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import globals from 'globals'
import tseslint from 'typescript-eslint'

const DEEP_FEATURE_IMPORT = {
  group: ['@/features/*/*'],
  message: '只能从 feature 的 index.ts 引入,不要深入它的内部文件。',
}

export default defineConfig([
  globalIgnores(['dist', 'src/app/routeTree.gen.ts']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            ['^\\u0000'],
            ['^node:', '^@?\\w'],
            ['^@/shared'],
            ['^@/styles'],
            ['^@/layouts'],
            ['^@/features'],
            ['^@/'],
            ['^\\.'],
          ],
        },
      ],
      'simple-import-sort/exports': 'error',
      'no-restricted-imports': ['error', { patterns: [DEEP_FEATURE_IMPORT] }],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/ban-ts-comment': [
        'error',
        { 'ts-expect-error': { descriptionFormat: '^: .+' }, 'ts-ignore': true },
      ],
      'react-hooks/exhaustive-deps': 'error',
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  {
    files: ['src/features/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/features/*', '@/features/*/*'],
              message: 'features 之间禁止互相 import,需要共享就下沉到 shared/。',
            },
            {
              group: ['@/app', '@/app/*', '@/routes', '@/routes/*'],
              message: '依赖方向单向向下,feature 不能反向依赖装配层。',
            },
            {
              group: ['../../*'],
              message: '跨目录引用一律用 @/ 别名,不写多级相对路径。',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/layouts/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            DEEP_FEATURE_IMPORT,
            {
              group: ['@/app', '@/app/*', '@/routes', '@/routes/*'],
              message: '布局不依赖装配层,导航项与用户数据由 props 传入。',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/shared/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/app', '@/app/*', '@/routes', '@/routes/*', '@/features', '@/features/*'],
              message: 'shared/ 不依赖任何上层,也不包含业务概念。',
            },
            {
              group: ['@/layouts', '@/layouts/*'],
              message: 'shared/ 不依赖布局层。',
            },
          ],
        },
      ],
    },
  },
  {
    // shadcn CLI 生成的组件,再次 add 会覆盖,改它等于白改。
    // 放开的两条都是上游写法风格:变体常量与组件同文件导出、宽松相等。
    // 类型相关的严格规则仍然生效,那些是真会出问题的。
    files: ['src/shared/ui/**/*.tsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
      eqeqeq: 'off',
    },
  },
  {
    files: ['src/routes/**/*.{ts,tsx}'],
    rules: {
      'react-refresh/only-export-components': 'off',
      'no-restricted-imports': ['error', { patterns: [DEEP_FEATURE_IMPORT] }],
    },
  },
  {
    files: ['*.{js,ts}', 'vite.config.ts'],
    languageOptions: {
      globals: globals.node,
    },
  },
])
