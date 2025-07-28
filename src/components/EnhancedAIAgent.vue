<template>
  <div class="enhanced-ai-agent">
    <!-- 顶部导航栏 -->
    <div class="agent-header">
      <div class="header-nav">
        <a-button
          :type="activeTab === 'ai' ? 'primary' : 'default'"
          size="small"
          @click="activeTab = 'ai'"
        >
          <RobotOutlined />
          AI 对话
        </a-button>
        <a-button
          :type="activeTab === 'figma' ? 'primary' : 'default'"
          size="small"
          @click="activeTab = 'figma'"
        >
          <FileImageOutlined />
          Figma 导入
        </a-button>
      </div>
      
      <div class="header-actions">
        <a-button size="small" @click="clearAll" type="text">
          <ClearOutlined />
          清空
        </a-button>
        <a-button size="small" @click="showGlobalSettings = true" type="text">
          <SettingOutlined />
          设置
        </a-button>
      </div>
    </div>

    <!-- AI 对话界面 -->
    <div v-if="activeTab === 'ai'" class="ai-chat-panel">
      <AIAgent ref="aiAgentRef" />
    </div>

    <!-- Figma 导入界面 -->
    <div v-if="activeTab === 'figma'" class="figma-panel">
      <FigmaImporter ref="figmaImporterRef" />
    </div>

    <!-- 全局设置模态框 -->
    <a-modal
      v-model:visible="showGlobalSettings"
      title="全局设置"
      width="600px"
      :footer="null"
      centered
    >
      <div class="global-settings">
        <!-- AI 设置 -->
        <div class="setting-section">
          <h4>
            <RobotOutlined />
            AI 设置
          </h4>
          <div class="setting-content">
            <div class="setting-item">
              <label>AI 提供商</label>
              <a-select 
                v-model:value="globalSettings.aiProvider" 
                style="width: 100%"
                size="large"
              >
                <a-select-option value="openai">OpenAI</a-select-option>
                <a-select-option value="claude">Claude</a-select-option>
                <a-select-option value="local">本地模型</a-select-option>
              </a-select>
            </div>
            
            <div class="setting-item">
              <label>API Key</label>
              <a-input-password
                v-model:value="globalSettings.apiKey"
                placeholder="请输入您的API Key"
                size="large"
              />
            </div>
            
            <div class="setting-item">
              <label>模型</label>
              <a-input
                v-model:value="globalSettings.model"
                placeholder="例如: gpt-3.5-turbo"
                size="large"
              />
            </div>
          </div>
        </div>

        <!-- Figma 设置 -->
        <div class="setting-section">
          <h4>
            <FileImageOutlined />
            Figma 设置
          </h4>
          <div class="setting-content">
            <div class="setting-item">
              <label>Figma 访问令牌</label>
              <a-input-password
                v-model:value="globalSettings.figmaToken"
                placeholder="请输入您的 Figma 访问令牌"
                size="large"
              />
              <div class="setting-desc">
                <a href="https://www.figma.com/developers/api#access-tokens" target="_blank">
                  如何获取 Figma 访问令牌？
                </a>
              </div>
            </div>
            
            <div class="setting-item">
              <a-checkbox v-model:checked="globalSettings.autoImportFigma">
                自动导入（粘贴 Figma 链接时自动开始导入）
              </a-checkbox>
            </div>
          </div>
        </div>

        <!-- 导入设置 -->
        <div class="setting-section">
          <h4>
            <ImportOutlined />
            导入设置
          </h4>
          <div class="setting-content">
            <div class="setting-item">
              <label>导入模式</label>
              <a-radio-group v-model:value="globalSettings.importMode" size="large">
                <a-radio value="replace">替换当前页面</a-radio>
                <a-radio value="append">追加到当前页面</a-radio>
                <a-radio value="new">创建新页面</a-radio>
              </a-radio-group>
            </div>
            
            <div class="setting-item">
              <a-checkbox v-model:checked="globalSettings.showPreview">
                导入前显示预览
              </a-checkbox>
            </div>
            
            <div class="setting-item">
              <a-checkbox v-model:checked="globalSettings.preserveHistory">
                保留导入历史记录
              </a-checkbox>
            </div>
          </div>
        </div>

        <!-- 设置操作 -->
        <div class="settings-actions">
          <a-button @click="resetGlobalSettings" style="margin-right: 8px">
            重置设置
          </a-button>
          <a-button type="primary" @click="saveGlobalSettings">
            保存设置
          </a-button>
        </div>
      </div>
    </a-modal>

    <!-- 智能提示浮层 -->
    <div v-if="showSmartTips" class="smart-tips">
      <div class="tips-content">
        <div class="tips-header">
          <BulbOutlined />
          智能提示
          <a-button 
            size="small" 
            type="text" 
            @click="showSmartTips = false"
          >
            <CloseOutlined />
          </a-button>
        </div>
        <div class="tips-body">
          <div v-for="tip in currentTips" :key="tip.id" class="tip-item">
            <div class="tip-content">{{ tip.content }}</div>
            <a-button 
              size="small" 
              type="link" 
              @click="applyTip(tip)"
            >
              应用
            </a-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import {
  RobotOutlined,
  FileImageOutlined,
  ClearOutlined,
  SettingOutlined,
  ImportOutlined,
  BulbOutlined,
  CloseOutlined
} from '@ant-design/icons-vue'
import AIAgent from './AIAgent.vue'
import FigmaImporter from './FigmaImporter.vue'
import { useStore } from 'vuex'

