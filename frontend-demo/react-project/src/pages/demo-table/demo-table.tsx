import { Button, Space, Tag } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { fetchDemoList } from '@/api/demo'
import PageContainer from '@/components/page-container/page-container'
import ProTable from '@/components/pro-table/pro-table'

type ResponsiveColumn = ColumnsType<Demo.Item>[number] & {
    hiddenOn?: Array<'xs' | 'sm' | 'md'>
}

const statusColor: Record<string, string> = {
    草稿: 'default',
    审核中: 'processing',
    已授权: 'success',
    已过期: 'error',
}

const columns: ResponsiveColumn[] = [
    {
        title: '名称',
        dataIndex: 'name',
        fixed: 'left',
        width: 160,
    },
    {
        title: '负责人',
        dataIndex: 'owner',
        width: 100,
    },
    {
        title: '类型',
        dataIndex: 'category',
        width: 100,
    },
    {
        title: '状态',
        dataIndex: 'status',
        width: 110,
        render: (status: string) => <Tag color={statusColor[status]}>{status}</Tag>,
    },
    {
        title: '更新时间',
        dataIndex: 'updatedAt',
        width: 180,
        hiddenOn: ['xs'],
    },
    {
        title: '备注',
        dataIndex: 'remark',
        width: 240,
        ellipsis: true,
        hiddenOn: ['xs', 'sm'],
    },
    {
        title: '操作',
        key: 'actions',
        fixed: 'right',
        width: 140,
        render: () => (
            <Space size="small">
                <Button type="link" size="small">
                    查看
                </Button>
                <Button type="link" size="small">
                    编辑
                </Button>
            </Space>
        ),
    },
]

export default function DemoTable() {
    return (
        <PageContainer title="示例表格" description="ProTable + Mock 数据演示">
            <ProTable<Demo.Item>
                queryKey="demo-list"
                columns={columns}
                searchFields={[
                    {
                        name: 'keyword',
                        label: '关键词',
                        placeholder: '名称 / 负责人 / 类型',
                    },
                ]}
                fetcher={async params => {
                    const result = await fetchDemoList({
                        page: params.page,
                        pageSize: params.pageSize,
                        keyword:
                            typeof params.keyword === 'string'
                                ? params.keyword
                                : undefined,
                    })
                    return {
                        list: result.list,
                        total: result.total,
                    }
                }}
            />
        </PageContainer>
    )
}
