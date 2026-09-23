import { useEffect, useMemo } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Button, Drawer, Grid, Layout, Menu, Typography } from 'antd'
import {
    DashboardOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    TableOutlined,
} from '@ant-design/icons'
import { useLayoutStore } from '@/stores'
import './admin-layout.scss'

const { Header, Sider, Content } = Layout

const menuItems = [
    {
        key: '/dashboard',
        icon: <DashboardOutlined />,
        label: '仪表盘',
    },
    {
        key: '/demo/table',
        icon: <TableOutlined />,
        label: '示例表格',
    },
]

function BrandMark({ collapsed }: { collapsed?: boolean }) {
    return (
        <div
            className={`admin-layout__logo${collapsed ? ' admin-layout__logo--collapsed' : ''}`}>
            <span className="admin-layout__logo-mark" aria-hidden>
                R
            </span>
            {!collapsed ? (
                <div className="admin-layout__logo-copy">
                    <Typography.Text className="admin-layout__logo-title">
                        React Demo
                    </Typography.Text>
                    <Typography.Text className="admin-layout__logo-subtitle">
                        Framework
                    </Typography.Text>
                </div>
            ) : null}
        </div>
    )
}

export default function AdminLayout() {
    const navigate = useNavigate()
    const location = useLocation()
    const screens = Grid.useBreakpoint()
    const isMobile = !screens.lg

    const collapsed = useLayoutStore(state => state.collapsed)
    const mobileOpen = useLayoutStore(state => state.mobileOpen)
    const toggleCollapsed = useLayoutStore(state => state.toggleCollapsed)
    const setMobileOpen = useLayoutStore(state => state.setMobileOpen)

    useEffect(() => {
        if (!isMobile) {
            setMobileOpen(false)
        }
    }, [isMobile, setMobileOpen])

    const selectedKeys = useMemo(() => {
        const matched = menuItems.find(item => location.pathname.startsWith(item.key))
        return [matched?.key ?? '/dashboard']
    }, [location.pathname])

    const handleMenuClick = ({ key }: { key: string }) => {
        navigate(key)
        if (isMobile) {
            setMobileOpen(false)
        }
    }

    const sideMenu = (themeMode: 'light' | 'dark' = 'dark') => (
        <Menu
            className="admin-layout__menu"
            theme={themeMode}
            mode="inline"
            selectedKeys={selectedKeys}
            items={menuItems}
            onClick={handleMenuClick}
        />
    )

    return (
        <Layout className="admin-layout">
            {!isMobile && (
                <Sider
                    className="admin-layout__sider"
                    trigger={null}
                    collapsible
                    collapsed={collapsed}
                    width={208}
                    collapsedWidth={64}>
                    <BrandMark collapsed={collapsed} />
                    {sideMenu('dark')}
                </Sider>
            )}

            <Layout className="admin-layout__main">
                <Header className="admin-layout__header">
                    <div className="admin-layout__header-left">
                        <Button
                            type="text"
                            className="admin-layout__trigger"
                            icon={
                                isMobile || collapsed ? (
                                    <MenuUnfoldOutlined />
                                ) : (
                                    <MenuFoldOutlined />
                                )
                            }
                            onClick={() => {
                                if (isMobile) {
                                    setMobileOpen(true)
                                } else {
                                    toggleCollapsed()
                                }
                            }}
                        />
                        <div className="admin-layout__header-titles">
                            <Typography.Text className="admin-layout__header-title">
                                React 框架示例
                            </Typography.Text>
                            <Typography.Text className="admin-layout__header-desc">
                                前端工程化模板
                            </Typography.Text>
                        </div>
                    </div>
                </Header>

                <Content className="admin-layout__content">
                    <Outlet />
                </Content>
            </Layout>

            <Drawer
                title="菜单"
                placement="left"
                open={isMobile && mobileOpen}
                onClose={() => setMobileOpen(false)}
                styles={{ body: { padding: 0 } }}
                size={260}>
                <div className="admin-layout__drawer">
                    <BrandMark />
                    <div className="admin-layout__drawer-menu">{sideMenu('light')}</div>
                </div>
            </Drawer>
        </Layout>
    )
}
