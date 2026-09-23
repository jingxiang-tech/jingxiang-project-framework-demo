<template>
    <view class="kol-detail">
        <view v-if="detail" class="kol-detail__hero">
            <image
                v-if="detail.avatar"
                class="kol-detail__avatar"
                :src="detail.avatar"
                mode="aspectFill"
            />
            <view v-else class="kol-detail__avatar kol-detail__avatar--placeholder">
                <text class="kol-detail__avatar-text">{{ detail.name.charAt(0) }}</text>
            </view>

            <view class="kol-detail__title">
                <text class="kol-detail__name">{{ detail.name }}</text>
                <text class="kol-detail__meta">
                    {{ categoryLabel }} · {{ formatCount(detail.fans) }} 粉丝
                </text>
                <view class="kol-detail__tags">
                    <text v-for="tag in detail.tags" :key="tag" class="kol-detail__tag">
                        {{ tag }}
                    </text>
                </view>
            </view>
        </view>

        <view v-if="detail" class="panel">
            <StatGrid :detail="detail" />
            <text class="kol-detail__intro">{{ detail.intro }}</text>
        </view>

        <view class="panel">
            <text class="kol-detail__section">近期带货商品</text>
            <view v-for="product in products.data" :key="product.id" class="kol-detail__product">
                <view class="kol-detail__product-cover">
                    <text class="kol-detail__product-cover-text">
                        {{ product.title.charAt(0) }}
                    </text>
                </view>
                <view class="kol-detail__product-info">
                    <text class="kol-detail__product-title text-overflow-2">{{
                        product.title
                    }}</text>
                    <view class="fh-c-bt">
                        <text class="kol-detail__product-price"
                            >¥{{ formatAmount(product.price) }}</text
                        >
                        <text class="kol-detail__product-sales"
                            >已售 {{ formatCount(product.sales) }}</text
                        >
                    </view>
                </view>
            </view>

            <view v-if="!products.loading && !products.data.length" class="empty">
                <text class="empty__text">该达人暂无带货记录</text>
            </view>
            <view v-else-if="products.loading" class="list-tip">加载中...</view>
            <view v-else-if="!products.hasNext" class="list-tip">没有更多了</view>
        </view>

        <view class="kol-detail__footer">
            <view class="kol-detail__footer-inner">
                <view class="kol-detail__share" @click="openShare">
                    <text class="kol-detail__share-text">分享</text>
                </view>
                <view class="kol-detail__invite" @click="handleInvite">
                    <text class="kol-detail__invite-text"
                        >邀约合作 · ¥{{ formatAmount(detail?.price ?? 0) }}</text
                    >
                </view>
            </view>
            <SafeArea />
        </view>

        <SharePanel ref="sharePanelRef" @select="handleShareSelect" />
    </view>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { onLoad, onReachBottom, onShareAppMessage } from '@dcloudio/uni-app'
import SafeArea from '@/components/safe-area/SafeArea.vue'
import SharePanel from '@/components/share-panel/SharePanel.vue'
import StatGrid from './components/StatGrid.vue'
import { createCooperation, getKolDetail, getKolProducts } from '@/api/kol'
import { useMemberStore } from '@/store/useMember'
import { usePagedList } from '@/hooks/usePagedList'
import { formatAmount, formatCount } from '@/utils/format'
import { CATEGORY_LABEL_MAP } from '@/utils/constants'
import { SUBSCRIBE_TMPL_IDS, requestSubscribe } from '@/utils/platform'

const memberStore = useMemberStore()

const kolId = ref(0)
const detail = ref<KOL.Detail | null>(null)
const sharePanelRef = ref<InstanceType<typeof SharePanel>>()

const categoryLabel = computed(() =>
    detail.value ? CATEGORY_LABEL_MAP[detail.value.category] : '',
)

// 商品列表依赖 onLoad 拿到的 kolId，因此关闭 autoLoad 自行控制时机
const { state: products, fetchData: fetchProducts } = usePagedList<KOL.Product>({
    autoLoad: false,
    fetcher: params => getKolProducts({ ...params, kolId: kolId.value }),
})

async function fetchDetail(id: number) {
    try {
        const res = await getKolDetail(id)
        if (res.success) {
            detail.value = res.data
        } else {
            uni.showToast({ title: res.message || '加载失败', icon: 'none' })
        }
    } catch {
        // 拦截器已全局 toast
    }
}

async function handleInvite() {
    if (!(await memberStore.validateLogin())) return

    try {
        const res = await createCooperation(kolId.value)
        if (!res.success) {
            uni.showToast({ title: res.message || '邀约失败', icon: 'none' })
            return
        }
        // 必须在用户点击事件中触发；用户拒绝不阻塞主流程
        await requestSubscribe([SUBSCRIBE_TMPL_IDS.COOPERATION_RESULT])
        uni.showToast({ title: '邀约已提交', icon: 'success' })
    } catch {
        // 拦截器已全局 toast
    }
}

