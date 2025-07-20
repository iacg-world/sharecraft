<template>
  <div class="ai-settings">
    <div class="settings-header">
      <h3>
        <SettingOutlined />
        AI 配置设置
      </h3>
      <div class="header-actions">
        <a-button size="small" @click="resetSettings" type="text">
          <ReloadOutlined />
          重置
        </a-button>
      </div>
    </div>

    <a-form
      :model="formData"
      layout="vertical"
      @finish="saveSettings"
      class="settings-form"
    >
      <!-- Provider选择 -->
      <a-form-item label="AI服务提供商" name="provider">
        <a-select
          v-model:value="formData.provider"
          @change="onProviderChange"
          class="provider-select"
        >
          <a-select-option value="openai">
            <div class="provider-option">
              <span class="provider-name">OpenAI</span>
              <span class="provider-desc">GPT系列模型</span>
            </div>
          </a-select-option>
          <!-- <a-select-option value="claude">
            <div class="provider-option">
              <span class="provider-name">Claude</span>
              <span class="provider-desc">Anthropic Claude模型</span>
            </div>
          </a-select-option>
          <a-select-option value="custom">
            <div class="provider-option">
              <span class="provider-name">自定义</span>
              <span class="provider-desc">自定义API服务</span>
            </div>
          </a-select-option> -->
        </a-select>
      </a-form-item>

      <!-- API Key -->
      <a-form-item label="API Key" name="apiKey">
        <a-input-password
          v-model:value="formData.apiKey"
          placeholder="输入你的API密钥"
          :visibilityToggle="true"
        >
          <template #prefix>
            <KeyOutlined />
          </template>
        </a-input-password>
        <div class="field-help">
          <span class="help-text">
            {{ getApiKeyHelp() }}
          </span>
          <a :href="getApiKeyLink()" target="_blank" class="help-link">
            获取API Key
          </a>
        </div>
      </a-form-item>

      <!-- Base URL -->
      <a-form-item label="API Base URL" name="baseUrl">
        <a-input
          v-model:value="formData.baseUrl"
          placeholder="API服务的基础URL"
        >
          <template #prefix>
            <GlobalOutlined />
          </template>
        </a-input>
        <div class="field-help">
          <span class="help-text">API服务的基础地址，通常不需要修改</span>
        </div>
      </a-form-item>

      <!-- Model选择 -->
      <a-form-item label="AI模型" name="model">
        <a-select
          v-model:value="formData.model"
          class="model-select"
          :disabled="!modelOptions.length"
        >
          <a-select-option
            v-for="model in modelOptions"
            :key="model.value"
            :value="model.value"
          >
            <div class="model-option">
              <span class="model-name">{{ model.label }}</span>
              <a-tag :color="getCostColor(model.cost)" size="small">
                {{ model.cost }}成本
              </a-tag>
            </div>
          </a-select-option>
        </a-select>
        <div class="field-help">
          <span class="help-text">不同模型有不同的性能和成本特点</span>
        </div>
      </a-form-item>

      <!-- 高级设置 -->
      <a-collapse ghost>
        <a-collapse-panel key="advanced" header="高级设置">
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="最大Token数" name="maxTokens">
                <a-input-number
                  v-model:value="formData.maxTokens"
                  :min="100"
                  :max="8000"
                  :step="100"
                  style="width: 100%"
                />
                <div class="field-help">
                  <span class="help-text">控制生成内容的长度</span>
                </div>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="温度参数" name="temperature">
                <a-slider
                  v-model:value="formData.temperature"
                  :min="0"
                  :max="2"
                  :step="0.1"
                  :tooltip-formatter="
                    (value: number) => `${value} (${getTemperatureDesc(value)})`
                  "
                />
                <div class="field-help">
                  <span class="help-text">{{
                    getTemperatureDesc(formData.temperature)
                  }}</span>
                </div>
              </a-form-item>
            </a-col>
          </a-row>
        </a-collapse-panel>
      </a-collapse>

      <!-- 配置状态 -->
      <div class="config-status">
        <a-alert
          v-if="validationErrors.length > 0"
          type="error"
          show-icon
          class="validation-alert"
        >
          <template #message>
            <div>配置验证失败：</div>
            <ul>
              <li v-for="error in validationErrors" :key="error">
                {{ error }}
              </li>
            </ul>
          </template>
        </a-alert>

        <a-alert
          v-else-if="hasValidConfig"
          type="success"
          show-icon
          class="validation-alert"
        >
          <template #message>
            <div
              style="
                display: flex;
                justify-content: space-between;
                align-items: center;
              "
            >
              <span>配置验证通过</span>
              <a-tag
                v-if="connectionStatus"
                :color="getConnectionStatusColor()"
              >
                {{ connectionStatusText }}
              </a-tag>
            </div>
          </template>
        </a-alert>
      </div>

      <!-- 操作按钮 -->
      <div class="settings-actions">
        <a-space>
          <a-button @click="testConnection" :loading="testing">
            <ApiOutlined />
            测试连接
          </a-button>
          <a-button
            type="primary"
            html-type="submit"
            :disabled="validationErrors.length > 0"
          >
            <SaveOutlined />
            保存设置
          </a-button>
        </a-space>
      </div>
    </a-form>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted, watch, watchEffect } from 'vue'
