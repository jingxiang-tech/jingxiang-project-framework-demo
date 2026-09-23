import type { MockMethod } from 'vite-plugin-mock'

export default [
    {
        url: '/api/dashboard/stats',
        method: 'get',
        response: () => {
            const trend = Array.from({ length: 12 }, (_, index) => ({
                month: `${index + 1}月`,
                value: Math.round(80 + Math.random() * 120),
            }))

            const category = [
                { name: '版权登记', value: 320 },
                { name: '授权管理', value: 240 },
                { name: '维权案件', value: 180 },
                { name: '合同归档', value: 150 },
            ]

            return {
                code: 0,
                message: 'ok',
                data: {
                    kpis: [
                        { title: '本月新增', value: 128, suffix: '个' },
                        { title: '待处理任务', value: 36, suffix: '项' },
                        { title: '进行中', value: 52, suffix: '份' },
                        { title: '本月收入', value: 86.4, suffix: '万' },
                    ],
                    trend,
                    category,
                },
            }
        },
    },
] as MockMethod[]
