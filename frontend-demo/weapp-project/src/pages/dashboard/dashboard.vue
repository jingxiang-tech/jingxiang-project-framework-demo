<template>
    <view class="dashboard">
        <view class="dashboard__nav" :style="{ paddingTop: `${statusBarHeight}px` }">
            <text class="dashboard__nav-title">{{ appTitle }}</text>
        </view>

        <view class="dashboard__hero">
            <text class="dashboard__hero-title">找对达人，带货不费力</text>
            <text class="dashboard__hero-desc">
                {{ greeting }}，{{ memberStore.userInfo?.nickname ?? '游客' }}
            </text>
            <view class="dashboard__stats">
                <StatPanel
                    :kol-total="dashboard?.kolTotal ?? 0"
                    :order-total="dashboard?.orderTotal ?? 0"
                    :gmv-total="dashboard?.gmvTotal ?? 0"
                />
            </view>
        </view>

        <view class="panel">
            <text class="dashboard__section-title">常用功能</text>
            <view class="dashboard__entries">
                <view
                    v-for="entry in entries"
                    :key="entry.url"
                    class="dashboard__entry"
                    @click="handleEntry(entry)"
                >
                    <view class="dashboard__entry-mark">
                        <text class="dashboard__entry-mark-text">{{ entry.label.charAt(0) }}</text>
                    </view>
                    <text class="dashboard__entry-label">{{ entry.label }}</text>
                </view>
            </view>
        </view>

        <view class="dashboard__list">
            <view class="fh-c-bt dashboard__list-head">
                <text class="dashboard__section-title">推荐达人</text>
                <text class="dashboard__more" @click="goKolList">查看全部</text>
            </view>

            <KolCard
                v-for="item in dashboard?.recommendList ?? []"
                :key="item.id"
                :item="item"
                show-action
                @click="goDetail"
            />

            <view v-if="loaded && !dashboard?.recommendList.length" class="empty">
                <text class="empty__text">暂无推荐达人</text>
            </view>
        </view>
    </view>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { onLoad, onPullDownRefresh, onShareAppMessage } from '@dcloudio/uni-app'
import KolCard from '@/components/kol-card/KolCard.vue'
import StatPanel from './components/StatPanel.vue'
import { getDashboard } from '@/api/kol'
import { useMemberStore } from '@/store/useMember'

interface Entry {
    label: string
    url: string
    // tabBar 页面只能用 switchTab 跳转
    isTab?: boolean
    requireLogin?: boolean
}

const appTitle = import.meta.env.VITE_APP_TITLE
const memberStore = useMemberStore()

const statusBarHeight = uni.getWindowInfo().statusBarHeight ?? 0
const dashboard = ref<KOL.Dashboard | null>(null)
const loaded = ref(false)

const entries: Entry[] = [
    { label: '达人库', url: '/pages/kol-list/kol-list', isTab: true },
    { label: '我的钱包', url: '/pages-withdraw/withdraw/withdraw', requireLogin: true },
    {
        label: '提现记录',
        url: '/pages-withdraw/withdraw-record/withdraw-record',
        requireLogin: true,
    },
    { label: '个人资料', url: '/pages-authorize/user-info/user-info', requireLogin: true },
]

const greeting = computed(() => {
    const hour = new Date().getHours()
    if (hour < 6) return '夜深了'
    if (hour < 12) return '早上好'
    if (hour < 18) return '下午好'
    return '晚上好'
})

async function fetchDashboard(showLoading = true) {
    try {
        const res = await getDashboard(showLoading)
        if (res.success) {
            dashboard.value = res.data
            memberStore.setWeappStatus(res.data.weappStatus)
        }
    } catch {
        // 拦截器已全局 toast
    } finally {
        loaded.value = true
    }
}

async function handleEntry(entry: Entry) {
    if (entry.requireLogin && !(await memberStore.validateLogin())) return
    if (entry.isTab) {
        uni.switchTab({ url: entry.url })
        return
    }
    uni.navigateTo({ url: entry.url })
}

function goKolList() {
    uni.switchTab({ url: '/pages/kol-list/kol-list' })
}

function goDetail(item: KOL.Item) {
    // 跳转使用绝对路径 + query string
    uni.navigateTo({ url: `/pages-common/kol-detail/kol-detail?id=${item.id}` })
}

onLoad(() => {
    fetchDashboard()
})

onPullDownRefresh(async () => {
    await fetchDashboard(false)
    uni.stopPullDownRefresh()
})

// 必须在 setup 顶层直接调用，包在条件或回调里编译器不识别
onShareAppMessage(() => ({
    title: '达人精选 · 找对达人，带货不费力',
    path: `/pages/dashboard/dashboard?share_user_id=${memberStore.userInfo?.id ?? ''}`,
}))
</script>

<style lang="scss" scoped>
.dashboard {
    min-height: 100vh;
    padding-bottom: $spacing-lg;

    &__nav {
        padding-left: $spacing-md;
        background: $btn-color;
    }

    &__nav-title {
        display: block;
        height: 88rpx;
        line-height: 88rpx;
        font-size: $font-size-md;
        font-weight: 600;
        color: $text-color-main;
    }

    &__hero {
        padding: $spacing-md $spacing-md $spacing-lg;
        background: $btn-color;
    }

    &__hero-title {
        display: block;
        font-size: $font-size-xl;
        font-weight: 600;
        color: $text-color-main;
    }

    &__hero-desc {
        display: block;
        margin-top: $spacing-xs;
        font-size: $font-size-sm;
        color: $text-color-regular;
    }

    &__stats {
        margin-top: $spacing-md;
        border-radius: $radius-lg;
        background-color: rgba(255, 255, 255, 0.7);
    }

    &__section-title {
        font-size: $font-size-md;
        font-weight: 600;
        color: $text-color-main;
    }

    &__entries {
        display: flex;
        margin-top: $spacing-md;
    }

    &__entry {
        display: flex;
        flex: 1;
        flex-direction: column;
        align-items: center;
        min-height: 88rpx;
    }

    &__entry-mark {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 88rpx;
        height: 88rpx;
        border-radius: $radius-base;
        background-color: $background-color;
    }

    &__entry-mark-text {
        font-size: $font-size-md;
        font-weight: 600;
        color: $text-color-main;
    }

    &__entry-label {
        margin-top: $spacing-sm;
        font-size: $font-size-xs;
        color: $text-color-regular;
    }

    &__list {
        margin: $spacing-md;
    }

    &__list-head {
        margin-bottom: $spacing-sm;
    }

    &__more {
        font-size: $font-size-xs;
        color: $text-color-secondary;
    }
}
</style>
