import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
    Button,
    Form,
    Grid,
    Input,
    Space,
    Table,
    type FormInstance,
    type TableProps,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'

export interface ProTableSearchField {
    name: string
    label?: string
    placeholder?: string
}

export interface ProTableQueryParams {
    page: number
    pageSize: number
    [key: string]: unknown
}

export interface ProTableResult<T> {
    list: T[]
    total: number
}

interface ProTableProps<T extends object> {
    columns: ColumnsType<T>
    queryKey: string
    fetcher: (params: ProTableQueryParams) => Promise<ProTableResult<T>>
    searchFields?: ProTableSearchField[]
    rowKey?: TableProps<T>['rowKey']
    scrollX?: number | string
}

export default function ProTable<T extends object>({
    columns,
    queryKey,
    fetcher,
    searchFields = [],
    rowKey = 'id',
    scrollX = 960,
}: ProTableProps<T>) {
    const [form] = Form.useForm()
    const screens = Grid.useBreakpoint()
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [filters, setFilters] = useState<Record<string, unknown>>({})

    const queryParams = useMemo(
        () => ({
            page,
            pageSize,
            ...filters,
        }),
        [page, pageSize, filters],
    )

    const { data, isFetching } = useQuery({
        queryKey: [queryKey, queryParams],
        queryFn: () => fetcher(queryParams),
        placeholderData: previous => previous,
    })

    const responsiveColumns = useMemo(() => {
        return columns.filter(column => {
            const hiddenOn = (column as { hiddenOn?: Array<'xs' | 'sm' | 'md'> }).hiddenOn
            if (!hiddenOn?.length) return true
            if (hiddenOn.includes('xs') && !screens.sm) return false
            if (hiddenOn.includes('sm') && !screens.md) return false
            if (hiddenOn.includes('md') && !screens.lg) return false
            return true
        })
    }, [columns, screens])

    const handleSearch = (values: Record<string, unknown>) => {
        setFilters(values)
        setPage(1)
    }

    const handleReset = (formInstance: FormInstance) => {
        formInstance.resetFields()
        setFilters({})
        setPage(1)
    }

    return (
        <Space orientation="vertical" size={8} style={{ width: '100%' }}>
            {searchFields.length > 0 && (
                <Form
                    form={form}
                    layout={screens.md ? 'inline' : 'vertical'}
                    onFinish={handleSearch}>
                    {searchFields.map(field => (
                        <Form.Item key={field.name} name={field.name} label={field.label}>
                            <Input
                                allowClear
                                placeholder={field.placeholder}
                                style={{ width: screens.md ? 220 : '100%' }}
                            />
                        </Form.Item>
                    ))}
                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit">
                                查询
                            </Button>
                            <Button onClick={() => handleReset(form)}>重置</Button>
                        </Space>
                    </Form.Item>
                </Form>
            )}

            <Table<T>
                rowKey={rowKey}
                loading={isFetching}
                columns={responsiveColumns}
                dataSource={data?.list ?? []}
                scroll={{ x: scrollX }}
                pagination={{
                    current: page,
                    pageSize,
                    total: data?.total ?? 0,
                    showSizeChanger: true,
                    showTotal: total => `共 ${total} 条`,
                    onChange: (nextPage, nextPageSize) => {
                        setPage(nextPage)
                        setPageSize(nextPageSize)
                    },
                }}
            />
        </Space>
    )
}
