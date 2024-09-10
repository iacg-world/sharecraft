<template>
  <div class="publish-channel-container">
    <a-row :gutter="20" :style="{ marginBottom: '10px', marginTop: '20px' }">
      <a-col :span="6" class="left-col">
        <div class="final-preview">
          <div class="final-preview-inner">
            <img :src="page.coverImg" :alt="page.title" />
          </div>
          <div class="home_key"></div>
        </div>
        <a-button type="primary" :href="page.coverImg">
          <template #icon>
            <DownloadOutlined />
          </template>
          下载图片
        </a-button>
      </a-col>
      <a-col :span="14" class="right-col">
        <a-row>
          <a-col :span="18" class="left-gap">
            <h4>标题：{{ page.title }}</h4>
            <p>描述：{{ page.desc }}</p>
          </a-col>
        </a-row>
        <a-tabs type="card" :style="{ marginTop: '20px' }">
          <a-tab-pane key="template" tab="发布为模板">
            <a-form>
              <a-form-item label="发布模板">
                <a-radio-group v-model:value="isPublic">
                  <a-radio :value="0">发布为个人模板</a-radio>
                  <a-radio :value="1">发布为公开模板</a-radio>
                </a-radio-group>
              </a-form-item>
            </a-form>

            <a-button type="primary" @click="publishTemplate">
              一键发布模板
            </a-button>
          </a-tab-pane>
          <a-tab-pane key="channels" tab="渠道管理" disabled>
            <a-row
              v-for="channel in channels"
              :key="channel.id"
              class="channel-item"
            >
              <a-col :span="6">
                <canvas
                  class="barcode-container"
                  :id="`channel-barcode-${channel.id}`"
                />
              </a-col>
              <a-col :span="18" class="left-gap">
                <h4>{{ channel.name }}</h4>
                <a-row>
                  <a-col :span="18">
                    <a-input
                      :value="generateChannelURL(channel.id)"
                      :readonly="true"
                      :id="`channel-url-${channel.id}`"
                    />
                  </a-col>
                  <a-col :span="6">
                    <a-button
                      class="copy-button"
                      :data-clipboard-target="`#channel-url-${channel.id}`"
                      >复制</a-button
                    >
                  </a-col>
                </a-row>
              </a-col>
              <div class="delete-area">
                <a-button
                  type="danger"
                  size="small"
                  @click="deleteChannel(channel.id)"
                  :disabled="deleteDisabled"
                  >删除渠道</a-button
                >
              </div>
            </a-row>
            <a-form
              layout="inline"
              :style="{ marginTop: '20px' }"
              :model="form"
              :rules="rules"
            >
              <a-form-item name="channelName">
                <a-input
                  placeholder="渠道名称"
                  v-model:value="form.channelName"
                ></a-input>
              </a-form-item>
              <a-form-item>
                <a-button type="primary" @click="createChannel">
                  创建新渠道
                </a-button>
              </a-form-item>
            </a-form>
          </a-tab-pane>
        </a-tabs>
      </a-col>
    </a-row>
  </div>
</template>

<script lang="ts" setup>
import { reactive, computed, onMounted, watch, ref } from 'vue'
import { useForm } from 'ant-design-vue/lib/form'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import { GlobalDataProps } from '@/store/index'
import { baseH5URL } from '@/axios'
import { generateQRCode } from '@/helper'
import { last } from 'lodash-es'
import { message } from 'ant-design-vue/es'
import ClipboardJS from 'clipboard'
import { DownloadOutlined } from '@ant-design/icons-vue'

const store = useStore<GlobalDataProps>()
const route = useRoute()
const currentWorkId = route.params.id as string
const page = computed(() => store.state.editor.page)
const channels = computed(() => store.state.editor.channels)
const form = reactive({
  channelName: '',
})
const rules = reactive({
  channelName: [{ required: true, message: '标题不能为空', trigger: 'blur' }],
})
const { validate } = useForm(form, rules)
const generateChannelURL = (id: number) =>
  `${baseH5URL}/p/${page.value.id}-${page.value.uuid}?channel=${id}`
const createChannel = async () => {
  const payload = {
    name: form.channelName,
    workId: parseInt(currentWorkId),
  }
  try {
    await validate()
    await store.dispatch('createChannel', { data: payload })
    form.channelName = ''
  } catch (e) {
    console.error(e)
  }
}
const deleteDisabled = computed(() => channels.value.length === 1)
const deleteChannel = (id: number) => {
  store.dispatch('deleteChannel', { urlParams: { id } })
}

onMounted(() => {
  const clipboard = new ClipboardJS('.copy-button')
  clipboard.on('success', (e) => {
    message.success('复制成功', 1)
    e.clearSelection()
  })
  channels.value.forEach(async (channel) => {
    try {
      await generateQRCode(
        `channel-barcode-${channel.id}`,
        generateChannelURL(channel.id)
      )
    } catch (e) {
      console.error(e)
    }
  })
})
watch(
  channels,
  async (newChannels, oldChannels) => {
    if (newChannels.length > oldChannels.length) {
      const createdChannel = last(newChannels)
      if (createdChannel) {
        await generateQRCode(
          `channel-barcode-${createdChannel.id}`,
          generateChannelURL(createdChannel.id)
        )
      }
    }
  },
  {
    flush: 'post',
  }
)

const isPublic = ref(0)
const publishTemplate = async () => {
  const urlParams = { id: currentWorkId, isPublic: isPublic.value }

  await store.dispatch('publishTemplate', { urlParams })
  message.success('模板发布成功', 1)
}
</script>

<style lang="scss">
.publish-channel-container {
  position: relative;
  height: 60vh;

  .final-preview {
    margin-bottom: 5px;
    position: relative;
    box-sizing: border-box;
    height: 52vh;
    background: transparent;
    z-index: 1500;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .home_key {
    position: absolute;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background-color: #d8d8d8;
    bottom: 5px;
  }
  .final-preview-inner {
    box-sizing: border-box;
    height: 100%;
    position: relative;
    border-style: solid;
    border-color: #bbb;
    border-width: 20px 8px 30px;
    border-radius: 20px;
    overflow-y: auto;
    overflow-x: hidden;
    background: #ffffff;
  }
}
.left-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  img {
    width: 100%;
    box-shadow: outset 10px 10px 10px #efefef;
  }
}

.left-gap {
  padding-left: 5px;
  height: 80px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  h4 {
    font-size: large;
    font-weight: bold;
  }
}
.delete-area {
  position: absolute;
  top: 10px;
  right: 20px;
}
.channel-item {
  padding: 10px 0;
  border-bottom: 1px solid #efefef;
  position: relative;
}
.barcode-container {
  height: 80px;
  width: 80px;
}
.template-submit {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>
