import { request } from '@/utils/request'

export function getWallet(showLoading = true) {
    return request<Result<UserRes.Wallet>>({
        url: '/qiongqi/xd/frontend/wallet/info',
        method: 'GET',
        showLoading,
    })
}

export function getWithdrawRecords(params: PageParam) {
    return request<PageResult<UserRes.WithdrawRecord>>({
        url: '/qiongqi/xd/frontend/wallet/withdraw-records',
        method: 'GET',
        data: params,
        showLoading: false,
    })
}

export function createWithdraw(data: UserRes.WithdrawParams) {
    return request<Result<{ recordId: number }>>({
        url: '/qiongqi/xd/frontend/wallet/withdraw',
        method: 'POST',
        data,
    })
}
