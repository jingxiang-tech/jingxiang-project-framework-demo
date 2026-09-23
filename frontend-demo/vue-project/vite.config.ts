import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteMockServe } from 'vite-plugin-mock'
import path from 'node:path'

export default defineConfig(({ command, mode }) => {
    const env = loadEnv(mode, process.cwd(), '')
    const useMock = env.VITE_USE_MOCK === 'true'
    const apiBase = env.VITE_BASE_API || '/'

    return {
        resolve: {
            alias: {
                '@': path.resolve(import.meta.dirname, 'src'),
            },
        },
        plugins: [
            vue(),
            viteMockServe({
                mockPath: 'src/mocks',
                enable: command === 'serve' && useMock,
                watchFiles: true,
                logger: true,
            }),
        ],
        server: {
            port: 3001,
            proxy:
                useMock || apiBase.startsWith('http')
                    ? undefined
                    : {
                          [apiBase]: {
                              target: 'http://localhost:8080',
                              changeOrigin: true,
                          },
                      },
        },
    }
})
