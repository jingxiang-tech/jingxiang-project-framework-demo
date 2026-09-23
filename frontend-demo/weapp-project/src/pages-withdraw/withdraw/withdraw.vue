<template>
    <view class="withdraw">
        <view class="withdraw__balance">
            <text class="withdraw__balance-label">可提现余额（元）</text>
            <text class="withdraw__balance-value">{{ formatAmount(wallet?.balance ?? 0) }}</text>
            <text class="withdraw__balance-tip">
                单次最低提现 ¥{{ formatAmount(wallet?.minWithdraw ?? 0) }}，预计 1-3 个工作日到账
            </text>
        </view>

        <view class="panel">
            <view class="withdraw__row">
                <text class="withdraw__label">提现金额</text>
                <input
                    v-model="form.amount"
                    class="withdraw__input"
                    type="digit"
                    placeholder="0.00"
                    placeholder-class="withdraw__placeholder"
                />
                <text class="withdraw__all" @click="handleWithdrawAll">全部提现</text>
            </view>

            <view class="withdraw__row">
                <text class="withdraw__label">到账方式</text>
                <view class="withdraw__options">
                    <view
                        v-for="option in ACCOUNT_TYPE_OPTIONS"
                        :key="option.value"
                        class="withdraw__option"
                        :class="{ 'withdraw__option--active': option.value === form.accountType }"
                        @click="form.accountType = option.value as AccountType"
                    >
                        <text class="withdraw__option-text">{{ option.label }}</text>
                    </view>
                </view>
            </view>

            <view class="withdraw__row">
                <text class="withdraw__label">收款账户</text>
                <input
                    v-model="form.account"
                    class="withdraw__input"
                    type="text"
                    :placeholder="
                        form.accountType === 'wechat' ? '微信实名需与账号一致' : '请输入银行卡号'
                    "
                    placeholder-class="withdraw__placeholder"
                    maxlength="30"
                />
            </view>

            <view class="withdraw__row">
                <text class="withdraw__label">真实姓名</text>
                <input
                    v-model="form.realName"
                    class="withdraw__input"
                    type="text"
                    placeholder="请输入收款人姓名"
                    placeholder-class="withdraw__placeholder"
                    maxlength="20"
                />
            </view>
        </view>

        <view class="withdraw__footer">
            <view class="withdraw__submit" @click="handleSubmit">
                <text class="withdraw__submit-text">
                    {{ submitting ? '提交中...' : '确认提现' }}
                </text>
            </view>
            <SafeArea />
        </view>
    </view>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import SafeArea from '@/components/safe-area/SafeArea.vue'
import { useWallet } from '@/hooks/useWallet'
import { useMemberStore } from '@/store/useMember'
import { formatAmount } from '@/utils/format'
import { ACCOUNT_TYPE_OPTIONS } from '@/utils/constants'

type AccountType = UserRes.WithdrawParams['accountType']

const memberStore = useMemberStore()
const { wallet, submitting, fetchWallet, submitWithdraw } = useWallet(false)

const form = reactive({
    amount: '',
    accountType: 'wechat' as AccountType,
    account: '',
    realName: '',
})

onLoad(async () => {
    // 提现属于强鉴权入口，未登录直接拦截
    if (!(await memberStore.validateLogin())) {
        uni.navigateBack()
    }
})

onShow(() => {
    if (memberStore.isLoggedIn) fetchWallet(true)
})

function handleWithdrawAll() {
    form.amount = formatAmount(wallet.value?.balance ?? 0)
}

function validate() {
    const amount = Number(form.amount)
    const balance = wallet.value?.balance ?? 0
    const minWithdraw = wallet.value?.minWithdraw ?? 0

    if (!form.amount || !Number.isFinite(amount) || amount <= 0) return '请输入提现金额'
    if (Math.round(amount * 100) < minWithdraw) {
        return `单次提现不得低于 ¥${formatAmount(minWithdraw)}`
    }
    if (Math.round(amount * 100) > balance) return '提现金额超出可提现余额'
    if (!form.account.trim()) return '请填写收款账户'
    if (!form.realName.trim()) return '请填写收款人姓名'
    return ''
}

async function handleSubmit() {
    if (submitting.value) return

    const error = validate()
    if (error) {
        uni.showToast({ title: error, icon: 'none' })
        return
    }

    // 金额统一换算为「分」后再提交
    const succeeded = await submitWithdraw({
        amount: Math.round(Number(form.amount) * 100),
        accountType: form.accountType,
        account: form.account.trim(),
        realName: form.realName.trim(),
    })
    if (!succeeded) return

    uni.showModal({
        title: '提交成功',
        content: '提现申请已受理，可在提现记录中查看进度',
        showCancel: false,
        success: () => {
            uni.redirectTo({ url: '/pages-withdraw/withdraw-record/withdraw-record' })
        },
    })
}
</script>

<style lang="scss" scoped>
.withdraw {
    min-height: 100vh;
    padding-bottom: 200rpx;

    &__balance {
        display: flex;
        flex-direction: column;
        padding: $spacing-lg $spacing-md;
        background: $btn-color;
    }

    &__balance-label {
        font-size: $font-size-sm;
        color: $text-color-regular;
    }

    &__balance-value {
        margin-top: $spacing-xs;
        font-size: 64rpx;
        font-weight: 600;
        color: $text-color-main;
    }

    &__balance-tip {
        margin-top: $spacing-sm;
        font-size: $font-size-xs;
        color: $text-color-regular;
    }

    &__row {
        display: flex;
        align-items: center;
        min-height: 88rpx;

        @include hairline-border($border-color-light);
    }

    &__label {
        width: 160rpx;
        flex-shrink: 0;
        font-size: $font-size-base;
        color: $text-color-main;
    }

    &__input {
        flex: 1;
        min-width: 0;
        font-size: $font-size-base;
        color: $text-color-main;
    }

    &__placeholder {
        color: $text-color-placeholder;
    }

    &__all {
        flex-shrink: 0;
        padding: $spacing-xs $spacing-sm;
        font-size: $font-size-xs;
        color: $text-color-main;
        border-radius: $radius-round;
        background-color: $background-color;
    }

    &__options {
        display: flex;
        flex: 1;
    }

    &__option {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 60rpx;
        padding: 0 $spacing-md;
        margin-right: $spacing-sm;
        border-radius: $radius-round;
        background-color: $border-color-light;

        &--active {
            background: $btn-color;
        }
    }

    &__option-text {
        font-size: $font-size-xs;
        color: $text-color-regular;
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
