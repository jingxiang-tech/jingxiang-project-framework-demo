import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

export default defineConfig({
    plugins: [uni()],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    css: {
        preprocessorOptions: {
            scss: {
                // 全局注入设计 token 与 mixin，组件内无需手动 @import
                additionalData: '@import "@/styles/variable.scss";@import "@/styles/mixins.scss";',
            },
        },
    },
})
