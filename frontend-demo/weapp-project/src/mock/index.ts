// 演示用本地数据源：仅在 VITE_USE_MOCK=true 时由 utils/request 动态 import，
// 生产构建会被静态常量折叠掉。接后端时删除本目录并把 VITE_USE_MOCK 置为 false 即可。

import dayjs from 'dayjs'
import type { RequestOptions } from '@/utils/request'

const LATENCY = 250
const KOL_TOTAL = 60
const PRODUCT_TOTAL = 32
const RECORD_TOTAL = 43

const CATEGORIES: KOL.Category[] = ['beauty', 'food', 'digital', 'life', 'mother']

const SURNAMES = ['林', '苏', '陈', '周', '许', '沈', '郑', '黄', '吴', '李', '张', '刘']
const GIVEN_NAMES = [
    '小满',
    '知夏',
    '一诺',
    '清和',
    '念安',
    '以南',
    '未晞',
    '嘉言',
    '疏影',
    '望舒',
    '既明',
    '鹿鸣',
]
const TAG_POOL = [
    '高转化',
    '直播带货',
    '短视频种草',
    '品牌合作',
    '下沉市场',
    '年轻女性',
    '宝妈群体',
    '数码发烧',
    '测评向',
    '剧情号',
]
const PRODUCT_PREFIX = [
    '轻食代餐',
    '氨基酸洁面',
    '便携榨汁杯',
    '无线降噪耳机',
    '婴儿湿巾',
    '保温焖烧杯',
]

// 固定种子的伪随机，保证每次进入页面数据一致
function createRandom(seed: number) {
    let value = seed
    return () => {
        value = (value * 1103515245 + 12345) % 2147483648
        return value / 2147483648
    }
}

function pick<T>(list: T[], random: () => number) {
    return list[Math.floor(random() * list.length) % list.length]
}

function toNumber(value: unknown, fallback = 0) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : fallback
}

function toText(value: unknown) {
    return typeof value === 'string' ? value : ''
}

function delay(ms: number) {
    return new Promise<void>(resolve => setTimeout(resolve, ms))
}

function ok<T>(data: T, message = 'ok'): Result<T> {
    return { status: 200, code: 0, message, success: true, data }
}

function fail(message: string, code = 500): Result<null> {
    return { status: 200, code, message, success: false, data: null }
}

function paginate<T>(list: T[], start: number, length: number): PageResult<T> {
    return {
        success: true,
        data: {
            data: list.slice(start, start + length),
            total: list.length,
            start,
            length,
        },
    }
}

// 头像留空，由 KolCard 的首字母占位兜底；真实项目走 OSS CDN
const KOL_LIST: KOL.Item[] = Array.from({ length: KOL_TOTAL }, (_, index) => {
    const random = createRandom(index + 7)
    const id = index + 1
    return {
        id,
        name: `${pick(SURNAMES, random)}${pick(GIVEN_NAMES, random)}`,
        avatar: '',
        fans: Math.floor(random() * 480 + 3) * 10000,
        category: CATEGORIES[index % CATEGORIES.length],
        salesAmount: Math.floor(random() * 900 + 50) * 100000,
        price: Math.floor(random() * 180 + 5) * 10000,
        tags: [pick(TAG_POOL, random), pick(TAG_POOL, random)].filter(
            (tag, i, arr) => arr.indexOf(tag) === i,
        ),
    }
})

function buildProducts(kolId: number): KOL.Product[] {
    return Array.from({ length: PRODUCT_TOTAL }, (_, index) => {
        const random = createRandom(kolId * 100 + index + 3)
        return {
            id: kolId * 1000 + index + 1,
            kolId,
            title: `${pick(PRODUCT_PREFIX, random)} · 第 ${index + 1} 期专场`,
            cover: '',
            price: Math.floor(random() * 300 + 19) * 100,
            sales: Math.floor(random() * 9000 + 200),
        }
    })
}

function buildRecords(): UserRes.WithdrawRecord[] {
    const statuses: UserRes.WithdrawRecord['status'][] = ['pending', 'success', 'failed']
    return Array.from({ length: RECORD_TOTAL }, (_, index) => {
        const random = createRandom(index + 31)
        const isWechat = random() > 0.5
        return {
            id: index + 1,
            amount: Math.floor(random() * 200 + 5) * 10000,
            accountType: isWechat ? 'wechat' : 'bank',
            account: isWechat ? '微信零钱' : `招商银行(${Math.floor(random() * 9000 + 1000)})`,
            status: statuses[index % statuses.length],
            createdAt: dayjs()
                .subtract(index, 'day')
                .hour(9 + (index % 10))
                .minute(index % 60)
                .format('YYYY-MM-DD HH:mm:ss'),
            remark: index % 4 === 0 ? '预计 1-3 个工作日到账' : '',
        }
    })
}

