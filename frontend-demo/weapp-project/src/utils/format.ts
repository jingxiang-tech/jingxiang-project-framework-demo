import dayjs from 'dayjs'

const TEN_THOUSAND = 10000

// 粉丝 / 播放量等大数字缩写
export function formatCount(value: number) {
    if (!Number.isFinite(value) || value <= 0) return '0'
    return value >= TEN_THOUSAND ? `${(value / TEN_THOUSAND).toFixed(1)}万` : String(value)
}

// 金额：后端以「分」为单位下发，前端只做展示换算
export function formatAmount(fen: number) {
    if (!Number.isFinite(fen)) return '0.00'
    return (fen / 100).toFixed(2)
}

// 日期格式化统一走 dayjs，禁止手写
export function formatDate(value: string | number | Date, template = 'YYYY-MM-DD') {
    const date = dayjs(value)
    return date.isValid() ? date.format(template) : '-'
}

export function formatDateTime(value: string | number | Date) {
    return formatDate(value, 'YYYY-MM-DD HH:mm')
}
