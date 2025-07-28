import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginVue from "eslint-plugin-vue";


export default [
  {files: ["**/*.{js,tsx,ts,vue}"]},
  {languageOptions: { globals: globals.browser }},
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs["flat/essential"],
  {files: ["**/*.vue"], languageOptions: {
    globals: globals.browser,
    ecmaVersion: 12, // 使用最新的 ECMAScript 语法
    sourceType: 'module', // 代码是 ECMAScript 模块
    parserOptions: {
      parser: tseslint.parser,
      ecmaFeatures: {
        jsx: true
      }
    },
  }},
  {
    ignores: [
      '/node_modules',
      '.github/',
      '/dist',
      '/public'
    ]
  },
  {
    rules: {
      // 'prettier/prettier': [
      //   'error',
      //   { singleQuote: true, semi: false, endOfLine: 'auto' },
      // ],
      "@typescript-eslint/no-unused-vars": "warn",
      'vue/no-multiple-template-root': 'off',
      indent: ['error', 2, { SwitchCase: 1 }],
      // '@typescript-eslint/ban-types': [
      //   'error',
      //   {
      //     extendDefaults: true,
      //     types: {
      //       Function: false,
      //     },
      //   },
      // ],
      '@typescript-eslint/no-explicit-any': ['off'],
      'no-debugger': 'warn',
      'no-console': 'off',
    }
  }
];