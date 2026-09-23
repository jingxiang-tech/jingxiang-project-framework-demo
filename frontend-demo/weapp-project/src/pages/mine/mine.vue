<template>
    <view class="mine">
        <view class="mine__header">
            <view class="mine__user" @click="handleUserTap">
                <image
                    v-if="userInfo?.avatar"
                    class="mine__avatar"
                    :src="userInfo.avatar"
                    mode="aspectFill"
                />
                <view v-else class="mine__avatar mine__avatar--placeholder">
                    <text class="mine__avatar-text">{{ avatarText }}</text>
                </view>

                <view class="mine__user-info">
                    <text class="mine__nickname">
                        {{ isLoggedIn ? userInfo?.nickname : '点击登录' }}
                    </text>
                    <text class="mine__desc">
                        {{
                            isLoggedIn
                                ? `${roleLabel} · ${userInfo?.mobile}`
                                : '登录后可查看收益与提现'
                        }}
                    </text>
                </view>
            </view>
        </view>

        <view class="panel mine__wallet">
            <view class="fh-c-bt">
                <text class="mine__wallet-label">可提现余额（元）</text>
                <text v-if="!weappStatus" class="mine__wallet-action" @click="goWithdraw">
                    去提现
                </text>
            </view>
            <text class="mine__wallet-amount">
                {{ isLoggedIn ? formatAmount(wallet?.balance ?? 0) : '--' }}
            </text>
            <view class="mine__wallet-extra">
                <view class="mine__wallet-item">
                    <text class="mine__wallet-value">
                        {{ isLoggedIn ? formatAmount(wallet?.frozen ?? 0) : '--' }}
                    </text>
                    <text class="mine__wallet-key">提现中</text>
                </view>
                <view class="mine__wallet-item">
                    <text class="mine__wallet-value">
                        {{ isLoggedIn ? formatAmount(wallet?.totalIncome ?? 0) : '--' }}
                    </text>
                    <text class="mine__wallet-key">累计收益</text>
                </view>
            </view>
            <!-- 审核期隐藏提现入口 -->
            <text v-if="weappStatus" class="mine__wallet-tip">提现功能维护中，请稍后再试</text>
        </view>

        <view class="panel">
            <view
                v-for="menu in menus"
                :key="menu.label"
                class="mine__menu"
                @click="handleMenuTap(menu)"
            >
                <text class="mine__menu-label">{{ menu.label }}</text>
                <text class="mine__menu-arrow">›</text>
            </view>
        </view>

        <view v-if="isLoggedIn" class="mine__logout" @click="handleLogout">
            <text class="mine__logout-text">退出登录</text>
        </view>
    </view>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { storeToRefs } from 'pinia'
import { useMemberStore } from '@/store/useMember'
import { useWallet } from '@/hooks/useWallet'
import { formatAmount } from '@/utils/format'

interface Menu {
    label: string
    url?: string
    requireLogin?: boolean
}

const ROLE_LABEL_MAP: Record<UserRes.Info['role'], string> = {
    agency: '合作机构',
    kol: '入驻达人',
    merchant: '品牌商家',
}

const memberStore = useMemberStore()
const { userInfo, isLoggedIn, weappStatus } = storeToRefs(memberStore)

// 钱包属于服务端数据，autoLoad 关闭，由 onShow 按登录态触发
const { wallet, fetchWallet } = useWallet(false)

const menus: Menu[] = [
    { label: '个人资料', url: '/pages-authorize/user-info/user-info', requireLogin: true },
    {
        label: '提现记录',
        url: '/pages-withdraw/withdraw-record/withdraw-record',
        requireLogin: true,
    },
    { label: '关于平台' },
]

const avatarText = computed(() => userInfo.value?.nickname?.charAt(0) ?? '游')
const roleLabel = computed(() => ROLE_LABEL_MAP[userInfo.value?.role ?? 'agency'])

