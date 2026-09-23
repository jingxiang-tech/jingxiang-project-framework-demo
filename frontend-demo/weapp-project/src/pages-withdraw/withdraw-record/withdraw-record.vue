<template>
    <view class="withdraw-record">
        <view v-for="item in state.data" :key="item.id" class="withdraw-record__item">
            <view class="fh-c-bt">
                <text class="withdraw-record__amount">-¥{{ formatAmount(item.amount) }}</text>
                <text
                    class="withdraw-record__status"
                    :class="`withdraw-record__status--${item.status}`"
                >
                    {{ WITHDRAW_STATUS_LABEL_MAP[item.status] }}
                </text>
            </view>
            <view class="fh-c-bt withdraw-record__meta">
                <text class="withdraw-record__account">{{
                    item.accountType === 'wechat' ? '微信零钱' : item.account
                }}</text>
                <text class="withdraw-record__date">{{ formatDateTime(item.createdAt) }}</text>
            </view>
            <text v-if="item.remark" class="withdraw-record__remark">{{ item.remark }}</text>
        </view>

        <view v-if="!state.loading && !state.data.length" class="empty">
            <text class="empty__text">还没有提现记录</text>
        </view>

        <view v-else-if="state.loading" class="list-tip">加载中...</view>
        <view v-else-if="!state.hasNext" class="list-tip">共 {{ state.pageCount }} 条记录</view>
    </view>
</template>

<script lang="ts" setup>
import { onHide, onLoad, onReachBottom, onShow, onUnload } from '@dcloudio/uni-app'
import { getWithdrawRecords } from '@/api/wallet'
import { usePagedList } from '@/hooks/usePagedList'
import { formatAmount, formatDateTime } from '@/utils/format'
import { WITHDRAW_STATUS_LABEL_MAP } from '@/utils/constants'

// 处理中的记录需要轮询状态，间隔内静默刷新
const POLL_INTERVAL = 30000

// 首屏与轮询时机由页面自行控制，因此关闭 autoLoad
const { state, fetchData } = usePagedList<UserRes.WithdrawRecord>({
    autoLoad: false,
    fetcher: getWithdrawRecords,
})

let timer: ReturnType<typeof setInterval> | null = null

function startPolling() {
    stopPolling()
    timer = setInterval(() => fetchData(true), POLL_INTERVAL)
}

function stopPolling() {
    if (!timer) return
    clearInterval(timer)
    timer = null
}

onLoad(() => {
    fetchData(true)
    startPolling()
})

onShow(() => {
    // 从提现页返回时立即刷新一次并恢复轮询
    fetchData(true)
    startPolling()
})

// 定时器必须在 onHide / onUnload 中清理
onHide(stopPolling)
onUnload(stopPolling)

onReachBottom(() => {
    fetchData()
})
</script>

<style lang="scss" scoped>
.withdraw-record {
    min-height: 100vh;
    padding: $spacing-md;

    &__item {
        padding: $spacing-md;
        margin-bottom: $spacing-sm;
        border-radius: $radius-lg;
        background-color: #ffffff;
    }

    &__amount {
        font-size: $font-size-md;
        font-weight: 600;
        color: $text-color-main;
    }

    &__status {
        font-size: $font-size-xs;
        color: $text-color-secondary;

        &--success {
            color: $color-success;
        }

        &--pending {
            color: $color-warning;
        }

        &--failed {
            color: $color-danger;
        }
    }

    &__meta {
        margin-top: $spacing-sm;
    }

    &__account,
    &__date {
        font-size: $font-size-xs;
        color: $text-color-secondary;
    }

    &__remark {
        display: block;
        margin-top: $spacing-xs;
        font-size: $font-size-xs;
        color: $text-color-placeholder;
    }
}
</style>
