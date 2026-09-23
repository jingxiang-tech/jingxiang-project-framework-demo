<template>
    <PageContainer title="仪表盘" description="核心指标与业务趋势一览">
        <a-row :gutter="[8, 8]">
            <a-col
                v-for="(item, index) in kpis"
                :key="item.title"
                :xs="24"
                :sm="12"
                :xl="6">
                <div class="dashboard-kpi" :data-accent="index % 4">
                    <a-skeleton
                        v-if="isFetching && !data"
                        active
                        :paragraph="{ rows: 1 }"
                        :title="{ width: '40%' }" />
                    <template v-else>
                        <span class="dashboard-kpi__label">{{ item.title }}</span>
                        <div class="dashboard-kpi__value-row">
                            <span class="dashboard-kpi__value">{{ item.value }}</span>
                            <span v-if="item.suffix" class="dashboard-kpi__suffix">
                                {{ item.suffix }}
                            </span>
                        </div>
                    </template>
                </div>
            </a-col>

            <a-col :xs="24" :xl="14">
                <ChartCard
                    title="近 12 月趋势"
                    :loading="isFetching && !data"
                    :height="240"
                    :data="data?.trend"
                    :build-chart="buildTrendChart" />
            </a-col>

            <a-col :xs="24" :xl="10">
                <ChartCard
                    title="业务分类占比"
                    :loading="isFetching && !data"
                    :height="240"
                    :data="data?.category"
                    :build-chart="buildCategoryChart" />
            </a-col>

            <a-col :xs="24">
                <div class="dashboard-store">
                    <div class="dashboard-store__copy">
                        <span class="dashboard-store__label">Pinia 客户端状态</span>
                        <span class="dashboard-store__hint">
                            状态用 storeToRefs 解构保持响应性，方法可直接解构
                        </span>
                    </div>
                    <div class="dashboard-store__actions">
                        <a-button size="small" aria-label="减少" @click="decrement">
                            −
                        </a-button>
                        <span class="dashboard-store__value">{{ count }}</span>
                        <a-button size="small" aria-label="增加" @click="increment">
                            +
                        </a-button>
                        <a-button size="small" type="text" @click="reset">重置</a-button>
                    </div>
                </div>
            </a-col>
        </a-row>
    </PageContainer>
</template>

<script lang="ts" setup>
    import { computed } from 'vue'
    import { useQuery } from '@tanstack/vue-query'
    import { storeToRefs } from 'pinia'
    import type { Chart } from '@antv/g2'
    import { fetchDashboardStats } from '@/api/dashboard'
    import ChartCard from '@/components/chart-card/chart-card.vue'
    import PageContainer from '@/components/page-container/page-container.vue'
    import { useAppStore } from '@/stores'
    import { CHART_PALETTE } from '@/theme'

    const KPI_PLACEHOLDERS: Dashboard.Kpi[] = Array.from({ length: 4 }, (_, index) => ({
        title: `指标 ${index + 1}`,
        value: 0,
        suffix: '',
    }))

    function buildTrendChart(chart: Chart) {
        chart
            .line()
            .encode('x', 'month')
            .encode('y', 'value')
            .encode('shape', 'smooth')
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
    }

    function buildCategoryChart(chart: Chart) {
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
    }

    const { data, isFetching } = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: fetchDashboardStats,
    })

    const kpis = computed(() => data.value?.kpis ?? KPI_PLACEHOLDERS)

    const appStore = useAppStore()
    const { count } = storeToRefs(appStore)
    const { increment, decrement, reset } = appStore
</script>

<style lang="scss" scoped src="./dashboard.scss"></style>
