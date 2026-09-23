<template>
    <slot />
</template>

<script lang="ts" setup>
    import { onMounted } from 'vue'
    import { App } from 'ant-design-vue'
    import { setMessageApi } from '@/utils/message'

    const { message } = App.useApp()

    onMounted(() => {
        setMessageApi(message)
    })
</script>
