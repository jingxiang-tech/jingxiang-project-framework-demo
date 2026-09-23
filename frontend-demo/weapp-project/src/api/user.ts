import { request, uploadFile } from '@/utils/request'

export function login(data: UserRes.LoginParams) {
    return request<Result<UserRes.LoginResult>>({
        url: '/qiongqi/xd/frontend/user/login',
        method: 'POST',
        data,
    })
}

export function getMemberInfo(showLoading = true) {
    return request<Result<UserRes.Info>>({
        url: '/qiongqi/xd/frontend/user/info',
        method: 'GET',
        showLoading,
    })
}

export function updateUserInfo(data: { nickname: string; avatar: string }) {
    return request<Result<null>>({
        url: '/qiongqi/xd/frontend/user/info',
        method: 'PUT',
        data,
    })
}

export function bindMobile(data: UserRes.BindMobileParams) {
    return request<Result<null>>({
        url: '/qiongqi/xd/frontend/user/bind-mobile',
        method: 'POST',
        data,
    })
}

export function uploadAvatar(filePath: string) {
    return uploadFile<Result<{ url: string }>>(filePath, 'file', { scene: 'avatar' })
}
