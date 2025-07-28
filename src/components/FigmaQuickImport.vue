<template>
  <div class="figma-quick-import">
    <!-- 快速导入卡片 -->
    <a-card 
      class="import-card" 
      :class="{ 'card-active': isActive }"
      @click="focusInput"
    >
      <template #cover>
        <div class="card-cover">
          <FileImageOutlined class="cover-icon" />
          <div class="cover-text">Figma 一键导入</div>
        </div>
      </template>
      
      <div class="card-content">
        <div class="input-section">
          <a-input
            ref="urlInputRef"
            v-model:value="figmaUrl"
            placeholder="粘贴 Figma 设计稿链接..."
            size="large"
            :disabled="importing"
            @focus="isActive = true"
            @blur="isActive = false"
            @pressEnter="handleImport"
          >
            <template #prefix>
              <LinkOutlined />
            </template>
            <template #suffix>
              <a-button
                v-if="figmaUrl"
                type="text"
                size="small"
                @click="clearUrl"
                :disabled="importing"
              >
                <CloseOutlined />
              </a-button>
            </template>
          </a-input>
        </div>

        <div class="actions-section">
          <a-button
            type="primary"
            size="large"
            block
            :loading="importing"
            :disabled="!isValidUrl || !hasToken"
            @click="handleImport"
          >
            <DownloadOutlined />
            {{ importing ? '导入中...' : '立即导入' }}
          </a-button>
        </div>

        <!-- 状态提示 -->
        <div v-if="statusMessage" class="status-message">
          <a-alert
            :message="statusMessage.text"
            :type="statusMessage.type"
            :show-icon="true"
            :closable="statusMessage.type !== 'loading'"
          >
            <template v-if="statusMessage.type === 'warning'" #action>
              <a-button size="small" @click="showSettings">
                配置
              </a-button>
            </template>
          </a-alert>
        </div>

        <!-- 快速提示 -->
        <div class="quick-tips">
          <div class="tip-item">
            <span class="tip-number">1</span>
            <span class="tip-text">复制 Figma 文件链接</span>
          </div>
          <div class="tip-item">
            <span class="tip-number">2</span>
            <span class="tip-text">粘贴到上方输入框</span>
          </div>
          <div class="tip-item">
            <span class="tip-number">3</span>
            <span class="tip-text">点击导入按钮</span>
          </div>
        </div>
      </div>
    </a-card>

    <!-- 设置对话框 -->
    <a-modal
      v-model:visible="showSettingsModal"
      title="Figma 设置"
      width="500px"
      centered
    >
      <div class="settings-content">
        <div class="setting-item">
          <label>Figma 访问令牌</label>
          <a-input-password
            v-model:value="tempToken"
            placeholder="请输入您的 Figma 访问令牌"
            size="large"
          />
          <div class="setting-help">
            <a href="https://www.figma.com/developers/api#access-tokens" target="_blank">
              <QuestionCircleOutlined />
              如何获取访问令牌？
            </a>
          </div>
        </div>
      </div>
      
      <template #footer>
        <a-button @click="showSettingsModal = false">取消</a-button>
        <a-button type="primary" @click="saveToken">保存</a-button>
      </template>
    </a-modal>

    <!-- 导入预览对话框 -->
    <a-modal
      v-model:visible="showPreviewModal"
      title="导入预览"
      width="70%"
      centered
      :footer="null"
    >
      <div v-if="importResult" class="preview-content">
        <div class="preview-header">
          <a-statistic
            title="检测到组件"
            :value="importResult.components.length"
            suffix="个"
          />
          <a-tag color="success">导入成功</a-tag>
        </div>

        <div class="preview-list">
          <div
            v-for="(component, index) in importResult.components"
            :key="component.id"
            class="preview-item"
          >
            <div class="item-index">{{ index + 1 }}</div>
            <div class="item-icon">
              <FileTextOutlined v-if="component.name === 'c-text'" />
              <PictureOutlined v-else-if="component.name === 'c-image'" />
              <BorderOutlined v-else />
            </div>
            <div class="item-info">
              <div class="item-name">{{ component.layerName }}</div>
              <div class="item-type">{{ getComponentTypeName(component.name) }}</div>
            </div>
            <div class="item-size">
              {{ component.props.width }} × {{ component.props.height }}
            </div>
          </div>
        </div>

        <div class="preview-actions">
          <a-button @click="showPreviewModal = false" style="margin-right: 8px">
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
import { ref, computed, watch, nextTick } from 'vue'
import { message } from 'ant-design-vue'
import {
  FileImageOutlined,
  LinkOutlined,
  DownloadOutlined,
  CloseOutlined,
  QuestionCircleOutlined,
  FileTextOutlined,
  PictureOutlined,
  BorderOutlined
} from '@ant-design/icons-vue'
import { useStore } from 'vuex'
import { importFromFigma, parseFigmaUrl, type FigmaImportResult } from '@/utils/figmaApi'
import { 
  getFigmaUserSettings, 
  saveFigmaUserSettings, 
  isFigmaConfigured 
} from '@/utils/figmaSettings'

