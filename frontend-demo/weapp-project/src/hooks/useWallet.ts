import { ref } from 'vue'
import { createWithdraw, getWallet } from '@/api/wallet'

export function useWallet(autoLoad = true) {
    const wallet = ref<UserRes.Wallet | null>(null)
    const loading = ref(false)
    const submitting = ref(false)

    async function fetchWallet(showLoading = false) {
        if (loading.value) return
        loading.value = true
        try {
            const res = await getWallet(showLoading)
            if (res.success) {
                wallet.value = res.data
            }
        } catch {
            // 拦截器已全局 toast
        } finally {
            loading.value = false
        }
    }

    async function submitWithdraw(data: UserRes.WithdrawParams) {
        if (submitting.value) return false
        submitting.value = true
        try {
            const res = await createWithdraw(data)
            if (!res.success) {
                uni.showToast({ title: res.message || '提现申请失败', icon: 'none' })
                return false
            }
            await fetchWallet()
            return true
        } catch {
            return false
        } finally {
            submitting.value = false
        }
    }

    if (autoLoad) fetchWallet()

    return { wallet, loading, submitting, fetchWallet, submitWithdraw }
}
