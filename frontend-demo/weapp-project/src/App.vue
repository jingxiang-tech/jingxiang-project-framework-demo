<script lang="ts" setup>
import { onLaunch, onShow } from '@dcloudio/uni-app'
import { useMemberStore } from '@/store/useMember'

const memberStore = useMemberStore()

onLaunch(option => {
    memberStore.restoreSession()
    // 邀请链路参数只在启动时透传一次
    memberStore.saveInviteParam((option?.query ?? {}) as OptionParam)
})

onShow(() => {
    // 静默刷新用户信息，未登录时内部直接跳过
    memberStore.getMemberinfo()
})
</script>

<style lang="scss">
/* 全局样式，不加 scoped */
@import '@/styles/common.scss';
</style>
