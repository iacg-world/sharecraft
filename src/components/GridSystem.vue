<template>
  <div
    v-if="gridSettings.enabled && gridSettings.visible"
    class="grid-system"
    :style="gridStyle"
  ></div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useStore } from 'vuex'
import { GlobalDataProps } from '@/store'

export default defineComponent({
  name: 'GridSystem',
  setup() {
    const store = useStore<GlobalDataProps>()

    const gridSettings = computed(() => store.state.editor.gridSettings)

    const gridStyle = computed(() => {
      const { spacing, color, opacity } = gridSettings.value

      return {
        position: 'absolute' as const,
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        pointerEvents: 'none' as const,
        zIndex: '0',
        backgroundImage: `
          linear-gradient(to right, ${color} 1px, transparent 1px),
          linear-gradient(to bottom, ${color} 1px, transparent 1px)
        `,
        backgroundSize: `${spacing}px ${spacing}px`,
        opacity: opacity.toString(),
      }
    })

    return {
      gridSettings,
      gridStyle,
    }
  },
})
</script>

<style scoped>
.grid-system {
  pointer-events: none;
  user-select: none;
}
</style>
