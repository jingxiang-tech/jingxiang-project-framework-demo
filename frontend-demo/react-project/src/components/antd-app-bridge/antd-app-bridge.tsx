import { useEffect, type ReactNode } from 'react'
import { App } from 'antd'
import { setMessageApi } from '@/utils/message'

/** 把 App.useApp() 的 message 注入给 request 等模块 */
export default function AntdAppBridge({ children }: { children: ReactNode }) {
    const { message } = App.useApp()

    useEffect(() => {
        setMessageApi(message)
    }, [message])

    return children
}
