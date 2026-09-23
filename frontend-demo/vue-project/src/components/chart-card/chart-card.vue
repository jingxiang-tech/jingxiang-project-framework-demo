<template>
    <a-card class="chart-card" :title="title" :body-style="{ padding: '8px 12px 4px' }">
        <a-spin :spinning="loading">
            <div
                ref="containerRef"
                class="chart-card__canvas"
                :style="{ minHeight: `${height}px` }" />
        </a-spin>
    </a-card>
</template>

<script lang="ts" setup>
    import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
    import { Chart } from '@antv/g2'

    type ChartBuilder = (chart: Chart) => void

    interface Props {
        title: string
        buildChart: ChartBuilder
        loading?: boolean
        height?: number
        data?: unknown
    }

    const props = withDefaults(defineProps<Props>(), {
        loading: false,
        height: 240,
        data: undefined,
    })

    const containerRef = ref<HTMLDivElement>()

    let chart: Chart | null = null
    let observer: ResizeObserver | null = null

    function destroyChart() {
        observer?.disconnect()
        observer = null
        chart?.destroy()
        chart = null
    }

    function renderChart() {
        if (!containerRef.value || props.data == null) return

        destroyChart()

        chart = new Chart({
            container: containerRef.value,
            autoFit: true,
            height: props.height,
        })
        chart.data(props.data as never)
        props.buildChart(chart)
        chart.render()

        observer = new ResizeObserver(() => chart?.forceFit())
        observer.observe(containerRef.value)
    }

    watch(() => [props.data, props.buildChart, props.height], renderChart)

    onMounted(renderChart)
    onBeforeUnmount(destroyChart)
</script>

<style lang="scss" scoped>
    .chart-card {
        height: 100%;
        border: 1px solid var(--admin-border);
        box-shadow: var(--admin-shadow);
        background: var(--admin-surface);

        :deep(.ant-card-head) {
            min-height: 40px;
            padding-block: 0;
            border-bottom-color: var(--admin-border);
            color: var(--admin-ink);
            font-size: 13px;
            font-weight: 600;
        }

        &__canvas {
            width: 100%;
        }
    }
</style>
