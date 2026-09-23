<template>
    <scroll-view class="filter-bar" scroll-x :show-scrollbar="false">
        <view class="filter-bar__inner">
            <view
                v-for="option in options"
                :key="option.value"
                class="filter-bar__item"
                :class="{ 'filter-bar__item--active': option.value === modelValue }"
                @click="handleSelect(option)"
            >
                <text class="filter-bar__text">{{ option.label }}</text>
            </view>
        </view>
    </scroll-view>
</template>

<script lang="ts" setup>
import { CATEGORY_OPTIONS } from '@/utils/constants'

interface Props {
    modelValue: KOL.Category | ''
    options?: Option[]
}

withDefaults(defineProps<Props>(), {
    options: () => CATEGORY_OPTIONS,
})

const emit = defineEmits<{
    'update:modelValue': [value: KOL.Category | '']
    change: [value: KOL.Category | '']
}>()

function handleSelect(option: Option) {
    const value = option.value as KOL.Category | ''
    emit('update:modelValue', value)
    emit('change', value)
}
</script>

<style lang="scss" scoped>
.filter-bar {
    width: 100%;
    white-space: nowrap;

    &__inner {
        display: flex;
        padding: $spacing-sm $spacing-md;
    }

    &__item {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        min-width: 120rpx;
        height: 60rpx;
        padding: 0 $spacing-md;
        margin-right: $spacing-sm;
        border-radius: $radius-round;
        background-color: #ffffff;

        &--active {
            background: $btn-color;
        }
    }

    &__text {
        font-size: $font-size-sm;
        color: $text-color-regular;
    }
}
</style>
