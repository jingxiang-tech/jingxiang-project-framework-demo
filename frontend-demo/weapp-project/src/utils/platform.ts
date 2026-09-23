// 平台差异统一收敛在这里，业务层不写 if (platform === 'xxx') 运行时判断。

export type Platform = 'wechat_mini' | 'douyin_mini'

export interface PlatformLoginResult {
    code: string
    anonymousCode?: string
}

// 订阅消息模板 ID 走配置，禁止硬编码在业务代码里
export const SUBSCRIBE_TMPL_IDS = {
    COOPERATION_RESULT: 'MOCK_TMPL_COOPERATION_RESULT',
} as const

function resolvePlatform(): Platform {
    let platform: Platform = 'wechat_mini'
    // #ifdef MP-TOUTIAO
    platform = 'douyin_mini'
    // #endif
    return platform
}

export const PLATFORM: Platform = resolvePlatform()

// 微信：uni.login 拿 code 交后端换 token
// 抖音：tt.login 额外返回 anonymousCode，支持匿名登录
export function platformLogin(): Promise<PlatformLoginResult> {
    return new Promise((resolve, reject) => {
        // #ifdef MP-WEIXIN
        uni.login({
            provider: 'weixin',
            success: res => resolve({ code: res.code }),
            fail: reject,
        })
        // #endif

        // #ifdef MP-TOUTIAO
        tt.login({
            success: res => resolve({ code: res.code, anonymousCode: res.anonymousCode }),
            fail: reject,
        })
        // #endif
    })
}

// 仅微信支持订阅消息；必须在用户点击事件中调用，用户拒绝不阻塞主流程
export function requestSubscribe(tmplIds: string[]): Promise<boolean> {
    return new Promise(resolve => {
        // #ifdef MP-WEIXIN
        uni.requestSubscribeMessage({
            tmplIds,
            success: res => {
                const result = res as unknown as Record<string, string>
                resolve(tmplIds.every(id => result[id] === 'accept'))
            },
            fail: () => resolve(false),
        })
        // #endif

        // #ifndef MP-WEIXIN
        resolve(false)
        // #endif
    })
}
