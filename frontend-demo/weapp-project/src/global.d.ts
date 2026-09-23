// 全局通用类型：无需 import，全项目可用。
// 约定：通用类型放这里，接口类型放 api/types/*.d.ts（declare namespace）。

interface OrderData<T> {
    pageCount: number
    data: T
    loading: boolean
    hasNext: boolean
    total?: number
}

interface Option {
    label: string
    value: string | number
}

interface OptionParam {
    agency_invite_id?: string
    invite_user_id?: string
    share_user_id?: string
}
