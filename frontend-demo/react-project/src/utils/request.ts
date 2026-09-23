import axios, { type AxiosRequestConfig } from 'axios'
import { getMessageApi } from '@/utils/message'

export interface ApiResponse<T = unknown> {
    code: number
    message: string
    data: T
}

const instance = axios.create({
    baseURL: import.meta.env.VITE_BASE_API || '/',
    timeout: 15000,
})

instance.interceptors.response.use(
    response => {
        const payload = response.data as ApiResponse
        if (payload && typeof payload.code === 'number' && payload.code !== 0) {
            getMessageApi()?.error(payload.message || '请求失败')
            return Promise.reject(new Error(payload.message || '请求失败'))
        }
        return response
    },
    error => {
        getMessageApi()?.error(error?.message || '网络异常')
        return Promise.reject(error)
    },
)

export async function request<T>(config: AxiosRequestConfig): Promise<T> {
    const response = await instance.request<ApiResponse<T>>(config)
    return response.data.data
}

export default instance
