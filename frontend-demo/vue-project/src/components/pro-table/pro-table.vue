<template>
    <div class="pro-table">
        <a-form
            v-if="searchFields.length"
            class="pro-table__search"
            :model="formState"
            :layout="isCompact ? 'vertical' : 'inline'"
            @finish="handleSearch">
            <a-form-item
                v-for="field in searchFields"
                :key="field.name"
                :name="field.name"
                :label="field.label">
                <a-input
                    v-model:value="formState[field.name]"
                    allow-clear
                    :placeholder="field.placeholder"
                    :style="{ width: isCompact ? '100%' : '220px' }" />
            </a-form-item>
            <a-form-item>
                <a-space>
                    <a-button type="primary" html-type="submit">查询</a-button>
                    <a-button @click="handleReset">重置</a-button>
                </a-space>
            </a-form-item>
        </a-form>

        <a-table
            :row-key="rowKey"
            :loading="isFetching"
            :columns="responsiveColumns"
            :data-source="data?.list ?? []"
            :scroll="{ x: scrollX }"
            :pagination="pagination"
            @change="handleTableChange">
            <template v-for="(_, name) in $slots" #[name]="slotProps">
                <slot :name="name" v-bind="slotProps ?? {}" />
            </template>
        </a-table>
    </div>
</template>

<script lang="ts" setup generic="T extends object">
    import { computed, reactive, ref } from 'vue'
    import { useQuery } from '@tanstack/vue-query'
    import type { TableColumnsType, TablePaginationConfig } from 'ant-design-vue'
    import { useResponsive } from '@/composables/useResponsive'

    type ResponsiveColumn<T> = TableColumnsType<T>[number] & {
        hiddenOn?: Array<'xs' | 'sm' | 'md'>
    }

    interface ProTableQueryParams {
        page: number
        pageSize: number
        [key: string]: unknown
    }

    interface Props {
        queryKey: string
        columns: ResponsiveColumn<T>[]
        fetcher: (params: ProTableQueryParams) => Promise<{ list: T[]; total: number }>
        searchFields?: Array<{ name: string; label?: string; placeholder?: string }>
        rowKey?: string
        scrollX?: number | string
    }

    const props = withDefaults(defineProps<Props>(), {
        searchFields: () => [],
        rowKey: 'id',
        scrollX: 960,
    })

    const { screens, isCompact } = useResponsive()

    const page = ref(1)
    const pageSize = ref(10)
    const formState = reactive<Record<string, string>>({})
    const filters = ref<Record<string, string>>({})

    const queryParams = computed<ProTableQueryParams>(() => ({
        page: page.value,
        pageSize: pageSize.value,
        ...filters.value,
    }))

    const { data, isFetching } = useQuery({
        queryKey: computed(() => [props.queryKey, queryParams.value]),
        queryFn: () => props.fetcher(queryParams.value),
        placeholderData: previous => previous,
    })

    const responsiveColumns = computed(() =>
        props.columns.filter(column => {
            const hiddenOn = column.hiddenOn
            if (!hiddenOn?.length) return true
            if (hiddenOn.includes('xs') && !screens.value.sm) return false
            if (hiddenOn.includes('sm') && !screens.value.md) return false
            if (hiddenOn.includes('md') && !screens.value.lg) return false
            return true
        }),
    )

    const pagination = computed<TablePaginationConfig>(() => ({
        current: page.value,
        pageSize: pageSize.value,
        total: data.value?.total ?? 0,
        showSizeChanger: true,
        showTotal: (total: number) => `共 ${total} 条`,
    }))

    function handleTableChange(info: TablePaginationConfig) {
        page.value = info.current ?? 1
        pageSize.value = info.pageSize ?? 10
    }

    function handleSearch() {
        filters.value = { ...formState }
        page.value = 1
    }

    function handleReset() {
        for (const field of props.searchFields) {
            formState[field.name] = ''
        }
        filters.value = {}
        page.value = 1
    }
</script>

<style lang="scss" scoped>
    .pro-table {
        display: flex;
        flex-direction: column;
        gap: 8px;

        &__search {
            :deep(.ant-form-item) {
                margin-bottom: 8px;
            }
        }

        :deep(.ant-table-thead > tr > th) {
            background: var(--admin-table-header-bg);
            color: var(--admin-muted);
        }

        :deep(.ant-table-tbody > tr:hover > td) {
            background: var(--admin-table-row-hover);
        }
    }
</style>
