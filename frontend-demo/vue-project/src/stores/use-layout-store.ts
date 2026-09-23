import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useLayoutStore = defineStore('layout', () => {
    const collapsed = ref(false)
    const mobileOpen = ref(false)

    function setCollapsed(value: boolean) {
        collapsed.value = value
    }

    function toggleCollapsed() {
        collapsed.value = !collapsed.value
    }

    function setMobileOpen(open: boolean) {
        mobileOpen.value = open
    }

    return { collapsed, mobileOpen, setCollapsed, toggleCollapsed, setMobileOpen }
})
