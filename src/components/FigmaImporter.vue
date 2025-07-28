<template>
  <div class="figma-importer">
    <!-- 主要导入界面 -->
    <div v-if="!showSettings" class="importer-main">
      <div class="importer-header">
        <h3>
          <FileImageOutlined />
          Figma 设计稿导入
        </h3>
        <a-button size="small" @click="showSettings = true" type="text">
          <SettingOutlined />
          设置
        </a-button>
      </div>

      <!-- Figma URL 输入 -->
      <div class="url-input-section">
        <a-input
          v-model:value="figmaUrl"
          placeholder="粘贴 Figma 文件链接，例如: https://www.figma.com/file/..."
          size="large"
          :disabled="importing"
        >
          <template #prefix>
            <LinkOutlined />
          </template>
        </a-input>
        
        <a-button
          type="primary"
          size="large"
          :loading="importing"
          :disabled="!figmaUrl || !isValidUrl"
          @click="handleImportFromFigma"
          class="import-button"
        >
          <DownloadOutlined />
          {{ importing ? '导入中...' : '一键导入' }}
        </a-button>
      </div>

      <!-- URL 验证提示 -->
      <div v-if="figmaUrl && !isValidUrl" class="url-warning">
        <a-alert
          message="请输入有效的 Figma 文件链接"
          type="warning"
          show-icon
        />
      </div>

      <!-- 配置检查 -->
      <div v-if="!isFigmaConfigured" class="config-warning">
        <a-alert
          message="请先配置 Figma 访问令牌"
          description="点击右上角设置按钮配置您的 Figma API 访问令牌"
          type="info"
          show-icon
          action
        >
          <template #action>
            <a-button size="small" @click="showSettings = true">
              立即配置
            </a-button>
          </template>
        </a-alert>
      </div>

      <!-- 导入历史 -->
      <div v-if="importHistory.length > 0" class="import-history">
        <h4>最近导入</h4>
        <div class="history-list">
          <div
            v-for="(item, index) in importHistory"
            :key="index"
            class="history-item"
            @click="loadFromHistory(item)"
          >
            <div class="history-info">
              <div class="history-url">{{ item.url }}</div>
              <div class="history-time">{{ formatTime(item.timestamp) }}</div>
            </div>
            <div class="history-stats">
              {{ item.componentCount }} 个组件
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 设置界面 -->
    <div v-if="showSettings" class="settings-panel">
      <div class="settings-header">
        <h3>
          <SettingOutlined />
          Figma 设置
        </h3>
        <a-button size="small" @click="showSettings = false" type="text">
          <ArrowLeftOutlined />
          返回
        </a-button>
      </div>

      <div class="settings-content">
        <!-- 访问令牌设置 -->
        <div class="setting-item">
          <label>Figma 访问令牌</label>
          <a-input-password
            v-model:value="tempSettings.accessToken"
            placeholder="请输入您的 Figma 访问令牌"
            size="large"
          />
          <div class="setting-desc">
            <a href="https://www.figma.com/developers/api#access-tokens" target="_blank">
              如何获取 Figma 访问令牌？
            </a>
          </div>
        </div>

        <!-- 其他设置 -->
        <div class="setting-item">
          <a-checkbox v-model:checked="tempSettings.autoImport">
            自动导入（粘贴链接时自动开始导入）
          </a-checkbox>
        </div>

        <!-- 设置操作按钮 -->
        <div class="settings-actions">
          <a-button @click="resetSettings" style="margin-right: 8px">
            重置设置
          </a-button>
          <a-button type="primary" @click="saveSettings">
            保存设置
          </a-button>
        </div>
      </div>
    </div>

    <!-- 导入结果预览 -->
    <a-modal
      v-model:visible="showPreview"
      title="导入预览"
      width="80%"
      :footer="null"
      centered
    >
      <div v-if="previewData" class="preview-content">
        <div class="preview-stats">
          <a-statistic
            title="导入的组件数量"
            :value="previewData.components.length"
            suffix="个"
          />
        </div>
        
        <div class="preview-components">
          <h4>组件列表</h4>
          <div class="component-list">
            <div
              v-for="component in previewData.components"
              :key="component.id"
              class="component-item"
            >
              <div class="component-icon">
                <FileTextOutlined v-if="component.name === 'c-text'" />
                <PictureOutlined v-else-if="component.name === 'c-image'" />
                <BorderOutlined v-else />
              </div>
              <div class="component-info">
                <div class="component-name">{{ component.layerName }}</div>
                <div class="component-type">{{ getComponentTypeName(component.name) }}</div>
              </div>
              <div class="component-props">
                <a-tag>{{ component.props.width }} × {{ component.props.height }}</a-tag>
              </div>
            </div>
          </div>
        </div>

        <div class="preview-actions">
          <a-button @click="showPreview = false" style="margin-right: 8px">
            取消
          </a-button>
          <a-button type="primary" @click="confirmImport">
            确认导入到编辑器
          </a-button>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { message } from 'ant-design-vue'
