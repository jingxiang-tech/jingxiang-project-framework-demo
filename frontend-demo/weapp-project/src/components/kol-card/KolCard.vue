<template>
    <view class="kol-card" @click="handleClick">
        <image v-if="item.avatar" class="kol-card__avatar" :src="item.avatar" mode="aspectFill" />
        <view v-else class="kol-card__avatar kol-card__avatar--placeholder">
            <text class="kol-card__avatar-text">{{ item.name.charAt(0) }}</text>
        </view>

        <view class="kol-card__info">
            <view class="fh-c-bt">
                <text class="kol-card__name text-overflow">{{ item.name }}</text>
                <text class="kol-card__price">¥{{ formatAmount(item.price) }}</text>
            </view>
            <text class="kol-card__meta">
                {{ categoryLabel }} · {{ formatCount(item.fans) }} 粉丝 · 月销 ¥{{
                    formatAmount(item.salesAmount)
                }}
            </text>
            <view class="kol-card__tags">
                <text v-for="tag in item.tags" :key="tag" class="kol-card__tag">{{ tag }}</text>
            </view>
        </view>

        <view v-if="showAction" class="kol-card__action">
            <text class="kol-card__action-text">邀约</text>
        </view>

        <slot name="extra" />
    </view>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { formatAmount, formatCount } from '@/utils/format'
import { CATEGORY_LABEL_MAP } from '@/utils/constants'

interface Props {
    item: KOL.Item
    showAction?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    showAction: false,
})

const emit = defineEmits<{
    click: [item: KOL.Item]
}>()

const categoryLabel = computed(() => CATEGORY_LABEL_MAP[props.item.category])

function handleClick() {
    emit('click', props.item)
}
</script>

<style lang="scss" scoped>
.kol-card {
    display: flex;
    align-items: center;
    min-height: 88rpx;
    padding: $spacing-md;
    border-radius: $radius-lg;
    background-color: #ffffff;

    & + & {
        margin-top: $spacing-sm;
    }

    &__avatar {
        width: 96rpx;
        height: 96rpx;
        border-radius: 50%;
        background-color: $border-color-light;

        &--placeholder {
            display: flex;
            align-items: center;
            justify-content: center;
            background: $btn-color;
        }
    }

    &__avatar-text {
        font-size: $font-size-lg;
        font-weight: 600;
        color: $text-color-main;
    }

    &__info {
        flex: 1;
        min-width: 0;
        margin-left: 20rpx;
    }

    &__name {
        max-width: 260rpx;
        font-size: $font-size-md;
        font-weight: 600;
        color: $text-color-main;
    }

    &__price {
        font-size: $font-size-sm;
        font-weight: 600;
        color: $primary-color-dark;
    }

    &__meta {
        display: block;
        margin-top: $spacing-xs;
        font-size: $font-size-xs;
        color: $text-color-secondary;
    }

    &__tags {
        display: flex;
        flex-wrap: wrap;
        margin-top: $spacing-xs;
    }

    &__tag {
        margin: 0 $spacing-xs $spacing-xs 0;
        padding: 4rpx 12rpx;
        border-radius: $radius-sm;
        background-color: $background-color;
        font-size: $font-size-xs;
        color: $text-color-regular;
    }

    &__action {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 96rpx;
        height: 60rpx;
        margin-left: $spacing-sm;
        border-radius: $radius-round;
        background: $btn-color;
    }

    &__action-text {
        font-size: $font-size-xs;
        font-weight: 600;
        color: $text-color-main;
    }
}
</style>