onShow(() => {
    if (!isLoggedIn.value) return
    // 从提现页返回时需要拿到最新余额
    memberStore.getMemberinfo()
    fetchWallet()
})

async function handleUserTap() {
    if (isLoggedIn.value) {
        uni.navigateTo({ url: '/pages-authorize/user-info/user-info' })
        return
    }
    await memberStore.validateLogin()
}

async function goWithdraw() {
    if (!(await memberStore.validateLogin())) return
    uni.navigateTo({ url: '/pages-withdraw/withdraw/withdraw' })
}

async function handleMenuTap(menu: Menu) {
    if (!menu.url) {
        uni.showModal({
            title: '关于平台',
            content: '达人精选 · 规范示例项目 v1.0.0',
            showCancel: false,
        })
        return
    }
    if (menu.requireLogin && !(await memberStore.validateLogin())) return
    uni.navigateTo({ url: menu.url })
}

function handleLogout() {
    uni.showModal({
        title: '提示',
        content: '确定退出登录？',
        success: res => {
            if (res.confirm) memberStore.logOut()
        },
    })
}
</script>

<style lang="scss" scoped>
.mine {
    min-height: 100vh;
    padding-bottom: $spacing-xl;

    &__header {
        padding: $spacing-lg $spacing-md $spacing-xl;
        background: $btn-color;
    }

    &__user {
        display: flex;
        align-items: center;
        min-height: 88rpx;
    }

    &__avatar {
        width: 120rpx;
        height: 120rpx;
        border-radius: 50%;
        background-color: rgba(255, 255, 255, 0.6);

        &--placeholder {
            display: flex;
            align-items: center;
            justify-content: center;
        }
    }

    &__avatar-text {
        font-size: $font-size-xl;
        font-weight: 600;
        color: $text-color-main;
    }

    &__user-info {
        flex: 1;
        min-width: 0;
        margin-left: $spacing-md;
    }

    &__nickname {
        display: block;
        font-size: $font-size-lg;
        font-weight: 600;
        color: $text-color-main;
    }

    &__desc {
        display: block;
        margin-top: $spacing-xs;
        font-size: $font-size-xs;
        color: $text-color-regular;
    }

    &__wallet {
        margin-top: -60rpx;
    }

    &__wallet-label {
        font-size: $font-size-sm;
        color: $text-color-secondary;
    }

    &__wallet-action {
        padding: $spacing-xs $spacing-md;
        font-size: $font-size-xs;
        color: $text-color-main;
        border-radius: $radius-round;
        background-color: $background-color;
    }

    &__wallet-amount {
        display: block;
        margin-top: $spacing-sm;
        font-size: 56rpx;
        font-weight: 600;
        color: $text-color-main;
    }

    &__wallet-extra {
        display: flex;
        margin-top: $spacing-md;
        padding-top: $spacing-md;
        border-top: 1rpx solid $border-color-light;
    }

    &__wallet-item {
        display: flex;
        flex-direction: column;
        margin-right: $spacing-xl;
    }

    &__wallet-value {
        font-size: $font-size-md;
        font-weight: 600;
        color: $text-color-regular;
    }

    &__wallet-key {
        margin-top: 4rpx;
        font-size: $font-size-xs;
        color: $text-color-secondary;
    }

    &__wallet-tip {
        display: block;
        margin-top: $spacing-sm;
        font-size: $font-size-xs;
        color: $color-warning;
    }

    &__menu {
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-height: 88rpx;

        @include hairline-border($border-color-light);
    }

    &__menu-label {
        font-size: $font-size-base;
        color: $text-color-main;
    }

    &__menu-arrow {
        font-size: $font-size-lg;
        color: $text-color-placeholder;
    }

    &__logout {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 88rpx;
        margin: $spacing-xl $spacing-md 0;
        border-radius: $radius-base;
        background-color: #ffffff;
    }

    &__logout-text {
        font-size: $font-size-base;
        color: $color-danger;
    }
}
</style>
