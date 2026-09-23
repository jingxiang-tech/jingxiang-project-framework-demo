declare namespace Dashboard {
    interface Kpi {
        title: string
        value: number
        suffix: string
    }

    interface TrendPoint {
        month: string
        value: number
    }

    interface CategoryPoint {
        name: string
        value: number
    }

    interface Stats {
        kpis: Kpi[]
        trend: TrendPoint[]
        category: CategoryPoint[]
    }
}
