import { request } from '@/utils/request'

export function fetchDashboardStats() {
    return request<Dashboard.Stats>({
        url: '/api/dashboard/stats',
        method: 'GET',
    })
}
