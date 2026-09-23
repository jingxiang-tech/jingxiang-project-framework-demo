import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'
import eslintConfigPrettier from 'eslint-config-prettier'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
    globalIgnores(['dist']),
    {
        files: ['**/*.{ts,vue}'],
        extends: [
            js.configs.recommended,
            tseslint.configs.recommended,
            pluginVue.configs['flat/recommended'],
        ],
        languageOptions: {
            globals: globals.browser,
            parserOptions: {
                parser: tseslint.parser,
                extraFileExtensions: ['.vue'],
            },
        },
        rules: {
            // 交给 TypeScript / vue-tsc 处理未定义标识符（含 api/types 下的全局 namespace）
            'no-undef': 'off',
            'no-unused-vars': 'off',
            'vue/no-unused-vars': ['error', { ignorePattern: '^_' }],
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    vars: 'all',
                    args: 'after-used',
                    ignoreRestSiblings: true,
                    caughtErrors: 'none',
                },
            ],
        },
    },
    {
        // 页面 / 布局组件名与目录名一致（kebab-case），单词目录名不强制多词
        files: ['src/pages/**/*.vue', 'src/layouts/**/*.vue', '**/App.vue'],
        rules: {
            'vue/multi-word-component-names': 'off',
        },
    },
    // 必须放在最后：关闭与 Prettier 冲突的 ESLint 格式类规则
    eslintConfigPrettier,
])
