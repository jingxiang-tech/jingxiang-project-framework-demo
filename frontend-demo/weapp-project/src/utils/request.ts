import { STORAGE_KEYS, clearAuth, getStorage } from './storage'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

export interface RequestOptions {
    url: string
    method?: HttpMethod
    // 用 object 而非 Record<string, unknown>，否则带具名字段的请求参数接口无法赋值
    data?: object
    header?: Record<string, string>
    // 静默请求（列表刷新、轮询）传 false
    showLoading?: boolean
    loadingText?: string
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'
const REQUEST_TIMEOUT = 15000
const CODE_UNAUTHORIZED = 401

// 并发请求共用一个 loading，避免闪烁
let loadingCount = 0

function openLoading(text: string) {
    if (loadingCount === 0) {
        uni.showLoading({ title: text, mask: true })
    }
    loadingCount++
}

function closeLoading() {
    loadingCount = Math.max(0, loadingCount - 1)
    if (loadingCount === 0) {
        uni.hideLoading()
    }
}

function toast(title: string) {
    uni.showToast({ title, icon: 'none' })
}

// 401：清除本地登录态后跳登录页，页面栈用 redirectTo 替换避免返回到需鉴权页面
function handleUnauthorized() {
    clearAuth()
    uni.redirectTo({ url: '/pages-authorize/login/login' })
}

export function request<T>(options: RequestOptions): Promise<T> {
    // USE_MOCK 在构建时被替换为字面量，生产构建会连同 mock 代码一起摇掉
    return USE_MOCK ? resolveMock<T>(options) : resolveRemote<T>(options)
}

async function resolveMock<T>(options: RequestOptions): Promise<T> {
    const { matchMock } = await import('@/mock')
    return matchMock<T>(options)
}

function resolveRemote<T>(options: RequestOptions): Promise<T> {
    const {
        url,
        method = 'GET',
        data,
        header = {},
        showLoading = true,
        loadingText = '加载中',
    } = options

    const token = getStorage<string>(STORAGE_KEYS.TOKEN)
    if (token) {
        header.Authorization = `Bearer ${token}`
    }

    if (showLoading) openLoading(loadingText)

    return new Promise<T>((resolve, reject) => {
        uni.request({
            url: `${BASE_URL}${url}`,
            method,
            data,
            timeout: REQUEST_TIMEOUT,
            header: { 'Content-Type': 'application/json', ...header },
            success: res => {
                const body = res.data as { code?: number } | null

                if (res.statusCode === CODE_UNAUTHORIZED || body?.code === CODE_UNAUTHORIZED) {
                    toast('登录已过期，请重新登录')
                    handleUnauthorized()
                    reject(new Error('unauthorized'))
                    return
                }

                if (res.statusCode < 200 || res.statusCode >= 300) {
                    toast(`请求失败（${res.statusCode}）`)
                    reject(new Error(`http ${res.statusCode}`))
                    return
                }

                // HTTP 成功即 resolve，业务成败由调用方判断 res.success
                resolve(res.data as T)
            },
            fail: err => {
                toast('网络异常，请稍后重试')
                reject(err)
            },
            complete: () => {
                if (showLoading) closeLoading()
            },
        })
    })
}

// 上传文件不走 request：uni.uploadFile 需要手动注入 header
export function uploadFile<T>(
    filePath: string,
    name = 'file',
    formData: Record<string, unknown> = {},
) {
    const token = getStorage<string>(STORAGE_KEYS.TOKEN)

    return new Promise<T>((resolve, reject) => {
        uni.uploadFile({
            url: `${BASE_URL}/qiongqi/xd/frontend/upload`,
            filePath,
            name,
            formData,
            header: token ? { Authorization: `Bearer ${token}` } : {},
            success: res => {
                try {
                    resolve(JSON.parse(res.data) as T)
                } catch {
                    reject(new Error('上传结果解析失败'))
                }
            },
            fail: err => {
                toast('上传失败，请重试')
                reject(err)
            },
        })
    })
}
