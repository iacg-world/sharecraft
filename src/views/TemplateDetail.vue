<template>
  <div class="work-detail-container">
    <a-row type="flex" justify="center" v-if="template">
      <a-col :span="8" class="cover-img">
        <a :href="template.coverImg"
          ><img :src="template.coverImg" alt="" id="cover-img"
        /></a>
      </a-col>
      <a-col :span="8">
        <h2>{{ template.title }}</h2>
        <p>{{ template.desc }}</p>
        <div class="author">
          <a-avatar>V</a-avatar>
          该模版由 <b>{{ template.author }}</b> 创作
        </div>
        <div class="bar-code-area">
          <span>扫一扫，手机预览</span>
          <canvas id="barcode-container"></canvas>
        </div>
        <div class="use-button">
          <a-button type="primary" size="large" @click="copyWork">
            使用模版
          </a-button>
          <a-button size="large" @click="download"> 下载图片海报 </a-button>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script lang="ts">
import { baseH5URL } from '@/axios'
import { defineComponent, computed, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import { GlobalDataProps } from '@/store/index'
import { TemplateProps } from '@/store/templates'
import { generateQRCode, downloadImage } from '@/helper'
export default defineComponent({
  setup() {
    const route = useRoute()
    const store = useStore<GlobalDataProps>()
    const currentId = route.params.id as string
    const template = computed<TemplateProps>(() =>
      store.getters.getTemplateById(parseInt(currentId))
    )
    const channelURL = computed(
      () => `${baseH5URL}/p/${template.value.id}-${template.value.uuid}`
    )
    onMounted(async () => {
      await store.dispatch('fetchTemplate', { urlParams: { id: currentId } })
      await nextTick()
      await generateQRCode('barcode-container', channelURL.value, 150)
    })
    const download = () => {
      downloadImage(template.value.coverImg)
    }

    const copyWork = () => {
      store.dispatch('copyWorkAndJump', currentId)
    }
    return {
      route,
      template,
      download,
      copyWork,
    }
  },
})
</script>

<style scoped>
.work-detail-container {
  margin-top: 50px;
}
.cover-img {
  margin-right: 30px;
}
.cover-img img {
  width: 100%;
}
.use-button {
  margin: 30px 0;
}
.ant-avatar {
  margin-right: 10px;
}
.bar-code-area {
  margin: 20px 0;
}
#barcode-container {
  display: block;
}
</style>