import { message } from 'ant-design-vue'
import {
  SettingOutlined,
  ReloadOutlined,
  ImportOutlined,
  KeyOutlined,
  GlobalOutlined,
  ApiOutlined,
  SaveOutlined,
} from '@ant-design/icons-vue'
import {
  getAIUserSettings,
  saveAIUserSettings,
  resetAIUserSettings,
  validateAIUserSettings,
  getModelOptions,
  getDefaultBaseUrl,
  PROVIDER_PRESETS,
  type AIUserSettings,
} from '@/utils/aiSettings'
import { debounce } from 'lodash-es'

const formData = reactive<AIUserSettings>({
  provider: 'openai',
  apiKey: '',
  baseUrl: 'https://api.openai.com/v1',
  model: 'gpt-3.5-turbo',
  maxTokens: 1500,
  temperature: 0.7,
})

const testing = ref(false)
const connectionStatus = ref<'success' | 'error' | null>(null)
const connectionStatusText = ref('')

// 计算属性
const modelOptions = ref<{ value: string; label: string; cost: string }[]>([])

const validationErrors = computed(() => {
  return validateAIUserSettings(formData)
})

const hasValidConfig = computed(() => {
  return validationErrors.value.length === 0 && formData.apiKey.trim() !== ''
})
const apiGetModelsFromOpenAI = async () => {
  const response = await fetch(`${formData.baseUrl}/models`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${formData.apiKey}`,
    },
  })
  const data = await response.json()
  const allModels = data.data || []
  return allModels
    .filter((item: any) => item.owned_by === 'openai')
    .map((item: any) => ({
      value: item.id,
      label: item.id,
      cost: item.id.includes('gpt-3.5')
        ? '低'
        : item.id.includes('gpt-4')
          ? '中'
          : '未知',
    }))
}

const getModelsFromOpenAI = debounce(
  async () => {
    modelOptions.value = await apiGetModelsFromOpenAI()
  },
  200,
  {
    leading: false,
    trailing: true,
  },
)
watchEffect(() => {
  if (formData.provider && formData.apiKey && formData.baseUrl) {
    if (formData.provider === 'openai') {
      getModelsFromOpenAI()
    }
  } else {
    modelOptions.value = []
  }
})

const onProviderChange = (provider: string) => {}

const getApiKeyHelp = () => {
  switch (formData.provider) {
    case 'openai':
      return '从OpenAI平台获取，格式：sk-xxxxxxxx'
    case 'claude':
      return '从Anthropic控制台获取'
    case 'custom':
      return '从你的AI服务提供商获取'
    default:
      return ''
  }
}

const getApiKeyLink = () => {
  switch (formData.provider) {
    case 'openai':
      return 'https://platform.openai.com/api-keys'
    case 'claude':
      return 'https://console.anthropic.com/'
    case 'custom':
      return '#'
    default:
      return '#'
  }
}

const getCostColor = (cost: string) => {
  switch (cost) {
    case '低':
      return 'green'
    case '中':
      return 'orange'
    case '高':
      return 'red'
    default:
      return 'default'
  }
}

const getTemperatureDesc = (temp: number) => {
  if (temp <= 0.3) {
    return '非常保守'
  }
  if (temp <= 0.7) {
    return '平衡'
  }
  if (temp <= 1.2) {
    return '创意'
  }
  return '非常创意'
}

const getConnectionStatusColor = () => {
  return connectionStatus.value === 'success' ? 'green' : 'red'
}

const saveSettings = () => {
  try {
    saveAIUserSettings(formData)
    message.success('AI设置已保存')

    // 触发自定义事件，通知父组件设置已更新
    emit('settingsUpdated', { ...formData })
  } catch (error) {
    message.error('保存设置失败')
    console.error(error)
  }
}

const resetSettings = () => {
  resetAIUserSettings()
  loadSettings()
  message.info('设置已重置为默认值')
}

const testConnection = async () => {
  if (validationErrors.value.length > 0) {
    message.error('请先修复配置错误')
    return
  }

  testing.value = true
  try {
    // 使用当前表单配置进行测试
    const testConfig = {
      provider: formData.provider,
      apiKey: formData.apiKey,
      baseUrl: formData.baseUrl,
      model: formData.model,
      maxTokens: Math.min(formData.maxTokens, 50), // 测试时使用较少token
      temperature: formData.temperature,
    }

    // 构造测试请求
    const testPrompt = '请简单回复"测试成功"'
    let response: Response

    if (testConfig.provider === 'openai') {
      response = await fetch(`${testConfig.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testConfig.apiKey}`,
        },
        body: JSON.stringify({
          model: testConfig.model,
          messages: [
            {
              role: 'user',
              content: testPrompt,
            },
          ],
          max_tokens: testConfig.maxTokens,
          temperature: testConfig.temperature,
        }),
      })
    } else if (testConfig.provider === 'claude') {
      response = await fetch(`${testConfig.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': testConfig.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: testConfig.model,
          max_tokens: testConfig.maxTokens,
          messages: [
            {
              role: 'user',
              content: testPrompt,
            },
          ],
        }),
      })
    } else {
      // 自定义API，尝试OpenAI格式
      response = await fetch(`${testConfig.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testConfig.apiKey}`,
        },
        body: JSON.stringify({
          model: testConfig.model,
          messages: [
            {
              role: 'user',
              content: testPrompt,
            },
          ],
          max_tokens: testConfig.maxTokens,
          temperature: testConfig.temperature,
        }),
      })
    }

    const data = await response.json()

    if (!response.ok) {
      console.error('❌ API测试失败:', data)
      throw new Error(
        data.error?.message ||
          data.message ||
          `HTTP ${response.status}: ${response.statusText}`,
      )
    }

    // 解析响应内容
    let responseText = ''
    if (testConfig.provider === 'openai' || testConfig.provider === 'custom') {
      responseText = data.choices?.[0]?.message?.content || '无响应内容'
    } else if (testConfig.provider === 'claude') {
      responseText = data.content?.[0]?.text || '无响应内容'
    }

    // 更新连接状态
    connectionStatus.value = 'success'
    connectionStatusText.value = '连接正常'

    message.success(
      `连接测试成功！API响应: ${responseText.substring(0, 50)}${responseText.length > 50 ? '...' : ''}`,
      4,
    )
  } catch (error) {
    console.error('💥 连接测试失败:', error)

    let errorMessage = '连接测试失败'
    if (error instanceof Error) {
      errorMessage = error.message
    }

    // 根据错误类型提供更有用的提示
    if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
      errorMessage = 'API Key无效，请检查是否正确配置'
    } else if (
      errorMessage.includes('404') ||
      errorMessage.includes('Not Found')
    ) {
      errorMessage = 'API地址错误，请检查Base URL配置'
    } else if (
      errorMessage.includes('403') ||
      errorMessage.includes('Forbidden')
    ) {
      errorMessage = 'API访问被拒绝，请检查API Key权限'
    } else if (
      errorMessage.includes('429') ||
      errorMessage.includes('Too Many Requests')
    ) {
      errorMessage = 'API调用频率过高，请稍后重试'
    } else if (
      errorMessage.includes('NetworkError') ||
      errorMessage.includes('Failed to fetch')
    ) {
      errorMessage = '网络连接失败，请检查网络或Base URL'
    }

    // 更新连接状态
    connectionStatus.value = 'error'
    connectionStatusText.value = '连接失败'

    message.error(errorMessage, 6)
  } finally {
    testing.value = false
  }
}