// Store
const store = useStore()

// 组件引用
const aiAgentRef = ref()
const figmaImporterRef = ref()

// 响应式数据
const activeTab = ref<'ai' | 'figma'>('ai')
const showGlobalSettings = ref(false)
const showSmartTips = ref(false)

// 全局设置
const globalSettings = ref({
  // AI 设置
  aiProvider: 'openai',
  apiKey: '',
  model: 'gpt-3.5-turbo',
  
  // Figma 设置
  figmaToken: '',
  autoImportFigma: false,
  
  // 导入设置
  importMode: 'append',
  showPreview: true,
  preserveHistory: true
})

// 智能提示数据
interface SmartTip {
  id: string
  content: string
  action: string
  params?: any
}

const currentTips = ref<SmartTip[]>([])

// 计算属性
const hasValidAIConfig = computed(() => {
  return globalSettings.value.apiKey && globalSettings.value.model
})

const hasValidFigmaConfig = computed(() => {
  return globalSettings.value.figmaToken
})

// 监听器
watch(activeTab, (newTab) => {
  updateSmartTips(newTab)
})

// 初始化
onMounted(() => {
  loadGlobalSettings()
  updateSmartTips(activeTab.value)
})

// 加载全局设置
function loadGlobalSettings() {
  try {
    const stored = localStorage.getItem('sharecraft_enhanced_ai_settings')
    if (stored) {
      const settings = JSON.parse(stored)
      globalSettings.value = { ...globalSettings.value, ...settings }
    }
  } catch (error) {
    console.error('加载全局设置失败:', error)
  }
}

// 保存全局设置
function saveGlobalSettings() {
  try {
    localStorage.setItem(
      'sharecraft_enhanced_ai_settings', 
      JSON.stringify(globalSettings.value)
    )
    
    // 同步设置到各个子组件
    syncSettingsToComponents()
    
    showGlobalSettings.value = false
    message.success('设置已保存')
  } catch (error) {
    console.error('保存全局设置失败:', error)
    message.error('保存设置失败')
  }
}

// 重置全局设置
function resetGlobalSettings() {
  globalSettings.value = {
    aiProvider: 'openai',
    apiKey: '',
    model: 'gpt-3.5-turbo',
    figmaToken: '',
    autoImportFigma: false,
    importMode: 'append',
    showPreview: true,
    preserveHistory: true
  }
  
  localStorage.removeItem('sharecraft_enhanced_ai_settings')
  message.success('设置已重置')
}

// 同步设置到子组件
function syncSettingsToComponents() {
  // 同步AI设置
  if (aiAgentRef.value) {
    // 调用AI组件的设置更新方法
  }
  
  // 同步Figma设置
  if (figmaImporterRef.value) {
    // 调用Figma组件的设置更新方法
  }
}

// 清空所有内容
function clearAll() {
  if (activeTab.value === 'ai' && aiAgentRef.value) {
    aiAgentRef.value.clearChat?.()
  } else if (activeTab.value === 'figma' && figmaImporterRef.value) {
    // 清空Figma导入历史或当前输入
  }
  
  message.success('已清空')
}

