<template>
  <div class="history-area">
    <div class="operation-list">
      <a-tooltip>
        <template #title> 撤销 </template>
        <a-button
          shape="circle"
          @click="undoHistory"
          :disabled="undoIsDisabled"
        >
          <template #icon><UndoOutlined /> </template>
        </a-button>
      </a-tooltip>
      <a-tooltip>
        <template #title> 重做 </template>
        <a-button
          shape="circle"
          @click="redoHistory"
          :disabled="redoIsDisabled"
        >
          <template #icon><RedoOutlined /> </template>
        </a-button>
      </a-tooltip>
    </div>
    <!-- <li v-for="(item, index) in histories" :key="item.id">
      <span :class="{ bold: index === historyIndex }"
        >{{ item.type }} - {{ item.data.key }}</span
      >
    </li> -->
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useStore } from 'vuex'
import { RedoOutlined, UndoOutlined } from '@ant-design/icons-vue'
import { GlobalDataProps } from '../../store/index'
export default defineComponent({
  components: {
    RedoOutlined,
    UndoOutlined,
  },
  setup() {
    const store = useStore<GlobalDataProps>()
    const histories = computed(() => store.state.editor.histories)
    const historyIndex = computed(() => store.state.editor.historyIndex)
    const undoIsDisabled = computed<boolean>(
      () => store.getters.checkUndoDisable
    )
    const redoIsDisabled = computed<boolean>(
      () => store.getters.checkRedoDisable
    )

    const undoHistory = () => {
      store.commit('undo')
    }
    const redoHistory = () => {
      store.commit('redo')
    }
    return {
      histories,
      undoHistory,
      redoHistory,
      historyIndex,
      undoIsDisabled,
      redoIsDisabled,
    }
  },
})
</script>

<style>
.history-area {
  position: absolute;
  right: 0;
  z-index: 500;
}
.operation-list {
  display: flex;
}
.history-area .bold {
  font-weight: bold;
}
</style>