const WITHDRAW_RECORDS = buildRecords()

// 金额字段统一以「分」为单位
let WALLET: UserRes.Wallet = {
    balance: 38650,
    frozen: 12000,
    totalIncome: 1286400,
    minWithdraw: 10000,
}

const MOCK_USER: UserRes.Info = {
    id: 10086,
    nickname: '示例用户',
    avatar: '',
    mobile: '138****8888',
    role: 'agency',
}

function route(url: string, method: string, data: Record<string, unknown>): unknown {
    if (url.endsWith('/kol/dashboard')) {
        return ok<KOL.Dashboard>({
            bannerList: [],
            kolTotal: KOL_TOTAL,
            orderTotal: 1286,
            gmvTotal: 42860000,
            recommendList: KOL_LIST.slice(0, 6),
            weappStatus: false,
        })
    }

    if (url.endsWith('/kol/list')) {
        const keyword = toText(data.keyword).trim()
        const category = toText(data.category)
        const filtered = KOL_LIST.filter(item => {
            const hitKeyword = !keyword || item.name.includes(keyword)
            const hitCategory = !category || item.category === category
            return hitKeyword && hitCategory
        })
        return paginate(filtered, toNumber(data.start), toNumber(data.length, 20))
    }

    if (url.endsWith('/kol/detail')) {
        const id = toNumber(data.id, 1)
        const base = KOL_LIST.find(item => item.id === id) ?? KOL_LIST[0]
        const random = createRandom(id + 11)
        return ok<KOL.Detail>({
            ...base,
            intro: `${base.name}，专注${base.category}领域内容创作，粉丝画像以 25-35 岁女性为主，近 30 天平均互动率 ${(random() * 8 + 2).toFixed(1)}%。`,
            videoCount: Math.floor(random() * 40 + 10),
            averageViews: Math.floor(random() * 80 + 5) * 10000,
            conversionRate: Number((random() * 8 + 2).toFixed(2)),
            cooperationCount: Math.floor(random() * 120 + 8),
        })
    }

    if (url.endsWith('/kol/products')) {
        const kolId = toNumber(data.kolId, 1)
        return paginate(buildProducts(kolId), toNumber(data.start), toNumber(data.length, 20))
    }

    if (url.endsWith('/kol/cooperation')) {
        return method === 'POST' ? ok({ orderId: Date.now() }) : fail('请求方法不支持')
    }

    if (url.endsWith('/user/login')) {
        return ok<UserRes.LoginResult>({
            accessToken: `mock-token-${Date.now()}`,
            needBindMobile: false,
            userInfo: MOCK_USER,
        })
    }

    if (url.endsWith('/user/info')) {
        return method === 'PUT' ? ok<null>(null) : ok<UserRes.Info>(MOCK_USER)
    }

    if (url.endsWith('/user/bind-mobile')) {
        return ok<null>(null)
    }

    if (url.endsWith('/wallet/info')) {
        return ok<UserRes.Wallet>(WALLET)
    }

    if (url.endsWith('/wallet/withdraw-records')) {
        return paginate(WITHDRAW_RECORDS, toNumber(data.start), toNumber(data.length, 20))
    }

    if (url.endsWith('/wallet/withdraw')) {
        const amount = toNumber(data.amount)
        if (amount < WALLET.minWithdraw) {
            return fail(`单次提现不得低于 ¥${(WALLET.minWithdraw / 100).toFixed(2)}`)
        }
        if (amount > WALLET.balance) {
            return fail('可提现余额不足')
        }
        WALLET = { ...WALLET, balance: WALLET.balance - amount, frozen: WALLET.frozen + amount }
        return ok({ recordId: Date.now() })
    }

    return fail(`未匹配的 mock 接口：${url}`, 404)
}

export async function matchMock<T>(options: RequestOptions): Promise<T> {
    const { url, method = 'GET' } = options
    const data = (options.data ?? {}) as Record<string, unknown>
    await delay(LATENCY)
    return route(url, method, data) as T
}
