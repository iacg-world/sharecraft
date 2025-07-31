import pluginJs from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default [
  { files: ['**/*.{js,tsx,ts,vue}'] },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  {
    files: ['**/*.vue'],
    languageOptions: {
      globals: globals.browser,
      ecmaVersion: 12, // 使用最新的 ECMAScript 语法
      sourceType: 'module', // 代码是 ECMAScript 模块
      parserOptions: {
        parser: tseslint.parser,
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
  },
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      'public/**',
      '*.min.js',
      '*.min.css',
      'coverage/**',
      '.github/**',
      'docker-compose.yml',
      'Dockerfile',
      '.dockerignore',
      'nginx.conf',
    ],
  },
  {
    rules: {
      // Prettier 集成 (需要先安装 eslint-plugin-prettier)
      // 'prettier/prettier': [
      //   'error',
      //   {
      //     singleQuote: true,
      //     semi: false,
      //     endOfLine: 'auto',
      //     tabWidth: 2,
      //     trailingComma: 'es5',
      //     printWidth: 80,
      //     bracketSpacing: true,
      //     arrowParens: 'avoid',
      //   },
      // ],

      // TypeScript 相关规则
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-empty-function': 'warn',
      '@typescript-eslint/no-inferrable-types': 'warn',

      // Vue 相关规则
      'vue/no-multiple-template-root': 'off',
      'vue/multi-word-component-names': 'warn',
      'vue/component-definition-name-casing': ['error', 'PascalCase'],
      'vue/component-name-in-template-casing': ['error', 'PascalCase'],
      'vue/no-v-html': 'warn',
      'vue/require-default-prop': 'warn',
      'vue/require-prop-types': 'warn',
      'vue/no-unused-components': 'warn',
      'vue/no-unused-vars': 'warn',

      // 通用 JavaScript/TypeScript 规则
      'no-console': 'warn',
      'no-debugger': 'warn',
      'no-alert': 'warn',
      'no-var': 'error',
      'prefer-const': 'error',
      'no-duplicate-imports': 'error',
      'no-unused-expressions': 'warn',
      eqeqeq: ['error', 'always'],
      curly: ['error', 'all'],

      // 代码风格规则
      indent: ['error', 2, { SwitchCase: 1 }],
      quotes: ['error', 'single', { avoidEscape: true }],
      semi: ['error', 'never'],
      'comma-dangle': ['warn', 'always-multiline'],
      'object-curly-spacing': ['error', 'always'],
      'array-bracket-spacing': ['error', 'never'],
      'space-before-function-paren': [
        'error',
        {
          anonymous: 'always',
          named: 'never',
          asyncArrow: 'always',
        },
      ],

      // 安全性规则
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-script-url': 'error',
      'no-inline-comments': 'off',

      // 性能相关
      'no-loop-func': 'warn',
    },
  },
]
