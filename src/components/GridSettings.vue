<template>
  <div class="grid-settings">
    <a-row :gutter="16" align="middle" class="setting-row">
      <a-col :span="12">
        <span>启用网格</span>
      </a-col>
      <a-col :span="12">
        <a-switch
          v-model:checked="localSettings.enabled"
          @change="updateSettings"
        />
      </a-col>
    </a-row>

    <a-row :gutter="16" align="middle" class="setting-row">
      <a-col :span="12">
        <span>显示网格</span>
      </a-col>
      <a-col :span="12">
        <a-switch
          v-model:checked="localSettings.visible"
          @change="updateSettings"
          :disabled="!localSettings.enabled"
        />
      </a-col>
    </a-row>

    <a-row :gutter="16" align="middle" class="setting-row">
      <a-col :span="12">
        <span>网格间距</span>
      </a-col>
      <a-col :span="12">
        <a-input-number
          v-model:value="localSettings.spacing"
          :min="10"
          :max="100"
          :step="5"
          @change="updateSettings"
          :disabled="!localSettings.enabled"
          size="small"
        />
      </a-col>
    </a-row>

    <a-row :gutter="16" align="middle" class="setting-row">
      <a-col :span="12">
        <span>网格颜色</span>
      </a-col>
      <a-col :span="12">
        <input
          type="color"
          v-model="localSettings.color"
          @change="updateSettings"
          :disabled="!localSettings.enabled"
          class="color-picker"
        />
      </a-col>
    </a-row>

    <a-row :gutter="16" align="middle" class="setting-row">
      <a-col :span="12">
        <span>透明度</span>
      </a-col>
      <a-col :span="12">
        <a-slider
          v-model:value="localSettings.opacity"
          :min="0.1"
          :max="1"
          :step="0.1"
          @change="updateSettings"
          :disabled="!localSettings.enabled"
        />
      </a-col>
    </a-row>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, watch } from 'vue'
import { useStore } from 'vuex'
import { GlobalDataProps } from '@/store'
import { GridSettings } from '@/store/editor'

export default defineComponent({
  name: 'GridSettings',
  setup() {
    const store = useStore<GlobalDataProps>()

    const localSettings = reactive<GridSettings>({
      ...store.state.editor.gridSettings,
    })

    const updateSettings = () => {
      store.commit('updateGridSettings', { ...localSettings })
    }

    // 监听store中网格设置的变化，同步到本地状态
    watch(
      () => store.state.editor.gridSettings,
      newSettings => {
        Object.assign(localSettings, newSettings)
      },
      { deep: true },
    )

    return {
      localSettings,
      updateSettings,
    }
  },
})
</script>

<style scoped>
.grid-settings {
  padding: 16px;
}

.setting-row {
  margin-bottom: 12px;
}

.setting-row:last-child {
  margin-bottom: 0;
}

.color-picker {
  width: 100%;
  height: 32px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  cursor: pointer;
}

.color-picker:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
</style>
