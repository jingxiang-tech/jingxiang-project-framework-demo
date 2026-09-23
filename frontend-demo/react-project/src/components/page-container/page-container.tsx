import type { ReactNode } from 'react'
import { Typography } from 'antd'
import './page-container.scss'

interface PageContainerProps {
    title: string
    description?: string
    extra?: ReactNode
    children: ReactNode
}

export default function PageContainer({
    title,
    description,
    extra,
    children,
}: PageContainerProps) {
    return (
        <div className="page-container">
            <div className="page-container__header">
                <div className="page-container__titles">
                    <Typography.Title level={4} className="page-container__title">
                        {title}
                    </Typography.Title>
                    {description ? (
                        <Typography.Text className="page-container__description">
                            {description}
                        </Typography.Text>
                    ) : null}
                </div>
                {extra ? <div className="page-container__extra">{extra}</div> : null}
            </div>
            <div className="page-container__body">{children}</div>
        </div>
    )
}
