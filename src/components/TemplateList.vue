<template>
  <div class="template-list-component">
    <a-row :gutter="16">
      <a-col :span="6" v-for="item in list" :key="item.id" class="poster-item">
        <router-link :to="{ name: 'template', params: { id: item.id } }">
          <a-card hoverable>
            <template v-slot:cover>
              <img :src="item.coverImg" v-if="item.coverImg" />
              <img
                src="https://static.jiebao.zhenai.com/seeyou/home/topic-activity/topic_activity-top_bg.png"
                v-else
              />
              <div class="hover-item">
                <a-button size="large" type="primary">查看模板</a-button>
              </div>
            </template>
            <a-card-meta :title="item.title">
              <template v-slot:description>
                <div class="description-detail">
                  <span>作者：{{ handlEprivacy(item) }}</span>
                  <span class="user-number">{{ item.copiedCount }}</span>
                </div>
              </template>
            </a-card-meta>
          </a-card>
          <div class="tag-list">
            <a-tag color="red" v-if="item.isHot"> HOT </a-tag>
            <a-tag color="green" v-if="item.isNew"> NEW </a-tag>
          </div>
        </router-link>
      </a-col>
    </a-row>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { TemplateProps } from '../store/templates'
export default defineComponent({
  name: 'template-list',
  props: {
    list: {
      type: Array as PropType<TemplateProps[]>,
      required: true,
    },
  },
  methods: {
    handlEprivacy(item: TemplateProps) {
      const name = item.user?.nickName ? item.user.nickName : item.author
      if (/^1[3456789]\d{9}/.test(name)) {
        return name.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
      } else if (/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/.test(name)) {
        return name.replace(/(\w{1,3})\w+(\w{1,2}@\w+\.\w+)/, '$1***$2')
      } else {
        return name
      }
    },
  },
})
</script>

<style>
.poster-item {
  position: relative;
  margin-bottom: 20px;
}
.poster-item .ant-card {
  border-radius: 12px;
}
.poster-item .ant-card-cover {
  height: 390px;
}
.poster-item .ant-card-cover > img {
  width: 100%;
}
.poster-item .ant-card-hoverable {
  box-shadow: 0px 5px 10px 0px rgba(0, 0, 0, 0.1);
}
.poster-item .ant-card-body {
  padding: 0;
}
.poster-item .ant-card-meta {
  margin: 0;
}
.poster-item .ant-card-meta-title {
  color: #333;
  padding: 10px 12px;
  border-bottom: 1px solid #f2f2f2;
  margin-bottom: 0 !important;
}
.description-detail {
  display: flex;
  justify-content: space-between;
  padding: 13px 12px;
  color: #999;
}
.user-number {
  font-weight: bold;
}
.poster-title {
  height: 70px;
}
.poster-title h2 {
  margin-bottom: 0px;
}
.poster-item .ant-card-cover {
  position: relative;
  overflow: hidden;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
}
.poster-item .ant-card-cover img {
  transition: all ease-in 0.2s;
}
.poster-item .ant-card-cover .hover-item {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  display: none;
  background: rgba(0, 0, 0, 0.8);
  align-items: center;
  justify-content: center;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
}
.poster-item:hover .hover-item {
  display: flex;
}
.poster-item:hover img {
  transform: scale(1.25);
}
.barcode-container img {
  border-radius: 0;
}
.tag-list {
  position: absolute;
  top: -4px;
  left: 6px;
}
</style>
