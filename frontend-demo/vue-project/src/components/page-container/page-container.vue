<template>
    <div class="page-container">
        <div class="page-container__header">
            <div class="page-container__titles">
                <h1 class="page-container__title">{{ title }}</h1>
                <p v-if="description" class="page-container__description">
                    {{ description }}
                </p>
            </div>
            <div v-if="$slots.extra" class="page-container__extra">
                <slot name="extra" />
            </div>
        </div>
        <div class="page-container__body">
            <slot />
        </div>
    </div>
</template>

<script lang="ts" setup>
    interface Props {
        title: string
        description?: string
    }

    defineProps<Props>()
</script>

<style lang="scss" scoped>
    .page-container {
        &__header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 8px;
            margin-bottom: 12px;
            padding-bottom: 8px;
            border-bottom: 1px solid var(--admin-border);
        }

        &__titles {
            display: flex;
            flex-direction: column;
            min-width: 0;
        }

        &__title {
            margin: 0;
            color: var(--admin-ink);
            font-size: 16px;
            font-weight: 600;
            letter-spacing: -0.02em;
        }

        &__description {
            margin: 0;
            color: var(--admin-muted);
            font-size: 12px;
        }

        &__extra {
            display: flex;
            flex-shrink: 0;
            align-items: center;
            gap: 8px;
        }
    }
</style>
