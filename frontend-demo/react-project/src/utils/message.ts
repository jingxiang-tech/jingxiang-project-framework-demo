import type { MessageInstance } from 'antd/es/message/interface'

let messageApi: MessageInstance | null = null

/** 在 App.useApp() 内注册，供 axios 等非组件代码使用 */
export function setMessageApi(api: MessageInstance) {
    messageApi = api
}

export function getMessageApi() {
    return messageApi
}
