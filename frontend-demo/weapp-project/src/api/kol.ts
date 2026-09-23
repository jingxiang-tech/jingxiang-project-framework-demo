import { request } from '@/utils/request'

export function getDashboard(showLoading = true) {
    return request<Result<KOL.Dashboard>>({
        url: '/qiongqi/xd/frontend/kol/dashboard',
        method: 'GET',
        showLoading,
    })
}

export function getKolList(params: KOL.ListParams) {
    return request<PageResult<KOL.Item>>({
        url: '/qiongqi/xd/frontend/kol/list',
        method: 'GET',
        data: params,
        showLoading: false,
    })
}

export function getKolDetail(id: number, showLoading = true) {
    return request<Result<KOL.Detail>>({
        url: '/qiongqi/xd/frontend/kol/detail',
        method: 'GET',
        data: { id },
        showLoading,
    })
}

export function getKolProducts(params: KOL.ProductParams) {
    return request<PageResult<KOL.Product>>({
        url: '/qiongqi/xd/frontend/kol/products',
        method: 'GET',
        data: params,
        showLoading: false,
    })
}

export function createCooperation(kolId: number) {
    return request<Result<{ orderId: number }>>({
        url: '/qiongqi/xd/frontend/kol/cooperation',
        method: 'POST',
        data: { kolId },
    })
}
