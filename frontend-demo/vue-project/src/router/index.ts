import { createRouter, createWebHistory } from 'vue-router'
import AdminLayout from '@/layouts/admin-layout/admin-layout.vue'

const basename = import.meta.env.VITE_BASE_PATH || '/'

export const router = createRouter({
    history: createWebHistory(basename),
    routes: [
        {
            path: '/',
            component: AdminLayout,
            children: [
                { path: '', redirect: '/dashboard' },
                {
                    path: 'dashboard',
                    component: () => import('@/pages/dashboard/dashboard.vue'),
                    meta: { title: '仪表盘' },
                },
                {
                    path: 'demo/table',
                    component: () => import('@/pages/demo-table/demo-table.vue'),
                    meta: { title: '示例表格' },
                },
            ],
        },
    ],
})

router.afterEach(to => {
    const title = to.meta.title
    document.title = typeof title === 'string' ? `${title} · Vue Demo` : 'Vue Demo'
})