const loadSettings = () => {
  const settings = getAIUserSettings()
  Object.assign(formData, settings)
}

// 定义事件
const emit = defineEmits<{
  settingsUpdated: [settings: AIUserSettings]
}>()

// 初始化
onMounted(() => {
  loadSettings()
})
</script>

<style lang="scss" scoped>
.ai-settings {
  padding: 16px;
  max-height: 70vh;
  overflow-y: auto;
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  h3 {
    margin: 0;
    display: flex;
    align-items: center;
    gap: 8px;
    color: #1890ff;
  }

  .header-actions {
    display: flex;
    gap: 8px;
  }
}

.settings-form {
  .ant-form-item {
    margin-bottom: 20px;
  }
}

.provider-option,
.model-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;

  .provider-name,
  .model-name {
    font-weight: 500;
  }

  .provider-desc {
    color: #666;
    font-size: 12px;
  }
}

.field-help {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 4px;

  .help-text {
    color: #666;
    font-size: 12px;
  }

  .help-link {
    font-size: 12px;
  }
}

.config-status {
  margin: 20px 0;

  .validation-alert {
    margin-bottom: 16px;

    ul {
      margin: 8px 0 0 20px;
      padding: 0;
    }
  }
}

.settings-actions {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
  text-align: right;
}

// 响应式
@media (max-width: 768px) {
  .ai-settings {
    padding: 12px;
  }

  .settings-header {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;

    .header-actions {
      justify-content: center;
    }
  }

  .field-help {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}
</style>
