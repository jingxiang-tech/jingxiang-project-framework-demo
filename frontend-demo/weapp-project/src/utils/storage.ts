// Storage 统一管理：key 集中在 STORAGE_KEYS，禁止散落字符串字面量。
// 小程序本地存储上限 10MB，超出会静默失败，所有操作必须 try/catch。

export const STORAGE_KEYS = {
    TOKEN: 'accessToken',
    USER_INFO: 'useInfo',
    THEME: 'theme',
    INVITE: 'agencyInviteId',
} as const

export function getStorage<T>(key: string): T | null {
    try {
        const value = uni.getStorageSync(key)
        return value === '' || value === undefined ? null : (value as T)
    } catch {
        return null
    }
}

export function setStorage(key: string, value: unknown) {
    try {
        uni.setStorageSync(key, value)
    } catch {
        // 存储满时静默失败，不影响主流程
    }
}

export function removeStorage(key: string) {
    try {
        uni.removeStorageSync(key)
    } catch {
        // 忽略
    }
}

export function clearAuth() {
    removeStorage(STORAGE_KEYS.TOKEN)
    removeStorage(STORAGE_KEYS.USER_INFO)
}
