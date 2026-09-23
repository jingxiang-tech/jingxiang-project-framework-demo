export const PAGE_LENGTH = 20

export const CATEGORY_LABEL_MAP: Record<KOL.Category, string> = {
    beauty: '美妆个护',
    food: '食品生鲜',
    digital: '数码家电',
    life: '生活家居',
    mother: '母婴亲子',
}

export const CATEGORY_OPTIONS: Option[] = [
    { label: '全部', value: '' },
    { label: CATEGORY_LABEL_MAP.beauty, value: 'beauty' },
    { label: CATEGORY_LABEL_MAP.food, value: 'food' },
    { label: CATEGORY_LABEL_MAP.digital, value: 'digital' },
    { label: CATEGORY_LABEL_MAP.life, value: 'life' },
    { label: CATEGORY_LABEL_MAP.mother, value: 'mother' },
]

export const WITHDRAW_STATUS_LABEL_MAP: Record<UserRes.WithdrawRecord['status'], string> = {
    pending: '处理中',
    success: '已到账',
    failed: '已驳回',
}

export const ACCOUNT_TYPE_OPTIONS: Option[] = [
    { label: '微信零钱', value: 'wechat' },
    { label: '银行卡', value: 'bank' },
]

export const SMS_COUNTDOWN_SECONDS = 60