// 更新智能提示
function updateSmartTips(tab: 'ai' | 'figma') {
  const tips: SmartTip[] = []
  
  if (tab === 'ai') {
    if (!hasValidAIConfig.value) {
      tips.push({
        id: 'ai-config',
        content: '配置 AI API 以使用智能对话功能',
        action: 'openSettings'
      })
    }
    
    tips.push({
      id: 'ai-template',
      content: '尝试说：创建一个登录页面',
      action: 'setPrompt',
      params: { prompt: '创建一个登录页面' }
    })
    
    tips.push({
      id: 'ai-figma',
      content: '也可以导入 Figma 设计稿',
      action: 'switchTab',
      params: { tab: 'figma' }
    })
  } else if (tab === 'figma') {
    if (!hasValidFigmaConfig.value) {
      tips.push({
        id: 'figma-config',
        content: '配置 Figma 访问令牌以导入设计稿',
        action: 'openSettings'
      })
    }
    
    tips.push({
      id: 'figma-example',
      content: '粘贴 Figma 链接，例如：https://www.figma.com/file/...',
      action: 'none'
    })
    
    tips.push({
      id: 'figma-ai',
      content: '也可以使用 AI 生成页面',
      action: 'switchTab',
      params: { tab: 'ai' }
    })
  }
  
  currentTips.value = tips
  showSmartTips.value = tips.length > 0
}

// 应用智能提示
function applyTip(tip: SmartTip) {
  switch (tip.action) {
    case 'openSettings':
      showGlobalSettings.value = true
      break
      
    case 'setPrompt':
      if (aiAgentRef.value && tip.params?.prompt) {
        aiAgentRef.value.setPrompt?.(tip.params.prompt)
      }
      break
      
    case 'switchTab':
      if (tip.params?.tab) {
        activeTab.value = tip.params.tab
      }
      break
      
    default:
      break
  }
  
  showSmartTips.value = false
}

// 暴露给父组件的方法
defineExpose({
  switchToAI: () => { activeTab.value = 'ai' },
  switchToFigma: () => { activeTab.value = 'figma' },
  openSettings: () => { showGlobalSettings.value = true }
})
</script>

<style scoped lang="scss">
.enhanced-ai-agent {
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}

.agent-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;

  .header-nav {
    display: flex;
    gap: 8px;

    .ant-btn {
      border-radius: 6px;
    }
  }

  .header-actions {
    display: flex;
    gap: 4px;
  }
}

.ai-chat-panel,
.figma-panel {
  flex: 1;
  overflow: hidden;
}

.global-settings {
  .setting-section {
    margin-bottom: 32px;

    h4 {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
      font-size: 14px;
      font-weight: 500;
      color: #333;
      border-bottom: 1px solid #f0f0f0;
      padding-bottom: 8px;
    }

    .setting-content {
      padding-left: 24px;

      .setting-item {
        margin-bottom: 16px;

        label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #333;
          font-size: 13px;
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
    }
  }

  .settings-actions {
    text-align: right;
    padding-top: 16px;
    border-top: 1px solid #f0f0f0;
  }
}

.smart-tips {
  position: absolute;
  top: 60px;
  right: 16px;
  width: 280px;
  background: white;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;

  .tips-content {
    .tips-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      border-bottom: 1px solid #f0f0f0;
      font-size: 14px;
      font-weight: 500;
      color: #333;

      .anticon {
        color: #faad14;
        margin-right: 8px;
      }
    }

    .tips-body {
      padding: 8px;

      .tip-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 12px;
        border-radius: 4px;
        margin-bottom: 4px;
        transition: background-color 0.2s;

        &:hover {
          background-color: #f8f8f8;
        }

        .tip-content {
          flex: 1;
          font-size: 12px;
          color: #666;
          line-height: 1.4;
        }

        .ant-btn-link {
          font-size: 11px;
          padding: 0 4px;
          height: auto;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .agent-header {
    padding: 8px 12px;

    .header-nav {
      .ant-btn {
        font-size: 12px;
        padding: 4px 8px;
      }
    }
  }

  .smart-tips {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90vw;
    max-width: 320px;
  }
}
</style>