<template>
    <div class="brand-mark" :class="{ 'brand-mark--collapsed': collapsed }">
        <span class="brand-mark__mark" aria-hidden="true">V</span>
        <div v-if="!collapsed" class="brand-mark__copy">
            <span class="brand-mark__title">Vue Demo</span>
            <span class="brand-mark__subtitle">Framework</span>
        </div>
    </div>
</template>

<script lang="ts" setup>
    interface Props {
        collapsed?: boolean
    }

    withDefaults(defineProps<Props>(), {
        collapsed: false,
    })
</script>

<style lang="scss" scoped>
    .brand-mark {
        display: flex;
        align-items: center;
        gap: 8px;
        height: var(--admin-header-height);
        padding: 0 12px;
        border-bottom: 1px solid var(--admin-sider-divider);

        &--collapsed {
            justify-content: center;
            padding: 0;
        }

        &__mark {
            display: inline-flex;
            flex-shrink: 0;
            align-items: center;
            justify-content: center;
            width: 28px;
            height: 28px;
            border-radius: var(--admin-radius-sm);
            background: var(--admin-primary);
            color: var(--admin-inverse);
            font-size: 12px;
            font-weight: 600;
            letter-spacing: 0.02em;
            box-shadow: 0 4px 10px var(--admin-primary-shadow);
        }

        &__copy {
            display: flex;
            flex-direction: column;
            min-width: 0;
            line-height: 1.2;
        }

        &__title {
            color: var(--admin-inverse);
            font-size: 14px;
            font-weight: 600;
            white-space: nowrap;
        }

        &__subtitle {
            color: var(--admin-sider-muted);
            font-size: 10px;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            white-space: nowrap;
        }
    }
</style>
