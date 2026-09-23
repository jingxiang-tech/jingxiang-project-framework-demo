import { ref } from 'vue'
import { getKolList } from '@/api/kol'
import { usePagedList } from './usePagedList'

export function useKolData(autoLoad = true) {
    const keyword = ref('')
    const category = ref<KOL.Category | ''>('')

    const { state, pageParam, fetchData } = usePagedList<KOL.Item>({
        autoLoad,
        length: 20,
        fetcher: params =>
            getKolList({ ...params, keyword: keyword.value, category: category.value }),
    })

    // 筛选条件变化后重置到第一页
    function reload() {
        return fetchData(true)
    }

    return { state, pageParam, keyword, category, fetchData, reload }
}
