<template>
  <div>
    <!-- 悬浮按钮 -->
    <div
      v-if="!showModal"
      ref="floatingButton"
      class="floating-ai-button"
      :style="{ left: position.x + 'px', top: position.y + 'px' }"
      @mousedown="startDrag"
      @click="openAI"
      :class="{ 'dragging': isDragging }"
    >
      <div class="ai-icon">
        <robot-outlined />
      </div>
      <div class="ai-tooltip">AI助手</div>
    </div>

    <!-- AI助手模态框 -->
    <a-modal
      v-model:visible="showModal"
      title="AI 页面设计助手"
      width="80vw"
      :footer="null"
      class="ai-modal"
      :bodyStyle="{ padding: 0, height: '70vh' }"
      @cancel="closeAI"
    >
      <div class="ai-modal-content">
        <AIAgent />
      </div>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { RobotOutlined } from '@ant-design/icons-vue'
import AIAgent from './AIAgent.vue'

const showModal = ref(false)
const isDragging = ref(false)
const floatingButton = ref<HTMLElement>()

// 悬浮按钮位置
const position = reactive({
  x: 0,
  y: 0
})

// 拖拽相关状态
const dragState = reactive({
  startX: 0,
  startY: 0,
  offsetX: 0,
  offsetY: 0
})

// 初始化位置（右下角）
const initPosition = () => {
  const padding = 20
  position.x = window.innerWidth - 60 - padding
  position.y = window.innerHeight - 60 - padding
}

// 开始拖拽
const startDrag = (e: MouseEvent) => {
  e.preventDefault()
  e.stopPropagation()
  
  isDragging.value = true
  dragState.startX = e.clientX
  dragState.startY = e.clientY
  dragState.offsetX = position.x
  dragState.offsetY = position.y

  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
  
  // 添加全局样式，防止文本选择
  document.body.style.userSelect = 'none'
}

// 拖拽中
const onDrag = (e: MouseEvent) => {
  if (!isDragging.value) return

  const deltaX = e.clientX - dragState.startX
  const deltaY = e.clientY - dragState.startY

  let newX = dragState.offsetX + deltaX
  let newY = dragState.offsetY + deltaY

  // 边界检测
  const buttonSize = 60
  const padding = 10

  newX = Math.max(padding, Math.min(window.innerWidth - buttonSize - padding, newX))
  newY = Math.max(padding, Math.min(window.innerHeight - buttonSize - padding, newY))

  position.x = newX
  position.y = newY
}

// 停止拖拽
const stopDrag = () => {
  isDragging.value = false
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.body.style.userSelect = ''
  
  // 保存位置到localStorage
  localStorage.setItem('aiAssistantPosition', JSON.stringify({
    x: position.x,
    y: position.y
  }))
}

// 打开AI助手
const openAI = () => {
  if (!isDragging.value) {
    showModal.value = true
  }
}

// 关闭AI助手
const closeAI = () => {
  showModal.value = false
}

// 窗口大小改变时调整位置
const handleResize = () => {
  const buttonSize = 60
  const padding = 10
  
  position.x = Math.min(position.x, window.innerWidth - buttonSize - padding)
  position.y = Math.min(position.y, window.innerHeight - buttonSize - padding)
}

// 从localStorage恢复位置
const restorePosition = () => {
  try {
    const saved = localStorage.getItem('aiAssistantPosition')
    if (saved) {
      const savedPosition = JSON.parse(saved)
      position.x = savedPosition.x
      position.y = savedPosition.y
      
      // 验证位置是否在屏幕范围内
      handleResize()
    } else {
      initPosition()
    }
  } catch {
    initPosition()
  }
}

onMounted(() => {
  restorePosition()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
})
</script>

<style lang="scss" scoped>
.floating-ai-button {
  position: fixed;
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #1890ff, #40a9ff);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1000;
  box-shadow: 0 4px 20px rgba(24, 144, 255, 0.3);
  transition: all 0.3s ease;
  user-select: none;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 25px rgba(24, 144, 255, 0.4);
    
    .ai-tooltip {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }

  &:active {
    transform: scale(0.95);
  }

  &.dragging {
    transform: scale(1.05);
    cursor: grabbing;
    
    .ai-tooltip {
      opacity: 0;
    }
  }

  .ai-icon {
    color: white;
    font-size: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .ai-tooltip {
    position: absolute;
    bottom: 70px;
    left: 50%;
    transform: translateX(-50%) translateY(10px);
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 12px;
    white-space: nowrap;
    opacity: 0;
    transition: all 0.3s ease;
    pointer-events: none;

    &::after {
      content: '';
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      border: 5px solid transparent;
      border-top-color: rgba(0, 0, 0, 0.8);
    }
  }
}

// 脉冲动画
@keyframes pulse {
  0% {
    box-shadow: 0 4px 20px rgba(24, 144, 255, 0.3);
  }
  50% {
    box-shadow: 0 4px 20px rgba(24, 144, 255, 0.5), 0 0 0 10px rgba(24, 144, 255, 0.1);
  }
  100% {
    box-shadow: 0 4px 20px rgba(24, 144, 255, 0.3);
  }
}

.floating-ai-button {
  animation: pulse 3s infinite;
}
</style>

<style lang="scss">
// 全局样式修复模态框
.ai-modal {
  .ant-modal-content {
    overflow: hidden;
  }

  .ai-modal-content {
    height: 70vh;
    display: flex;
    flex-direction: column;
  }
}
</style> 