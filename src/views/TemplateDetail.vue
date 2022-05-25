<template>
  <div class="work-detail-container">
    <pre>{{ route }}</pre>
    <a-row type="flex" justify="center">
      <a-col :span="8" class="cover-img">
        <img
          src="https://static.jiebao.zhenai.com/seeyou/home/topic-activity/topic_activity-top_bg.png"
          alt=""
        />
      </a-col>
      <a-col :span="8">
        <h2>iacg落地页海报</h2>
        <p>如何突破前端成长瓶颈？</p>
        <div class="author">
          <a-avatar>V</a-avatar>
          该模版由 <b>Viking</b> 创作
        </div>
        <div class="bar-code-area">
          <span>扫一扫，手机预览</span>
          <div ref="container"></div>
        </div>
        <div class="use-button">
          <router-link to="/editor">
            <a-button type="primary" size="large"> 使用模版 </a-button>
          </router-link>
          <a-button size="large"> 下载图片海报 </a-button>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useRoute } from 'vue-router'
export default defineComponent({
  setup() {
    const route = useRoute()
    return {
      route,
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
</style>
