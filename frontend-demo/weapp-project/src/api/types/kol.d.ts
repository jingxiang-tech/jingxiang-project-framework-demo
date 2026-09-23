declare namespace KOL {
    type Category = 'beauty' | 'food' | 'digital' | 'life' | 'mother'

    interface Item {
        id: number
        name: string
        avatar: string
        fans: number
        category: Category
        // 近 30 天带货销售额，单位：分
        salesAmount: number
        // 合作报价，单位：分
        price: number
        tags: string[]
    }

    interface ListParams extends PageParam {
        keyword?: string
        category?: Category | ''
    }

    interface Detail extends Item {
        intro: string
        // 近 30 天数据
        videoCount: number
        averageViews: number
        conversionRate: number
        cooperationCount: number
    }

    interface Product {
        id: number
        kolId: number
        title: string
        cover: string
        // 单位：分
        price: number
        sales: number
    }

    interface ProductParams extends PageParam {
        kolId: number
    }

    interface Dashboard {
        bannerList: string[]
        // 平台概览
        kolTotal: number
        orderTotal: number
        // 单位：分
        gmvTotal: number
        recommendList: Item[]
        // 审核期开关：为 true 时前端隐藏提现等敏感入口
        weappStatus: boolean
    }
}
