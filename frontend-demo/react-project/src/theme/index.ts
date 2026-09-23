import type { ThemeConfig } from 'antd'

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
            siderBg: '#17151F',
            triggerBg: '#17151F',
            headerBg: 'rgba(255, 252, 251, 0.82)',
            bodyBg: '#F7F5F2',
            headerHeight: 48,
        },
        Menu: {
            darkItemBg: 'transparent',
            darkSubMenuItemBg: 'transparent',
            darkItemSelectedBg: 'rgba(126, 114, 246, 0.18)',
            darkItemHoverBg: 'rgba(255, 255, 255, 0.06)',
            darkItemSelectedColor: '#E4E0FF',
            darkItemColor: 'rgba(255, 255, 255, 0.72)',
            itemBorderRadius: 6,
            itemMarginInline: 6,
            itemHeight: 32,
            itemMarginBlock: 2,
        },
        Button: {
            primaryShadow: 'none',
            borderRadius: 6,
        },
        Card: {
            borderRadiusLG: 10,
            paddingLG: 12,
        },
        Table: {
            headerBg: '#F3F0EA',
            rowHoverBg: 'rgba(126, 114, 246, 0.06)',
            borderColor: '#E8E4DE',
            headerColor: '#57534E',
            cellPaddingBlock: 10,
            cellPaddingInline: 12,
        },
        Drawer: {
            colorBgElevated: '#FFFcfb',
        },
    },
}
