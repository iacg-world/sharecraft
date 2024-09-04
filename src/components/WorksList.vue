<template>
  <div class="works-list-component">
    <a-skeleton v-if="loading" />
    <a-row :gutter="16" v-else>
      <a-col :span="6" v-for="item in list" :key="item.id" class="poster-item">
        <a-card hoverable>
          <template v-slot:cover>
            <img :src="item.coverImg" v-if="item.coverImg" />
            <img
              src="https://sharecraft-backend.oss-cn-shanghai.aliyuncs.com/sharecraft-test/20180421210121_KddAy.jpeg"
              v-else
            />
            <div class="hover-item">
              <router-link :to="`/editor/${item.id}`"
                ><a-button size="large" type="primary"
                  >继续编辑该作品</a-button
                ></router-link
              >
            </div>
          </template>
          <template v-slot:actions>
            <router-link :to="`/editor/${item.id}`"
              ><EditOutlined key="edit"
            /></router-link>
            <a-dropdown>
              <EllipsisOutlined key="ellipsis" />
              <template v-slot:overlay>
                <a-menu class="overlay-dropdown">
                  <a-menu-item v-if="item.isTemplate && item.isPublic">
                    <a
                      href="javascript:;"
                      @click.prevent="publishClicked(item.id, 0)"
                      ><LockOutlined /> 设置为个人模板</a
                    >
                  </a-menu-item>
                  <a-menu-item v-else-if="item.isTemplate && !item.isPublic">
                    <a
                      href="javascript:;"
                      @click.prevent="publishClicked(item.id, 1)"
                      ><ShareAltOutlined /> 设置为公开模板</a
                    >
                  </a-menu-item>
                  <a-menu-item v-if="item.isPublic">
                    <a href="javascript:;" @click.prevent="copyClicked(item.id)"
                      ><CopyOutlined /> 复制</a
                    >
                  </a-menu-item>
                  <a-menu-item>
                    <a
                      href="javascript:;"
                      @click.prevent="deleteClicked(item.id, item.isTemplate)"
                      ><DeleteOutlined /> 删除</a
                    >
                  </a-menu-item>
                  <a-menu-item v-if="item.coverImg">
                    <a href="javascript:;"><DownloadOutlined /> 下载图片</a>
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </template>
          <a-card-meta :title="item.title"> </a-card-meta>
        </a-card>
        <div class="tag-list">
          <a-tag color="red" v-if="item.status === 1"> 未发布 </a-tag>
          <a-tag color="green" v-if="item.status === 2"> 已发布 </a-tag>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import {
  EditOutlined,
  EllipsisOutlined,
  CopyOutlined,
  DeleteOutlined,
  DownloadOutlined,
  ShareAltOutlined,
  LockOutlined,
} from '@ant-design/icons-vue'
import { TemplateProps } from '../store/templates'
import { Modal } from 'ant-design-vue/es'
export default defineComponent({
  name: 'works-list',
  emits: ['on-copy', 'on-delete', 'on-publish'],
  components: {
    EditOutlined,
    EllipsisOutlined,
    CopyOutlined,
    DeleteOutlined,
    DownloadOutlined,
    ShareAltOutlined,
    LockOutlined,
  },
  props: {
    list: {
      type: Array as PropType<TemplateProps[]>,
      required: true,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    transferStatus: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, context) {
    const deleteClicked = (id: number, isTemplate: boolean) => {
      Modal.confirm({
        title: '确定要删除该作品吗？',
        okText: '删除',
        okType: 'danger',
        cancelText: '取消',
        onOk: () => {
          context.emit('on-delete', id, isTemplate ? 1 : 0)
        },
      })
    }
    const copyClicked = (id: number) => {
      context.emit('on-copy', id)
    }

    const publishClicked = (id: number, isPublic: 0 | 1) => {
      context.emit('on-publish', id, isPublic)
    }

    return {
      deleteClicked,
      copyClicked,
      publishClicked,
    }
  },
})
</script>
