import { reactive, ref } from 'vue'
import { onReachBottom } from '@dcloudio/uni-app'

export interface PagedListOptions<TItem> {
    fetcher: (params: PageParam) => Promise<PageResult<TItem>>
    length?: number
    // 关掉后可由页面自行控制首屏时机；onReachBottom 也随之一并关闭
    autoLoad?: boolean
}

// 项目分页列表核心模式：偏移量分页 + OrderData<T> 状态 + onReachBottom 触底加载。
// 查询条件由调用方在 fetcher 闭包里带上，条件变化时调用 fetchData(true) 重置。
export function usePagedList<TItem>(options: PagedListOptions<TItem>) {
    const { fetcher, length = 20, autoLoad = true } = options

    const pageParam = ref({ page: 1, length })
    // 显式标注为 OrderData<TItem[]>，避免 reactive 的 UnwrapRef 把泛型 TItem 拆包后无法回写
    const state: OrderData<TItem[]> = reactive({
        pageCount: 0,
        data: [],
        loading: false,
        hasNext: true,
    })

    async function fetchData(reset = false) {
        if (state.loading) return
        if (reset) {
            pageParam.value.page = 1
            state.hasNext = true
        }
        if (!state.hasNext) return

        state.loading = true
        try {
            const res = await fetcher({
                start: (pageParam.value.page - 1) * pageParam.value.length,
                length: pageParam.value.length,
            })
            if (res.success) {
                const list = res.data.data
                state.data = pageParam.value.page === 1 ? list : [...state.data, ...list]
                state.pageCount = res.data.total
                state.hasNext = state.data.length < res.data.total
                pageParam.value.page++
            }
        } catch {
            // 拦截器已全局 toast，此处静默
        } finally {
            state.loading = false
        }
    }

    if (autoLoad) {
        fetchData(true)
        onReachBottom(() => fetchData())
    }

    return { state, pageParam, fetchData }
}
