import { request } from '@/utils/request'

export function fetchDemoList(params: Demo.ListParams) {
    return request<Demo.ListResult>({
        url: '/api/demo/list',
        method: 'GET',
        params,
    })
}
