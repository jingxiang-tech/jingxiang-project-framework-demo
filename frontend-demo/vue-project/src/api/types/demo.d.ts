declare namespace Demo {
    interface Item {
        id: number
        name: string
        owner: string
        status: string
        category: string
        updatedAt: string
        remark: string
    }

    interface ListParams {
        page: number
        pageSize: number
        keyword?: string
    }

    interface ListResult {
        list: Item[]
        total: number
        page: number
        pageSize: number
    }
}
