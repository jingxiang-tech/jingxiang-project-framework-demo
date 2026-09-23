interface BaseResult<T = unknown> {
    code: number
    message: string
    data: T
}

interface BasePageResult<T = unknown> {
    success: boolean
    code: string
    msg: string
    message: string
    data: {
        data: T[]
        length: number
        start: number
        total: number
    }
}
