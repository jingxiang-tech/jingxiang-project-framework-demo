import type { ThemeConfig } from 'ant-design-vue/es/config-provider/context'

/**
 * 与 styles/variables.scss 中的 --admin-* 变量保持一致，新增颜色需两处同步。
 * Ant Design Vue 4 的组件级 token 只开放 ComponentToken + AliasToken，
 * 表格表头等未开放的样式在对应组件的 scoped SCSS 中用 :deep() 覆盖。
 */
export const appTheme: ThemeConfig = {
    token: {
        colorPrimary: '#7E72F6',
        colorInfo: '#7E72F6',
        colorBgLayout: '#F7F5F2',
        colorBgContainer: '#FFFcfb',
        colorBorder: '#E8E4DE',
        colorBorderSecondary: '#E8E4DE',
        colorText: '#1C1917',
        colorTextSecondary: '#78716C',
        colorTextTertiary: '#A8A29E',
        borderRadius: 10,
        fontFamily:
            '"Outfit", "PingFang SC", "Noto Sans SC", "Helvetica Neue", Arial, sans-serif',
        controlHeight: 30,
        wireframe: false,
    },
    components: {
        Layout: {
            colorBgHeader: '#17151F',
            colorBgTrigger: '#17151F',
            colorBgBody: '#F7F5F2',
        },
        Menu: {
            colorItemBg: 'transparent',
            colorSubItemBg: 'transparent',
            colorItemBgHover: 'rgba(126, 114, 246, 0.1)',
            colorItemBgSelected: 'rgba(126, 114, 246, 0.18)',
            radiusItem: 6,
            itemMarginInline: 6,
        },
        Button: {
            borderRadius: 6,
        },
        Card: {
            borderRadiusLG: 10,
            paddingLG: 12,
        },
        Drawer: {
            colorBgElevated: '#FFFcfb',
        },
    },
}

/** 图表配色，取自 --admin-primary / --admin-accent-* */
export const CHART_PALETTE: string[] = [
    '#7E72F6',
    '#A89BFF',
    '#C4B5A0',
    '#78716C',
    '#9CA3AF',
]
