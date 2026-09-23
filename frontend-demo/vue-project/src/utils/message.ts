import type { MessageInstance } from 'ant-design-vue/es/message/interface'

let messageApi: MessageInstance | null = null

/** 在 message-bridge 组件内注册，供 request 等非组件代码使用 */
export function setMessageApi(api: MessageInstance) {
    messageApi = api
}

export function getMessageApi() {
    return messageApi
}