function openShare() {
    sharePanelRef.value?.open()
}

function handleShareSelect(channel: Option) {
    if (channel.value === 'link') {
        uni.setClipboardData({
            data: `https://m.example.com/kol/${kolId.value}`,
            success: () => uni.showToast({ title: '链接已复制', icon: 'none' }),
        })
    }
}

onLoad(option => {
    const id = Number(option?.id)
    if (!Number.isFinite(id) || id <= 0) {
        uni.showToast({ title: '达人不存在', icon: 'none' })
        return
    }
    kolId.value = id
    fetchDetail(id)
    fetchProducts(true)
})

onReachBottom(() => {
    fetchProducts()
})

onShareAppMessage(() => ({
    title: detail.value ? `推荐达人：${detail.value.name}` : '达人精选',
    path: `/pages-common/kol-detail/kol-detail?id=${kolId.value}&share_user_id=${
        memberStore.userInfo?.id ?? ''
    }`,
}))
</script>

<style lang="scss" scoped>
.kol-detail {
    min-height: 100vh;
    // 给底部固定操作栏留出空间
    padding-bottom: 160rpx;

    &__hero {
        display: flex;
        padding: $spacing-lg $spacing-md;
        background: $btn-color;
    }

    &__avatar {
        width: 140rpx;
        height: 140rpx;
        border-radius: 50%;
        background-color: rgba(255, 255, 255, 0.6);

        &--placeholder {
            display: flex;
            align-items: center;
            justify-content: center;
        }
    }

    &__avatar-text {
        font-size: $font-size-xl;
        font-weight: 600;
        color: $text-color-main;
    }

    &__title {
        flex: 1;
        min-width: 0;
        margin-left: $spacing-md;
    }

    &__name {
        display: block;
        font-size: $font-size-lg;
        font-weight: 600;
        color: $text-color-main;
    }

    &__meta {
        display: block;
        margin-top: $spacing-xs;
        font-size: $font-size-xs;
        color: $text-color-regular;
    }

    &__tags {
        display: flex;
        flex-wrap: wrap;
        margin-top: $spacing-sm;
    }

    &__tag {
        margin: 0 $spacing-xs $spacing-xs 0;
        padding: 4rpx 12rpx;
        border-radius: $radius-sm;
        background-color: rgba(255, 255, 255, 0.6);
        font-size: $font-size-xs;
        color: $text-color-main;
    }

    &__intro {
        display: block;
        margin-top: $spacing-md;
        font-size: $font-size-sm;
        line-height: 1.6;
        color: $text-color-regular;
    }

    &__section {
        font-size: $font-size-md;
        font-weight: 600;
        color: $text-color-main;
    }

    &__product {
        display: flex;
        min-height: 88rpx;
        padding: $spacing-md 0;

        @include hairline-border($border-color-light);
    }

    &__product-cover {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 140rpx;
        height: 140rpx;
        border-radius: $radius-base;
        background-color: $background-color;
    }

    &__product-cover-text {
        font-size: $font-size-xl;
        font-weight: 600;
        color: $text-color-main;
    }

    &__product-info {
        display: flex;
        flex: 1;
        min-width: 0;
        flex-direction: column;
        justify-content: space-between;
        margin-left: $spacing-md;
    }

    &__product-title {
        font-size: $font-size-sm;
        color: $text-color-main;
    }

    &__product-price {
        font-size: $font-size-md;
        font-weight: 600;
        color: $primary-color-dark;
    }

    &__product-sales {
        font-size: $font-size-xs;
        color: $text-color-secondary;
    }

    &__footer {
        position: fixed;
        right: 0;
        bottom: 0;
        left: 0;
        z-index: 10;
        background-color: #ffffff;
        box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.04);
    }

    &__footer-inner {
        display: flex;
        align-items: center;
        padding: $spacing-sm $spacing-md;
    }

    &__share {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 160rpx;
        min-height: 88rpx;
        border-radius: $radius-round;
        background-color: $background-color;
    }

    &__share-text {
        font-size: $font-size-base;
        color: $text-color-main;
    }

    &__invite {
        display: flex;
        flex: 1;
        align-items: center;
        justify-content: center;
        min-height: 88rpx;
        margin-left: $spacing-sm;
        border-radius: $radius-round;
        background: $btn-color;
    }

    &__invite-text {
        font-size: $font-size-base;
        font-weight: 600;
        color: $text-color-main;
    }
}
</style>