// Store
const store = useStore()

// 组件引用
const urlInputRef = ref()

// 响应式数据
const figmaUrl = ref('')
const importing = ref(false)
const isActive = ref(false)
const showSettingsModal = ref(false)
const showPreviewModal = ref(false)
const tempToken = ref('')
const importResult = ref<FigmaImportResult | null>(null)

// 状态消息
interface StatusMessage {
  text: string
  type: 'success' | 'error' | 'warning' | 'info' | 'loading'
}

const statusMessage = ref<StatusMessage | null>(null)

// 计算属性
const isValidUrl = computed(() => {
  if (!figmaUrl.value) {
    return false
  }
  return !!parseFigmaUrl(figmaUrl.value)
})

const hasToken = computed(() => {
  return isFigmaConfigured()
})

// 监听器
watch(figmaUrl, (newUrl) => {
  if (newUrl) {
    if (!isValidUrl.value) {
      statusMessage.value = {
        text: '请输入有效的 Figma 文件链接',
        type: 'warning'
      }
    } else if (!hasToken.value) {
      statusMessage.value = {
        text: '请先配置 Figma 访问令牌',
        type: 'warning'
      }
    } else {
      statusMessage.value = null
    }
  } else {
    statusMessage.value = null
  }
})

// 方法
function focusInput() {
  nextTick(() => {
    urlInputRef.value?.focus()
  })
}

function clearUrl() {
  figmaUrl.value = ''
  statusMessage.value = null
}

async function handleImport() {
  if (!figmaUrl.value || !isValidUrl.value) {
    message.error('请输入有效的 Figma 链接')
    return
  }

  if (!hasToken.value) {
    showSettings()
    return
  }

  importing.value = true
  statusMessage.value = {
    text: '正在从 Figma 获取设计稿数据...',
    type: 'loading'
  }

  try {
    const settings = getFigmaUserSettings()
    const result = await importFromFigma(figmaUrl.value, settings.accessToken)

    if (result.success) {
      importResult.value = result
      showPreviewModal.value = true
      
      statusMessage.value = {
        text: `成功获取 ${result.components.length} 个组件`,
        type: 'success'
      }
      
      // 保存到历史
      saveFigmaUserSettings({ lastUsedUrl: figmaUrl.value })
      
    } else {
      statusMessage.value = {
        text: `导入失败: ${result.error}`,
        type: 'error'
      }
    }
  } catch (error) {
    console.error('导入过程出错:', error)
    statusMessage.value = {
      text: '导入过程中发生错误，请检查网络连接和访问令牌',
      type: 'error'
    }
  } finally {
    importing.value = false
  }
}

