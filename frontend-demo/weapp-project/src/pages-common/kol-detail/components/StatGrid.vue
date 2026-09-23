<template>
    <view class="stat-grid">
        <view v-for="item in items" :key="item.label" class="stat-grid__item">
            <text class="stat-grid__value">{{ item.value }}</text>
            <text class="stat-grid__label">{{ item.label }}</text>
        </view>
    </view>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { formatCount } from '@/utils/format'

interface Props {
    detail: KOL.Detail
}

const props = defineProps<Props>()

const items = computed(() => [
    { label: '近30天视频', value: String(props.detail.videoCount) },
    { label: '平均播放', value: formatCount(props.detail.averageViews) },
    { label: '转化率', value: `${props.detail.conversionRate}%` },
    { label: '合作次数', value: String(props.detail.cooperationCount) },
])
</script>

<style lang="scss" scoped>
.stat-grid {
    display: flex;
    flex-wrap: wrap;

    &__item {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 25%;
        padding: $spacing-sm 0;
    }

    &__value {
        font-size: $font-size-md;
        font-weight: 600;
        color: $text-color-main;
    }

    &__label {
        margin-top: 4rpx;
        font-size: $font-size-xs;
        color: $text-color-secondary;
    }
}
</style>
