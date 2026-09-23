import { defineConfig, loadEnv } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
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
            react(),
            babel({ presets: [reactCompilerPreset()] }),
            viteMockServe({
                mockPath: 'src/mocks',
                enable: command === 'serve' && useMock,
                watchFiles: true,
                logger: true,
            }),
        ],
        server: {
            port: 3000,
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
