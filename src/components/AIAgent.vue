<template>
  <div class="ai-agent-container">
    <div class="ai-header">
      <h3>
        <robot-outlined />
        AI 页面设计助手
      </h3>
      <a-button size="small" @click="clearChat" type="text">
        <clear-outlined />
        清空对话
      </a-button>
    </div>
    
    <div class="chat-container" ref="chatContainer">
      <div v-for="(message, index) in chatHistory" :key="index" class="message-item">
        <div v-if="message.type === 'user'" class="user-message">
          <div class="message-content">{{ message.content }}</div>
          <div class="message-time">{{ formatTime(message.timestamp) }}</div>
        </div>
        
        <div v-else class="ai-message">
          <div class="ai-avatar">
            <robot-outlined />
          </div>
          <div class="message-wrapper">
            <div class="message-content">
              <div v-if="message.text" class="ai-response">{{ message.text }}</div>
              <div v-if="message.schema" class="schema-preview">
                <div class="schema-header">
                  <span>生成的页面结构：</span>
                  <a-button size="small" @click="applySchema(message.schema)" type="primary">
                    应用到编辑器
                  </a-button>
                </div>
                <pre class="schema-code">{{ formatSchema(message.schema) }}</pre>
              </div>
            </div>
            <div class="message-time">{{ formatTime(message.timestamp) }}</div>
          </div>
        </div>
      </div>
      
      <div v-if="isLoading" class="loading-message">
        <div class="ai-avatar">
          <robot-outlined />
        </div>
        <div class="loading-content">
          <a-spin size="small" />
          <span>AI正在思考...</span>
        </div>
      </div>
    </div>
    
    <div class="input-container">
      <div class="input-wrapper">
        <a-textarea
          v-model:value="inputText"
          placeholder="描述你想要的页面设计，例如：创建一个登录页面，包含用户名输入框、密码输入框和登录按钮"
          :rows="3"
          @keydown.ctrl.enter="sendMessage"
          class="message-input"
        />
        <div class="input-actions">
          <div class="example-prompts">
            <a-tag 
              v-for="example in examplePrompts" 
              :key="example"
              @click="inputText = example"
              class="example-tag"
            >
              {{ example }}
            </a-tag>
          </div>
          <a-button 
            type="primary" 
            @click="sendMessage"
            :loading="isLoading"
            :disabled="!inputText.trim()"
          >
            <send-outlined />
            发送 (Ctrl+Enter)
          </a-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { message } from 'ant-design-vue'
import { 
  RobotOutlined, 
  SendOutlined, 
  ClearOutlined 
} from '@ant-design/icons-vue'
import { generatePageSchema } from '@/utils/aiSchemaGenerator'
import { ComponentData } from '@/store/editor'
import { useStore } from 'vuex'

interface ChatMessage {
  type: 'user' | 'ai'
  content?: string
  text?: string
  schema?: ComponentData[]
  timestamp: number
}

const store = useStore()
const chatContainer = ref<HTMLElement>()
const inputText = ref('')
const isLoading = ref(false)
const chatHistory = reactive<ChatMessage[]>([
  {
    type: 'ai',
    text: '你好！我是你的AI页面设计助手。请描述你想要创建的页面，我会帮你生成相应的页面结构。',
    timestamp: Date.now()
  }
])

const examplePrompts = [
  '创建一个简单的登录页面',
  '设计一个产品展示卡片',
  '制作一个联系我们页面',
  '生成一个新闻文章布局'
]

