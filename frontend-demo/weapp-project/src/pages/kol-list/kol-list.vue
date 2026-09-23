<template>
    <view class="kol-list">
        <view class="kol-list__search">
            <input
                v-model="keyword"
                class="kol-list__input"
                type="text"
                placeholder="搜索达人昵称"
                placeholder-class="kol-list__placeholder"
                confirm-type="search"
                @confirm="handleSearch"
            />
            <view class="kol-list__search-btn" @click="handleSearch">
                <text class="kol-list__search-text">搜索</text>
            </view>
        </view>

        <FilterBar v-model="category" @change="handleSearch" />

        <view class="kol-list__body">
            <KolCard v-for="item in state.data" :key="item.id" :item="item" @click="goDetail" />

            <view v-if="!state.loading && !state.data.length" class="empty">
                <text class="empty__text">没有匹配的达人，换个关键词试试</text>
            </view>

            <view v-else-if="state.loading" class="list-tip">加载中...</view>
            <view v-else-if="!state.hasNext" class="list-tip">共 {{ state.pageCount }} 位达人</view>
        </view>
    </view>
</template>

<script lang="ts" setup>
import { onPullDownRefresh } from '@dcloudio/uni-app'
import KolCard from '@/components/kol-card/KolCard.vue'
import FilterBar from './components/FilterBar.vue'
import { useKolData } from '@/hooks/useKolData'

// autoLoad 为 true 时，composable 内部会注册 onReachBottom 做触底分页
const { state, keyword, category, fetchData } = useKolData()

function handleSearch() {
    fetchData(true)
}

function goDetail(item: KOL.Item) {
    uni.navigateTo({ url: `/pages-common/kol-detail/kol-detail?id=${item.id}` })
}

onPullDownRefresh(async () => {
    await fetchData(true)
    uni.stopPullDownRefresh()
})
</script>

<style lang="scss" scoped>
.kol-list {
    min-height: 100vh;
    padding-bottom: $spacing-lg;

    &__search {
        display: flex;
        align-items: center;
        padding: $spacing-sm $spacing-md;
    }

    &__input {
        flex: 1;
        min-width: 0;
        height: 72rpx;
        padding: 0 $spacing-md;
        border-radius: $radius-round;
        background-color: #ffffff;
        font-size: $font-size-sm;
        color: $text-color-main;
    }

    &__placeholder {
        color: $text-color-placeholder;
    }

    &__search-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 120rpx;
        height: 72rpx;
        margin-left: $spacing-sm;
        border-radius: $radius-round;
        background: $btn-color;
    }

    &__search-text {
        font-size: $font-size-sm;
        color: $text-color-main;
    }

    &__body {
        padding: 0 $spacing-md;
    }
}
</style>
