import pluginVue from 'eslint-plugin-vue'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'
import tseslint from 'typescript-eslint'

export default tseslint.config(
    {
        ignores: ['dist/**', 'unpackage/**', 'node_modules/**', 'src/static/**'],
    },

    ...tseslint.configs.recommended,
    ...pluginVue.configs['flat/recommended'],
    skipFormatting,

    {
        files: ['**/*.vue'],
        languageOptions: {
            parserOptions: { parser: tseslint.parser },
        },
    },

    {
        languageOptions: {
            globals: {
                uni: 'readonly',
                wx: 'readonly',
                tt: 'readonly',
                UniApp: 'readonly',
                UniHelper: 'readonly',
                getCurrentPages: 'readonly',
            },
        },
        rules: {
            // 页面文件名与目录同名（dashboard.vue），本身就是多单词目录下的约定命名
            'vue/multi-word-component-names': 'off',
            // SFC 顺序：template -> script -> style
            'vue/block-order': ['error', { order: ['template', 'script', 'style'] }],
            'vue/require-default-prop': 'error',
            'vue/attributes-order': 'error',
            'vue/require-v-for-key': 'error',
            'vue/no-use-v-if-with-v-for': 'error',
            '@typescript-eslint/no-explicit-any': 'error',
            '@typescript-eslint/no-unused-vars': [
                'error',
                { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
            ],
            'no-console': ['warn', { allow: ['warn', 'error'] }],
        },
    },
)
