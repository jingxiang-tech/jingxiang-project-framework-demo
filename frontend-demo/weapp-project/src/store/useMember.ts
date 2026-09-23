import { defineStore } from 'pinia'
import { getMemberInfo, login } from '@/api/user'
import { STORAGE_KEYS, clearAuth, getStorage, setStorage } from '@/utils/storage'
import { PLATFORM, platformLogin } from '@/utils/platform'

// 全局只维护这一个核心 store（登录态 / 用户信息）。
// 服务端列表数据走 composable，不入 store。
export const useMemberStore = defineStore('MemberStore', {
    state: () => ({
        userInfo: null as UserRes.Info | null,
        token: getStorage<string>(STORAGE_KEYS.TOKEN) ?? '',
        platform: PLATFORM,
        // 小程序审核期开关：审核中隐藏提现等敏感入口
        weappStatus: false,
        inviteUserId: getStorage<string>(STORAGE_KEYS.INVITE) ?? '',
    }),

    getters: {
        isLoggedIn: state => !!state.token,
    },

    actions: {
        // App onLaunch 恢复本地会话，避免冷启动闪登录态
        restoreSession() {
            const cached = getStorage<UserRes.Info>(STORAGE_KEYS.USER_INFO)
            if (cached) this.userInfo = cached
        },

        // 启动参数里的邀请链路，落本地供后续登录透传
        saveInviteParam(option: OptionParam) {
            const inviteId =
                option.agency_invite_id ?? option.invite_user_id ?? option.share_user_id
            if (!inviteId) return
            this.inviteUserId = inviteId
            setStorage(STORAGE_KEYS.INVITE, inviteId)
        },

        setWeappStatus(status: boolean) {
            this.weappStatus = status
        },

        async getMemberinfo(showLoading = false) {
            if (!this.isLoggedIn) return
            try {
                const res = await getMemberInfo(showLoading)
                if (res.success) {
                    this.userInfo = res.data
                    setStorage(STORAGE_KEYS.USER_INFO, res.data)
                }
            } catch {
                // 拦截器已全局 toast
            }
        },

        // 返回 false 表示需要补充绑定手机号
        async loginByCode(): Promise<boolean> {
            try {
                const { code, anonymousCode } = await platformLogin()
                const res = await login({
                    code,
                    anonymousCode,
                    platform: this.platform,
                    agencyInviteId: this.inviteUserId || undefined,
                })

                if (!res.success) {
                    uni.showToast({ title: res.message || '登录失败', icon: 'none' })
                    return false
                }

                this.token = res.data.accessToken
                this.userInfo = res.data.userInfo
                setStorage(STORAGE_KEYS.TOKEN, this.token)
                setStorage(STORAGE_KEYS.USER_INFO, this.userInfo)
                return !res.data.needBindMobile
            } catch {
                uni.showToast({ title: '登录失败，请重试', icon: 'none' })
                return false
            }
        },

        // 登录校验统一入口，页面不重复写
        async validateLogin(): Promise<boolean> {
            if (this.isLoggedIn) return true

            const confirmed = await new Promise<boolean>(resolve => {
                uni.showModal({
                    title: '提示',
                    content: '该操作需要登录，是否现在登录？',
                    confirmText: '去登录',
                    success: res => resolve(!!res.confirm),
                    fail: () => resolve(false),
                })
            })
            if (!confirmed) return false

            // 登录页在 pages-authorize 分包，使用绝对路径
            uni.navigateTo({ url: '/pages-authorize/login/login' })
            return false
        },

        logOut() {
            this.token = ''
            this.userInfo = null
            clearAuth()
            uni.reLaunch({ url: '/pages/dashboard/dashboard' })
        },
    },
})