import {
  FileImageOutlined,
  SettingOutlined,
  LinkOutlined,
  DownloadOutlined,
  ArrowLeftOutlined,
  FileTextOutlined,
  PictureOutlined,
  BorderOutlined
} from '@ant-design/icons-vue'
import { useStore } from 'vuex'
import { importFromFigma, parseFigmaUrl, type FigmaImportResult } from '@/utils/figmaApi'
import { 
  getFigmaUserSettings, 
  saveFigmaUserSettings, 
  isFigmaConfigured as checkFigmaConfigured,
  clearFigmaSettings,
  type FigmaUserSettings 
} from '@/utils/figmaSettings'
import { ComponentData } from '@/store/editor'

// Store
const store = useStore()

// 响应式数据
const figmaUrl = ref('')
const importing = ref(false)
const showSettings = ref(false)
const showPreview = ref(false)
const previewData = ref<FigmaImportResult | null>(null)

// 设置相关
const tempSettings = ref<FigmaUserSettings>({
  accessToken: '',
  autoImport: false,
  preferredCanvasIndex: 0
})

// 导入历史
interface ImportHistoryItem {
  url: string
  timestamp: number
  componentCount: number
}

const importHistory = ref<ImportHistoryItem[]>([])

// 计算属性
const isValidUrl = computed(() => {
  if (!figmaUrl.value) return false
  return !!parseFigmaUrl(figmaUrl.value)
})

const isFigmaConfigured = computed(() => {
  return checkFigmaConfigured()
})

// 监听器
watch(() => figmaUrl.value, (newUrl) => {
  if (newUrl && tempSettings.value.autoImport && isValidUrl.value) {
    handleImportFromFigma()
  }
})

// 初始化
function init() {
  tempSettings.value = getFigmaUserSettings()
  loadImportHistory()
}

// 加载导入历史
function loadImportHistory() {
  try {
    const stored = localStorage.getItem('sharecraft_figma_history')
    if (stored) {
      importHistory.value = JSON.parse(stored)
    }
  } catch (error) {
    console.error('加载导入历史失败:', error)
  }
}

// 保存导入历史
function saveImportHistory() {
  try {
    localStorage.setItem('sharecraft_figma_history', JSON.stringify(importHistory.value))
  } catch (error) {
    console.error('保存导入历史失败:', error)
  }
}

// 添加到导入历史
function addToHistory(url: string, componentCount: number) {
  const historyItem: ImportHistoryItem = {
    url,
    timestamp: Date.now(),
    componentCount
  }
  
  // 避免重复，移除已存在的相同URL
  importHistory.value = importHistory.value.filter(item => item.url !== url)
  
  // 添加到开头
  importHistory.value.unshift(historyItem)
  
  // 限制历史记录数量
  if (importHistory.value.length > 10) {
    importHistory.value = importHistory.value.slice(0, 10)
  }
  
  saveImportHistory()
}

// 主要导入函数
async function handleImportFromFigma() {
  if (!figmaUrl.value || !isValidUrl.value) {
    message.error('请输入有效的 Figma 链接')
    return
  }

  if (!isFigmaConfigured.value) {
    message.error('请先配置 Figma 访问令牌')
    showSettings.value = true
    return
  }

  importing.value = true

  try {
    const settings = getFigmaUserSettings()
    const result = await importFromFigma(figmaUrl.value, settings.accessToken)

    if (result.success) {
      previewData.value = result
      showPreview.value = true
      
      // 保存到历史记录
      addToHistory(figmaUrl.value, result.components.length)
      
      // 保存最后使用的URL
      saveFigmaUserSettings({ lastUsedUrl: figmaUrl.value })
      
      message.success(`成功导入 ${result.components.length} 个组件`)
    } else {
      message.error(`导入失败: ${result.error}`)
    }
  } catch (error) {
    console.error('导入过程出错:', error)
    message.error('导入过程中发生错误，请检查网络连接和访问令牌')
  } finally {
    importing.value = false
  }
}

