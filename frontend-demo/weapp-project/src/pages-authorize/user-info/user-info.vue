<template>
    <view class="user-info">
        <view class="user-info__row">
            <text class="user-info__label">头像</text>

            <!-- #ifdef MP-WEIXIN -->
            <button
                class="user-info__picker"
                open-type="chooseAvatar"
                @chooseavatar="handleChooseAvatar"
            >
                <view
                    class="user-info__avatar"
                    :class="{ 'user-info__avatar--empty': !form.avatar }"
                >
                    <image
                        v-if="form.avatar"
                        class="user-info__avatar-img"
                        :src="form.avatar"
                        mode="aspectFill"
                    />
                    <text v-else class="user-info__avatar-text">选择</text>
                </view>
            </button>
            <!-- #endif -->

            <!-- #ifndef MP-WEIXIN -->
            <!-- 非微信平台未开放 chooseAvatar，退回相册选图 -->
            <view class="user-info__picker" @click="handlePickImage">
                <view
                    class="user-info__avatar"
                    :class="{ 'user-info__avatar--empty': !form.avatar }"
                >
                    <image
                        v-if="form.avatar"
                        class="user-info__avatar-img"
                        :src="form.avatar"
                        mode="aspectFill"
                    />
                    <text v-else class="user-info__avatar-text">选择</text>
                </view>
            </view>
            <!-- #endif -->
        </view>

        <view class="user-info__row">
            <text class="user-info__label">昵称</text>
            <input
                v-model="form.nickname"
                class="user-info__input"
                type="nickname"
                placeholder="请输入昵称"
                placeholder-class="user-info__placeholder"
                maxlength="20"
            />
        </view>

        <view class="user-info__row">
            <text class="user-info__label">手机号</text>
            <text class="user-info__value">{{ userInfo?.mobile || '未绑定' }}</text>
        </view>

        <view class="user-info__footer">
            <view class="user-info__submit" @click="handleSave">
                <text class="user-info__submit-text">{{ saving ? '保存中...' : '保存' }}</text>
            </view>
            <SafeArea />
        </view>
    </view>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { storeToRefs } from 'pinia'
import SafeArea from '@/components/safe-area/SafeArea.vue'
import { updateUserInfo, uploadAvatar } from '@/api/user'
import { useMemberStore } from '@/store/useMember'

// chooseAvatar 回调返回临时文件路径，需要上传换 CDN 地址
interface ChooseAvatarEvent {
    detail: { avatarUrl: string }
}

const memberStore = useMemberStore()
const { userInfo } = storeToRefs(memberStore)

const form = reactive({ nickname: '', avatar: '' })
const saving = ref(false)

onLoad(() => {
    form.nickname = userInfo.value?.nickname ?? ''
    form.avatar = userInfo.value?.avatar ?? ''
})

// 上传文件不走 request，用 uni.uploadFile + 手动注入 header
async function upload(tempFilePath: string) {
    try {
        const res = await uploadAvatar(tempFilePath)
        if (res.success) {
            form.avatar = res.data.url
            return
        }
        uni.showToast({ title: res.message || '头像上传失败', icon: 'none' })
    } catch {
        // 拦截器已全局 toast
    }
}

function handleChooseAvatar(event: ChooseAvatarEvent) {
    upload(event.detail.avatarUrl)
}

function handlePickImage() {
    uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        success: res => upload(res.tempFilePaths[0]),
    })
}

async function handleSave() {
    const nickname = form.nickname.trim()
    if (!nickname) {
        uni.showToast({ title: '昵称不能为空', icon: 'none' })
        return
    }
    if (saving.value) return

    saving.value = true
    try {
        const res = await updateUserInfo({ nickname, avatar: form.avatar })
        if (!res.success) {
            uni.showToast({ title: res.message || '保存失败', icon: 'none' })
            return
        }
        await memberStore.getMemberinfo()
        uni.showToast({ title: '已保存', icon: 'success' })
        setTimeout(() => uni.navigateBack(), 600)
    } catch {
        // 拦截器已全局 toast
    } finally {
        saving.value = false
    }
}
</script>

<style lang="scss" scoped>
.user-info {
    min-height: 100vh;
    padding-bottom: 200rpx;

    &__row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-height: 88rpx;
        padding: $spacing-md;
        background-color: #ffffff;

        @include hairline-border($border-color-light);
    }

    &__label {
        font-size: $font-size-base;
        color: $text-color-main;
    }

    &__picker {
        padding: 0;
        margin: 0;
        border: none;
        background-color: transparent;
        line-height: 1;

        &::after {
            border: none;
        }
    }

    &__avatar {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 96rpx;
        height: 96rpx;
        border-radius: 50%;
        background-color: $background-color;

        &--empty {
            border: 2rpx dashed $border-color;
        }
    }

    &__avatar-img {
        width: 96rpx;
        height: 96rpx;
        border-radius: 50%;
    }

    &__avatar-text {
        font-size: $font-size-xs;
        color: $text-color-secondary;
    }

    &__input {
        flex: 1;
        min-width: 0;
        margin-left: $spacing-lg;
        text-align: right;
        font-size: $font-size-base;
        color: $text-color-main;
    }

    &__placeholder {
        color: $text-color-placeholder;
    }

    &__value {
        font-size: $font-size-base;
        color: $text-color-secondary;
    }

    &__footer {
        position: fixed;
        right: 0;
        bottom: 0;
        left: 0;
        background-color: #ffffff;
        box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.04);
    }

    &__submit {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 88rpx;
        margin: $spacing-sm $spacing-md;
        border-radius: $radius-round;
        background: $btn-color;
    }

    &__submit-text {
        font-size: $font-size-base;
        font-weight: 600;
        color: $text-color-main;
    }
}
</style>
