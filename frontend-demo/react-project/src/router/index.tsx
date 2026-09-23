import { Navigate, createBrowserRouter } from 'react-router-dom'
import AdminLayout from '@/layouts/admin-layout/admin-layout'
import Dashboard from '@/pages/dashboard/dashboard'
import DemoTable from '@/pages/demo-table/demo-table'

const basename = import.meta.env.VITE_BASE_PATH || '/'

export const router = createBrowserRouter(
    [
        {
            path: '/',
            element: <AdminLayout />,
            children: [
                {
                    index: true,
                    element: <Navigate to="/dashboard" replace />,
                },
                {
                    path: 'dashboard',
                    element: <Dashboard />,
                },
                {
                    path: 'demo/table',
                    element: <DemoTable />,
                },
            ],
        },
    ],
    { basename },
)
