// 抖音小程序（mp-toutiao）专有 API 的最小声明。
// 仅在 #ifdef MP-TOUTIAO 条件编译块内使用，微信构建时相关代码会被移除。

interface ToutiaoLoginResult {
    code: string
    anonymousCode: string
    errMsg: string
}

interface ToutiaoFailResult {
    errMsg: string
}

interface ToutiaoApi {
    login(options: {
        force?: boolean
        success?: (res: ToutiaoLoginResult) => void
        fail?: (err: ToutiaoFailResult) => void
    }): void
}

declare const tt: ToutiaoApi