// 确认导入到编辑器
function confirmImport() {
  if (!previewData.value || !previewData.value.success) {
    return
  }

  const components = previewData.value.components
  
  // 批量添加组件到编辑器
  components.forEach(component => {
    store.commit('addComponent', component)
  })

  showPreview.value = false
  previewData.value = null
  figmaUrl.value = ''
  
  message.success('组件已成功添加到编辑器')
}

// 从历史记录加载
function loadFromHistory(item: ImportHistoryItem) {
  figmaUrl.value = item.url
  if (tempSettings.value.autoImport) {
    handleImportFromFigma()
  }
}

// 保存设置
function saveSettings() {
  saveFigmaUserSettings(tempSettings.value)
  showSettings.value = false
  message.success('设置已保存')
}

// 重置设置
function resetSettings() {
  clearFigmaSettings()
  tempSettings.value = {
    accessToken: '',
    autoImport: false,
    preferredCanvasIndex: 0
  }
  message.success('设置已重置')
}

// 格式化时间
function formatTime(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (minutes < 1) {
    return '刚刚'
  }
  if (minutes < 60) {
    return `${minutes}分钟前`
  }
  if (hours < 24) {
    return `${hours}小时前`
  }
  if (days < 30) {
    return `${days}天前`
  }
  
  return date.toLocaleDateString()
}

// 获取组件类型名称
function getComponentTypeName(name: string): string {
  const typeMap: Record<string, string> = {
    'c-text': '文本',
    'c-image': '图片',
    'c-shape': '形状'
  }
  return typeMap[name] || name
}

// 组件挂载时初始化
init()
</script>

<style scoped lang="scss">
.figma-importer {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.importer-header,
.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 16px;

  h3 {
    margin: 0;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 500;
  }
}

.url-input-section {
  margin-bottom: 16px;

  .ant-input {
    margin-bottom: 12px;
  }

  .import-button {
    width: 100%;
  }
}

.url-warning,
.config-warning {
  margin-bottom: 16px;
}

.import-history {
  margin-top: 24px;

  h4 {
    margin-bottom: 12px;
    font-size: 14px;
    color: #666;
  }

  .history-list {
    max-height: 200px;
    overflow-y: auto;
  }

  .history-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    border: 1px solid #f0f0f0;
    border-radius: 4px;
    margin-bottom: 8px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      border-color: #1890ff;
      background-color: #f6ffff;
    }

    .history-info {
      flex: 1;
      min-width: 0;

      .history-url {
        font-size: 12px;
        color: #333;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .history-time {
        font-size: 11px;
        color: #999;
        margin-top: 2px;
      }
    }

    .history-stats {
      font-size: 12px;
      color: #666;
      white-space: nowrap;
    }
  }
}

.settings-content {
  .setting-item {
    margin-bottom: 24px;

    label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: #333;
    }

    .setting-desc {
      margin-top: 8px;
      font-size: 12px;
      color: #666;

      a {
        color: #1890ff;
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
      }
    }
  }

  .settings-actions {
    padding-top: 16px;
    border-top: 1px solid #f0f0f0;
  }
}

.preview-content {
  .preview-stats {
    margin-bottom: 24px;
    text-align: center;
  }

  .preview-components {
    margin-bottom: 24px;

    h4 {
      margin-bottom: 16px;
      font-size: 14px;
      color: #333;
    }

    .component-list {
      max-height: 300px;
      overflow-y: auto;
      border: 1px solid #f0f0f0;
      border-radius: 4px;
    }

    .component-item {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      border-bottom: 1px solid #f8f8f8;

      &:last-child {
        border-bottom: none;
      }

      .component-icon {
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 12px;
        color: #666;
      }

      .component-info {
        flex: 1;
        min-width: 0;

        .component-name {
          font-size: 14px;
          color: #333;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .component-type {
          font-size: 12px;
          color: #999;
          margin-top: 2px;
        }
      }

      .component-props {
        .ant-tag {
          margin: 0;
          font-size: 11px;
        }
      }
    }
  }

  .preview-actions {
    text-align: right;
  }
}
</style>