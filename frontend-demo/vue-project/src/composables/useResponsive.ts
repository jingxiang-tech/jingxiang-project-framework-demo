import { computed } from 'vue'
import { Grid } from 'ant-design-vue'

/**
 * 断点与 Ant Design Vue Grid 对齐：xs <576 / sm ≥576 / md ≥768 / lg ≥992 / xl ≥1200
 */
export function useResponsive() {
    const screens = Grid.useBreakpoint()

    const isMobile = computed(() => !screens.value.lg)
    const isCompact = computed(() => !screens.value.md)

    return { screens, isMobile, isCompact }
}
