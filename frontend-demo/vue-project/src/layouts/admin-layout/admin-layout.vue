<template>
    <a-layout class="admin-layout">
        <a-layout-sider
            v-if="!isMobile"
            class="admin-layout__sider"
            collapsible
            :trigger="null"
            :collapsed="collapsed"
            :width="208"
            :collapsed-width="64">
            <BrandMark :collapsed="collapsed" />
            <a-menu
                class="admin-layout__menu"
                theme="dark"
                mode="inline"
                :selected-keys="selectedKeys"
                :items="menuItems"
                @click="handleMenuClick" />
        </a-layout-sider>

        <a-layout class="admin-layout__main">
            <a-layout-header class="admin-layout__header">
                <div class="admin-layout__header-left">
                    <a-button
                        type="text"
                        class="admin-layout__trigger"
                        @click="handleTrigger">
                        <template #icon>
                            <MenuUnfoldOutlined v-if="isMobile || collapsed" />
                            <MenuFoldOutlined v-else />
                        </template>
                    </a-button>
                    <div class="admin-layout__header-titles">
                        <span class="admin-layout__header-title">Vue 框架示例</span>
                        <span class="admin-layout__header-desc">前端工程化模板</span>
                    </div>
                </div>
            </a-layout-header>

            <a-layout-content class="admin-layout__content">
                <RouterView />
            </a-layout-content>
        </a-layout>

        <a-drawer
            title="菜单"
            placement="left"
            :width="260"
            :open="isMobile && mobileOpen"
            :body-style="{ padding: 0 }"
            @close="setMobileOpen(false)">
            <div class="admin-layout__drawer">
                <BrandMark />
                <a-menu
                    class="admin-layout__menu admin-layout__menu--light"
                    theme="light"
                    mode="inline"
                    :selected-keys="selectedKeys"
                    :items="menuItems"
                    @click="handleMenuClick" />
            </div>
        </a-drawer>
    </a-layout>
</template>

<script lang="ts" setup>
    import { computed, h, watch } from 'vue'
    import { useRoute, useRouter } from 'vue-router'
    import { storeToRefs } from 'pinia'
    import {
        DashboardOutlined,
        MenuFoldOutlined,
        MenuUnfoldOutlined,
        TableOutlined,
    } from '@ant-design/icons-vue'
    import type { ItemType } from 'ant-design-vue'
    import BrandMark from '@/components/brand-mark/brand-mark.vue'
    import { useResponsive } from '@/composables/useResponsive'
    import { useLayoutStore } from '@/stores'

    const menuItems: ItemType[] = [
        { key: '/dashboard', icon: () => h(DashboardOutlined), label: '仪表盘' },
        { key: '/demo/table', icon: () => h(TableOutlined), label: '示例表格' },
    ]

    const route = useRoute()
    const router = useRouter()
    const { isMobile } = useResponsive()

    const layoutStore = useLayoutStore()
    const { collapsed, mobileOpen } = storeToRefs(layoutStore)
    const { toggleCollapsed, setMobileOpen } = layoutStore

    const selectedKeys = computed(() => {
        const matched = menuItems.find(
            item => item && 'key' in item && route.path.startsWith(String(item.key)),
        )
        return [matched?.key ?? '/dashboard']
    })

    watch(isMobile, mobile => {
        if (!mobile) {
            setMobileOpen(false)
        }
    })

    function handleTrigger() {
        if (isMobile.value) {
            setMobileOpen(true)
        } else {
            toggleCollapsed()
        }
    }

    function handleMenuClick(info: { key: string | number }) {
        router.push(String(info.key))
        if (isMobile.value) {
            setMobileOpen(false)
        }
    }
</script>

<style lang="scss" scoped src="./admin-layout.scss"></style>
