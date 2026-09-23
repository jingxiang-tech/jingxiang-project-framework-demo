<template>
    <AConfigProvider :locale="zhCN" :theme="appTheme">
        <AAntdApp>
            <MessageBridge>
                <RouterView />
            </MessageBridge>
        </AAntdApp>
    </AConfigProvider>
</template>

<script lang="ts" setup>
    import { App as AAntdApp, ConfigProvider as AConfigProvider } from 'ant-design-vue'
    import zhCN from 'ant-design-vue/es/locale/zh_CN'
    import MessageBridge from '@/components/message-bridge/message-bridge.vue'
    import { appTheme } from '@/theme'
</script>
