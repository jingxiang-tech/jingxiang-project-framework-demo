// 全局响应类型：无需 import。

interface Result<T = unknown> {
    status: number
    code: number
    message: string
    success: boolean
    data: T
}

interface PageResult<T = unknown> {
    success: boolean
    data: {
        data: T[]
        total: number
        start: number
        length: number
    }
}

interface PageParam {
    start: number
    length: number
}
