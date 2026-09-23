<template>
    <uni-popup ref="popupRef" type="bottom" :safe-area="false">
        <view class="share-panel">
            <text class="share-panel__title">{{ title }}</text>

            <view class="share-panel__list">
                <view
                    v-for="channel in channelList"
                    :key="channel.value"
                    class="share-panel__item"
                    @click="handleSelect(channel)"
                >
                    <view class="share-panel__icon">
                        <text class="share-panel__icon-text">{{ channel.label.charAt(0) }}</text>
                    </view>
                    <text class="share-panel__label">{{ channel.label }}</text>
                </view>
            </view>

            <view class="share-panel__cancel" @click="close">
                <text class="share-panel__cancel-text">取消</text>
            </view>
            <SafeArea />
        </view>
    </uni-popup>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import SafeArea from '@/components/safe-area/SafeArea.vue'

interface Props {
    title?: string
    channels?: Option[]
}

const props = withDefaults(defineProps<Props>(), {
    title: '分享到',
    channels: () => [],
})

const emit = defineEmits<{
    select: [channel: Option]
}>()

const PLATFORM_CHANNELS: Option[] = [
    // #ifdef MP-WEIXIN
    { label: '微信好友', value: 'wechat' },
    { label: '朋友圈', value: 'moments' },
    // #endif
    // #ifdef MP-TOUTIAO
    // 抖音端审核要求：不能出现微信相关 UI
    { label: '私信好友', value: 'toutiao' },
    // #endif
    { label: '复制链接', value: 'link' },
]

const channelList = computed(() => (props.channels.length ? props.channels : PLATFORM_CHANNELS))

// 弹窗类组件统一用 uni-popup + defineExpose 暴露 open/close
interface PopupInstance {
    open: (type?: string) => void
    close: () => void
}

const popupRef = ref<PopupInstance>()

function handleSelect(channel: Option) {
    emit('select', channel)
    close()
}

function open() {
    popupRef.value?.open('bottom')
}

function close() {
    popupRef.value?.close()
}

defineExpose({ open, close })
</script>

<style lang="scss" scoped>
.share-panel {
    border-radius: $radius-lg $radius-lg 0 0;
    background-color: #ffffff;
    padding-bottom: $spacing-sm;

    &__title {
        display: block;
        padding: $spacing-lg 0 $spacing-md;
        text-align: center;
        font-size: $font-size-sm;
        color: $text-color-secondary;
    }

    &__list {
        display: flex;
        padding: 0 $spacing-md;
    }

    &__item {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 160rpx;
        min-height: 88rpx;
        padding: $spacing-sm 0;
    }

    &__icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 96rpx;
        height: 96rpx;
        border-radius: 50%;
        background-color: $background-color;
    }

    &__icon-text {
        font-size: $font-size-lg;
        font-weight: 600;
        color: $text-color-main;
    }

    &__label {
        margin-top: $spacing-sm;
        font-size: $font-size-xs;
        color: $text-color-regular;
    }

    &__cancel {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 88rpx;
        margin: $spacing-md $spacing-md 0;
        border-radius: $radius-base;
        background-color: $border-color-light;
    }

    &__cancel-text {
        font-size: $font-size-base;
        color: $text-color-regular;
    }
}

// 覆盖组件库样式必须用 :deep() 穿透 scoped
:deep(.uni-popup__wrapper) {
    border-radius: $radius-lg $radius-lg 0 0;
}
</style>