const sendMessage = async () => {
  if (!inputText.value.trim() || isLoading.value) return
  
  const userMessage: ChatMessage = {
    type: 'user',
    content: inputText.value,
    timestamp: Date.now()
  }
  
  chatHistory.push(userMessage)
  
  const userInput = inputText.value
  inputText.value = ''
  isLoading.value = true
  
  scrollToBottom()
  
  try {
    const result = await generatePageSchema(userInput)
    
    const aiMessage: ChatMessage = {
      type: 'ai',
      text: result.description,
      schema: result.components,
      timestamp: Date.now()
    }
    
    chatHistory.push(aiMessage)
  } catch (error) {
    const aiMessage: ChatMessage = {
      type: 'ai',
      text: '抱歉，处理您的请求时遇到了问题。请稍后重试或换一种表达方式。',
      timestamp: Date.now()
    }
    chatHistory.push(aiMessage)
    console.error('AI生成错误:', error)
  } finally {
    isLoading.value = false
    scrollToBottom()
  }
}

const applySchema = (schema: ComponentData[]) => {
  try {
    // 清空当前组件
    store.commit('editor/setComponents', [])
    
    // 添加新组件
    schema.forEach(component => {
      store.commit('editor/addComponent', component)
    })
    
    message.success('页面结构已应用到编辑器')
  } catch (error) {
    message.error('应用页面结构失败')
    console.error('应用schema错误:', error)
  }
}

const clearChat = () => {
  chatHistory.splice(1) // 保留欢迎消息
  inputText.value = ''
}

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatSchema = (schema: ComponentData[]) => {
  return JSON.stringify(schema, null, 2)
}

const scrollToBottom = () => {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  })
}

onMounted(() => {
  scrollToBottom()
})
</script>

<style lang="scss" scoped>
.ai-agent-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.ai-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  
  h3 {
    margin: 0;
    display: flex;
    align-items: center;
    gap: 8px;
    color: #1890ff;
  }
}

.chat-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  max-height: calc(100vh - 200px);
}

.message-item {
  margin-bottom: 16px;
}

.user-message {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  
  .message-content {
    background: #1890ff;
    color: white;
    padding: 12px 16px;
    border-radius: 18px 18px 4px 18px;
    max-width: 70%;
    word-wrap: break-word;
  }
  
  .message-time {
    font-size: 12px;
    color: #999;
    margin-top: 4px;
  }
}

.ai-message {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  
  .ai-avatar {
    width: 32px;
    height: 32px;
    background: #f6f6f6;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #1890ff;
    flex-shrink: 0;
  }
  
  .message-wrapper {
    flex: 1;
    
    .message-content {
      background: #f6f6f6;
      padding: 12px 16px;
      border-radius: 4px 18px 18px 18px;
      max-width: 85%;
      
      .ai-response {
        margin-bottom: 12px;
        line-height: 1.6;
      }
    }
    
    .message-time {
      font-size: 12px;
      color: #999;
      margin-top: 4px;
      margin-left: 16px;
    }
  }
}

.schema-preview {
  margin-top: 12px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  overflow: hidden;
  
  .schema-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background: #fafafa;
    border-bottom: 1px solid #d9d9d9;
    font-size: 13px;
    font-weight: 500;
  }
  
  .schema-code {
    margin: 0;
    padding: 12px;
    background: #f8f8f8;
    font-size: 12px;
    max-height: 200px;
    overflow-y: auto;
    white-space: pre-wrap;
    word-wrap: break-word;
  }
}

.loading-message {
  display: flex;
  align-items: center;
  gap: 8px;
  
  .ai-avatar {
    width: 32px;
    height: 32px;
    background: #f6f6f6;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #1890ff;
  }
  
  .loading-content {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #666;
    font-style: italic;
  }
}

.input-container {
  border-top: 1px solid #f0f0f0;
  padding: 16px;
}

.input-wrapper {
  .message-input {
    resize: none;
    border-radius: 8px;
  }
  
  .input-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 12px;
    
    .example-prompts {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      
      .example-tag {
        cursor: pointer;
        transition: all 0.3s;
        
        &:hover {
          background: #e6f7ff;
          border-color: #91d5ff;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .input-actions {
    flex-direction: column;
    align-items: stretch !important;
    gap: 12px;
    
    .example-prompts {
      justify-content: center;
    }
  }
}
</style>