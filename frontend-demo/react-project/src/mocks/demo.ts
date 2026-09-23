import type { MockMethod } from 'vite-plugin-mock'
import Mock from 'mockjs'

const allItems = Array.from({ length: 57 }, (_, index) => ({
    id: index + 1,
    name: Mock.Random.ctitle(4, 10),
    owner: Mock.Random.cname(),
    status: Mock.Random.pick(['草稿', '审核中', '已授权', '已过期']),
    category: Mock.Random.pick(['商标', '专利', '著作权', '商业秘密']),
    updatedAt: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
    remark: Mock.Random.csentence(8, 20),
}))

export default [
    {
        url: '/api/demo/list',
        method: 'get',
        response: ({ query }: { query: Record<string, string> }) => {
            const page = Number(query.page || 1)
            const pageSize = Number(query.pageSize || 10)
            const keyword = (query.keyword || '').trim()

            const filtered = keyword
                ? allItems.filter(
                      item =>
                          item.name.includes(keyword) ||
                          item.owner.includes(keyword) ||
                          item.category.includes(keyword),
                  )
                : allItems

            const start = (page - 1) * pageSize
            const list = filtered.slice(start, start + pageSize)

            return {
                code: 0,
                message: 'ok',
                data: {
                    list,
                    total: filtered.length,
                    page,
                    pageSize,
                },
            }
        },
    },
] as MockMethod[]
