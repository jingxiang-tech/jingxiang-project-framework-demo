<template>
    <view class="login">
        <view class="login__brand">
            <view class="login__logo">
                <text class="login__logo-text">达</text>
            </view>
            <text class="login__title">{{ appTitle }}</text>
            <text class="login__subtitle">找对达人，带货不费力</text>
        </view>

        <view class="login__actions">
            <view class="login__btn" @click="handleLogin">
                <text class="login__btn-text">{{ logging ? '登录中...' : '一键登录' }}</text>
            </view>

            <!-- #ifdef MP-WEIXIN -->
            <button
                class="login__mobile"
                open-type="getPhoneNumber"
                @getphonenumber="handleGetPhoneNumber"
            >
                <text class="login__mobile-text">手机号快捷登录</text>
            </button>
            <!-- #endif -->

            <view class="login__agreement" @click="agreed = !agreed">
                <view class="login__checkbox" :class="{ 'login__checkbox--checked': agreed }" />
                <text class="login__agreement-text">已阅读并同意《用户协议》与《隐私政策》</text>
            </view>

            <!-- 审核要求：登录不能阻断浏览，游客可看基本内容 -->
            <text class="login__skip" @click="handleSkip">先逛逛</text>
        </view>
    </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { bindMobile } from '@/api/user'
import { useMemberStore } from '@/store/useMember'

// 微信 getPhoneNumber 回调返回加密数据，由后端解密，前端不处理明文手机号
interface PhoneNumberEvent {
    detail: {
        errMsg: string
        encryptedData?: string
        iv?: string
    }
}

const appTitle = import.meta.env.VITE_APP_TITLE
const memberStore = useMemberStore()

const agreed = ref(false)
const logging = ref(false)

async function handleLogin() {
    if (!ensureAgreed() || logging.value) return

    logging.value = true
    try {
        const success = await memberStore.loginByCode()
        if (success) finishLogin()
    } finally {
        logging.value = false
    }
}

async function handleGetPhoneNumber(event: PhoneNumberEvent) {
    if (!ensureAgreed()) return

    const { errMsg, encryptedData, iv } = event.detail
    if (!errMsg.includes('ok') || !encryptedData || !iv) {
        // 用户拒绝授权不提示错误，也不阻塞浏览
        return
    }

    try {
        const res = await bindMobile({ encryptedData, iv })
        if (!res.success) {
            uni.showToast({ title: res.message || '绑定失败', icon: 'none' })
            return
        }
        await memberStore.getMemberinfo(true)
        finishLogin()
    } catch {
        // 拦截器已全局 toast
    }
}

function ensureAgreed() {
    if (agreed.value) return true
    uni.showToast({ title: '请先阅读并同意用户协议', icon: 'none' })
    return false
}

// 登录成功后替换当前页，避免返回到登录页
function finishLogin() {
    uni.showToast({ title: '登录成功', icon: 'success' })
    setTimeout(() => {
        uni.switchTab({ url: '/pages/dashboard/dashboard' })
    }, 600)
}

function handleSkip() {
    uni.switchTab({ url: '/pages/dashboard/dashboard' })
}
</script>

<style lang="scss" scoped>
.login {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    padding: 0 $spacing-xl;
    background-color: #ffffff;

    &__brand {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 160rpx 0 120rpx;
    }

    &__logo {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 160rpx;
        height: 160rpx;
        border-radius: $radius-lg;
        background: $btn-color;
    }

    &__logo-text {
        font-size: 72rpx;
        font-weight: 600;
        color: $text-color-main;
    }

    &__title {
        margin-top: $spacing-md;
        font-size: $font-size-xl;
        font-weight: 600;
        color: $text-color-main;
    }

    &__subtitle {
        margin-top: $spacing-xs;
        font-size: $font-size-sm;
        color: $text-color-secondary;
    }

    &__actions {
        display: flex;
        flex-direction: column;
    }

    &__btn {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 88rpx;
        border-radius: $radius-round;
        background: $btn-color;
    }

    &__btn-text {
        font-size: $font-size-base;
        font-weight: 600;
        color: $text-color-main;
    }

    &__mobile {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 88rpx;
        margin-top: $spacing-md;
        border-radius: $radius-round;
        background-color: $background-color;
        line-height: 1;

        &::after {
            border: none;
        }
    }

    &__mobile-text {
        font-size: $font-size-base;
        color: $text-color-main;
    }

    &__agreement {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 88rpx;
        margin-top: $spacing-md;
    }

    &__checkbox {
        width: 32rpx;
        height: 32rpx;
        margin-right: $spacing-xs;
        border: 2rpx solid $border-color;
        border-radius: 50%;

        &--checked {
            border-color: $primary-color-dark;
            background: $btn-color;
        }
    }

    &__agreement-text {
        font-size: $font-size-xs;
        color: $text-color-secondary;
    }

    &__skip {
        padding: $spacing-md 0;
        text-align: center;
        font-size: $font-size-sm;
        color: $text-color-placeholder;
    }
}
</style>
