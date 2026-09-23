declare namespace UserRes {
    interface Info {
        id: number
        nickname: string
        avatar: string
        mobile: string
        // 身份：机构 / 达人 / 商家
        role: 'agency' | 'kol' | 'merchant'
        inviteUserId?: number
    }

    interface LoginParams {
        code: string
        anonymousCode?: string
        platform: 'wechat_mini' | 'douyin_mini'
        // 邀请链路参数，从启动 query 透传
        agencyInviteId?: string
    }

    interface LoginResult {
        accessToken: string
        // 微信登录失败 code 50064：需要绑定手机号
        needBindMobile: boolean
        userInfo: Info
    }

    interface BindMobileParams {
        // button open-type="getPhoneNumber" 返回的加密数据，由后端解密
        encryptedData: string
        iv: string
    }

    interface Wallet {
        // 单位：分
        balance: number
        frozen: number
        totalIncome: number
        // 单次最低提现额度，单位：分
        minWithdraw: number
    }

    interface WithdrawParams {
        // 单位：分
        amount: number
        accountType: 'wechat' | 'bank'
        account: string
        realName: string
    }

    interface WithdrawRecord {
        id: number
        amount: number
        accountType: 'wechat' | 'bank'
        account: string
        status: 'pending' | 'success' | 'failed'
        createdAt: string
        remark: string
    }
}
