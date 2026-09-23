<template>
    <view class="safe-area" />
</template>

<style lang="scss" scoped>
// 底部操作栏放在 SafeArea 之上，适配 iPhone 底部横条
.safe-area {
    width: 100%;
    height: constant(safe-area-inset-bottom);
    height: env(safe-area-inset-bottom);
}
</style>
