<template>
    <view class="stat-panel">
        <view v-for="item in items" :key="item.label" class="stat-panel__item">
            <text class="stat-panel__value">{{ item.value }}</text>
            <text class="stat-panel__label">{{ item.label }}</text>
        </view>
    </view>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { formatAmount, formatCount } from '@/utils/format'

interface Props {
    kolTotal: number
    orderTotal: number
    // 单位：分
    gmvTotal: number
}

const props = defineProps<Props>()

const items = computed(() => [
    { label: '入驻达人', value: formatCount(props.kolTotal) },
    { label: '成交订单', value: formatCount(props.orderTotal) },
    { label: '平台 GMV', value: `¥${formatAmount(props.gmvTotal)}` },
])
</script>

<style lang="scss" scoped>
.stat-panel {
    display: flex;
    padding: $spacing-md 0;

    &__item {
        display: flex;
        flex: 1;
        flex-direction: column;
        align-items: center;
    }

    &__value {
        font-size: $font-size-lg;
        font-weight: 600;
        color: $text-color-main;
    }

    &__label {
        margin-top: $spacing-xs;
        font-size: $font-size-xs;
        color: $text-color-secondary;
    }
}
</style>
