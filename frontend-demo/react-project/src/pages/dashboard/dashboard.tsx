import { useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Col, Row, Skeleton, Typography } from 'antd'
import type { Chart } from '@antv/g2'
import { fetchDashboardStats } from '@/api/dashboard'
import ChartCard from '@/components/chart-card/chart-card'
import PageContainer from '@/components/page-container/page-container'
import './dashboard.scss'

const CHART_PALETTE = ['#7E72F6', '#A89BFF', '#C4B5A0', '#78716C', '#9CA3AF']

const KPI_PLACEHOLDERS = Array.from({ length: 4 }, (_, index) => ({
    title: `指标 ${index + 1}`,
    value: 0,
    suffix: '',
}))

export default function Dashboard() {
    const { data, isFetching } = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: fetchDashboardStats,
    })

    const buildTrendChart = useCallback((chart: Chart) => {
        chart
            .line()
            .encode('x', 'month')
            .encode('y', 'value')
            .encode('shape', 'smooth')
            .encode('color', () => '#7E72F6')
            .style('lineWidth', 2.5)
            .style('stroke', '#7E72F6')

        chart
            .area()
            .encode('x', 'month')
            .encode('y', 'value')
            .encode('shape', 'smooth')
            .style('fill', 'l(90) 0:#7E72F6 1:rgba(126,114,246,0)')
            .style('fillOpacity', 0.16)
            .tooltip(false)

        chart
            .point()
            .encode('x', 'month')
            .encode('y', 'value')
            .encode('size', 3)
            .style('fill', '#7E72F6')
            .style('stroke', '#FFFcfb')
            .style('lineWidth', 1.5)
            .tooltip(false)

        chart.axis('y', { title: false, gridStrokeOpacity: 0.35 })
        chart.axis('x', { title: false })
        chart.legend(false)
    }, [])

    const buildCategoryChart = useCallback((chart: Chart) => {
        chart
            .interval()
            .encode('x', 'name')
            .encode('y', 'value')
            .encode('color', 'name')
            .scale('color', { range: CHART_PALETTE })
            .style('maxWidth', 40)
            .style('radius', 8)
            .legend(false)

        chart.axis('y', { title: false, gridStrokeOpacity: 0.35 })
        chart.axis('x', { title: false })
    }, [])

    const kpis = data?.kpis ?? KPI_PLACEHOLDERS

    return (
        <PageContainer title="仪表盘" description="核心指标与业务趋势一览">
            <Row gutter={[8, 8]}>
                {kpis.map((item, index) => (
                    <Col key={item.title} xs={24} sm={12} xl={6}>
                        <div className="dashboard-kpi" data-accent={index % 4}>
                            {isFetching && !data ? (
                                <Skeleton
                                    active
                                    paragraph={{ rows: 1 }}
                                    title={{ width: '40%' }}
                                />
                            ) : (
                                <>
                                    <Typography.Text className="dashboard-kpi__label">
                                        {item.title}
                                    </Typography.Text>
                                    <div className="dashboard-kpi__value-row">
                                        <Typography.Text className="dashboard-kpi__value">
                                            {item.value}
                                        </Typography.Text>
                                        {item.suffix ? (
                                            <Typography.Text className="dashboard-kpi__suffix">
                                                {item.suffix}
                                            </Typography.Text>
                                        ) : null}
                                    </div>
                                </>
                            )}
                        </div>
                    </Col>
                ))}

                <Col xs={24} xl={14}>
                    <ChartCard
                        title="近 12 月趋势"
                        loading={isFetching && !data}
                        height={240}
                        data={data?.trend}
                        buildChart={buildTrendChart}
                    />
                </Col>

                <Col xs={24} xl={10}>
                    <ChartCard
                        title="业务分类占比"
                        loading={isFetching && !data}
                        height={240}
                        data={data?.category}
                        buildChart={buildCategoryChart}
                    />
                </Col>
            </Row>
        </PageContainer>
    )
}
