import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConfigProvider, App as AntdApp } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import AntdAppBridge from '@/components/antd-app-bridge/antd-app-bridge'
import { router } from '@/router'
import { appTheme } from '@/theme'
import './index.scss'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
        },
    },
})

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <ConfigProvider locale={zhCN} theme={appTheme}>
                <AntdApp>
                    <AntdAppBridge>
                        <RouterProvider router={router} />
                    </AntdAppBridge>
                </AntdApp>
            </ConfigProvider>
        </QueryClientProvider>
    </StrictMode>,
)
