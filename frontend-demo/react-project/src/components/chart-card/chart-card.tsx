import { useEffect, useRef } from 'react'
import { Card, Spin } from 'antd'
import { Chart } from '@antv/g2'
import './chart-card.scss'

export type ChartBuilder = (chart: Chart) => void

interface ChartCardProps {
    title: string
    loading?: boolean
    height?: number
    data?: unknown
    buildChart: ChartBuilder
}

export default function ChartCard({
    title,
    loading = false,
    height = 320,
    data,
    buildChart,
}: ChartCardProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const chartRef = useRef<Chart | null>(null)

    useEffect(() => {
        if (!containerRef.current || data == null) return

        const chart = new Chart({
            container: containerRef.current,
            autoFit: true,
            height,
        })

        chart.data(data as never)
        buildChart(chart)
        chart.render()
        chartRef.current = chart

        const observer = new ResizeObserver(() => {
            chart.forceFit()
        })
        observer.observe(containerRef.current)

        return () => {
            observer.disconnect()
            chart.destroy()
            chartRef.current = null
        }
    }, [buildChart, data, height])

    return (
        <Card
            title={title}
            className="chart-card"
            styles={{ body: { paddingBottom: 8 } }}>
            <Spin spinning={loading}>
                <div
                    ref={containerRef}
                    className="chart-card__canvas"
                    style={{ minHeight: height }}
                />
            </Spin>
        </Card>
    )
}
