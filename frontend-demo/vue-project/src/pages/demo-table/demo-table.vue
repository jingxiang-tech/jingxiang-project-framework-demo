<template>
    <PageContainer title="示例表格" description="ProTable + Mock 数据演示">
        <ProTable
            query-key="demo-list"
            :columns="columns"
            :search-fields="searchFields"
            :fetcher="fetchList">
            <template #bodyCell="{ column, record }">
                <a-tag
                    v-if="column.key === 'status'"
                    :color="STATUS_COLOR[record.status]">
                    {{ record.status }}
                </a-tag>
                <a-space v-else-if="column.key === 'actions'" :size="4">
                    <a-button type="link" size="small">查看</a-button>
                    <a-button type="link" size="small">编辑</a-button>
                </a-space>
            </template>
        </ProTable>
    </PageContainer>
</template>

<script lang="ts" setup>
    import type { TableColumnsType } from 'ant-design-vue'
    import { fetchDemoList } from '@/api/demo'
    import PageContainer from '@/components/page-container/page-container.vue'
    import ProTable from '@/components/pro-table/pro-table.vue'

    type ResponsiveColumn = TableColumnsType<Demo.Item>[number] & {
        hiddenOn?: Array<'xs' | 'sm' | 'md'>
    }

    interface QueryParams {
        page: number
        pageSize: number
        [key: string]: unknown
    }

    const STATUS_COLOR: Record<string, string> = {
        草稿: 'default',
        审核中: 'processing',
        已授权: 'success',
        已过期: 'error',
    }

    const searchFields = [
        { name: 'keyword', label: '关键词', placeholder: '名称 / 负责人 / 类型' },
    ]

    const columns: ResponsiveColumn[] = [
        { title: '名称', dataIndex: 'name', key: 'name', fixed: 'left', width: 160 },
        { title: '负责人', dataIndex: 'owner', key: 'owner', width: 100 },
        { title: '类型', dataIndex: 'category', key: 'category', width: 100 },
        { title: '状态', dataIndex: 'status', key: 'status', width: 110 },
        {
            title: '更新时间',
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            width: 180,
            hiddenOn: ['xs'],
        },
        {
            title: '备注',
            dataIndex: 'remark',
            key: 'remark',
            width: 240,
            ellipsis: true,
            hiddenOn: ['xs', 'sm'],
        },
        { title: '操作', key: 'actions', fixed: 'right', width: 140 },
    ]

    async function fetchList(params: QueryParams) {
        const result = await fetchDemoList({
            page: params.page,
            pageSize: params.pageSize,
            keyword: typeof params.keyword === 'string' ? params.keyword : undefined,
        })

        return { list: result.list, total: result.total }
    }
</script>