function confirmImport() {
  if (!importResult.value || !importResult.value.success) {
    return
  }

  const components = importResult.value.components
  
  // 批量添加组件到编辑器
  components.forEach(component => {
    store.commit('addComponent', component)
  })

  showPreviewModal.value = false
  importResult.value = null
  figmaUrl.value = ''
  statusMessage.value = null
  
  message.success('组件已成功添加到编辑器')
}

function showSettings() {
  const settings = getFigmaUserSettings()
  tempToken.value = settings.accessToken || ''
  showSettingsModal.value = true
}

function saveToken() {
  if (!tempToken.value.trim()) {
    message.error('请输入访问令牌')
    return
  }

  saveFigmaUserSettings({ accessToken: tempToken.value.trim() })
  showSettingsModal.value = false
  message.success('访问令牌已保存')
}

function getComponentTypeName(name: string): string {
  const typeMap: Record<string, string> = {
    'c-text': '文本',
    'c-image': '图片',
    'c-shape': '形状'
  }
  return typeMap[name] || name
}

// 暴露给父组件的方法
defineExpose({
  setUrl: (url: string) => {
    figmaUrl.value = url
  },
  focus: focusInput
})
</script>

<style scoped lang="scss">
.figma-quick-import {
  padding: 16px;
}

.import-card {
  border-radius: 12px;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &.card-active {
    border-color: #1890ff;
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
  }

  &:hover {
    border-color: #40a9ff;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

.card-cover {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 120px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;

  .cover-icon {
    font-size: 32px;
    margin-bottom: 8px;
  }

  .cover-text {
    font-size: 16px;
    font-weight: 500;
  }
}

.card-content {
  padding: 0;
}

.input-section {
  margin-bottom: 16px;
}

.actions-section {
  margin-bottom: 16px;
}

.status-message {
  margin-bottom: 16px;
}

.quick-tips {
  .tip-item {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    font-size: 12px;
    color: #666;

    &:last-child {
      margin-bottom: 0;
    }

    .tip-number {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 16px;
      height: 16px;
      background: #1890ff;
      color: white;
      border-radius: 50%;
      font-size: 10px;
      font-weight: bold;
      margin-right: 8px;
      flex-shrink: 0;
    }

    .tip-text {
      flex: 1;
    }
  }
}

.settings-content {
  .setting-item {
    margin-bottom: 16px;

    label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: #333;
    }

    .setting-help {
      margin-top: 8px;
      font-size: 12px;

      a {
        color: #1890ff;
        text-decoration: none;
        display: flex;
        align-items: center;
        gap: 4px;

        &:hover {
          text-decoration: underline;
        }
      }
    }
  }
}

.preview-content {
  .preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid #f0f0f0;
  }

  .preview-list {
    max-height: 400px;
    overflow-y: auto;
    border: 1px solid #f0f0f0;
    border-radius: 6px;
    margin-bottom: 24px;

    .preview-item {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      border-bottom: 1px solid #f8f8f8;

      &:last-child {
        border-bottom: none;
      }

      .item-index {
        width: 24px;
        height: 24px;
        background: #f0f0f0;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: 500;
        color: #666;
        margin-right: 12px;
        flex-shrink: 0;
      }

      .item-icon {
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #666;
        margin-right: 12px;
        flex-shrink: 0;
      }

      .item-info {
        flex: 1;
        min-width: 0;

        .item-name {
          font-size: 14px;
          color: #333;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-bottom: 2px;
        }

        .item-type {
          font-size: 12px;
          color: #999;
        }
      }

      .item-size {
        font-size: 12px;
        color: #666;
        white-space: nowrap;
      }
    }
  }

  .preview-actions {
    text-align: right;
  }
}

@media (max-width: 768px) {
  .figma-quick-import {
    padding: 12px;
  }

  .card-cover {
    height: 100px;

    .cover-icon {
      font-size: 28px;
    }

    .cover-text {
      font-size: 14px;
    }
  }

  .preview-list {
    max-height: 300px;

    .preview-item {
      .item-info {
        .item-name {
          font-size: 13px;
        }
      }
    }
  }
}
</style>