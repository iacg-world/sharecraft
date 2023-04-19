<!-- 功能分组 -->
<template>
  <div class="edit-groups">
    <div v-for="item in newGroups" :key="item.text">
      <h1>{{ item.text }}</h1>
      <pre>{{ item.items }}</pre>
    </div>
  </div>
</template>

<script lang="ts">
import { AllComponentProps } from '@/defaultProps'
import { difference } from 'lodash'
import { defineComponent, PropType, computed, ref } from 'vue'
export interface GroupProps {
  text: string
  items: string[]
}
const defaultEditGroups: GroupProps[] = [
  {
    text: '尺寸',
    items: [
      'height',
      'width',
      'paddingLeft',
      'paddingRight',
      'paddingTop',
      'paddingBottom',
    ],
  },
  {
    text: '边框',
    items: ['borderStyle', 'borderColor', 'borderWidth', 'borderRadius'],
  },
  {
    text: '阴影与透明度',
    items: ['opacity', 'boxShadow'],
  },
  {
    text: '位置',
    items: ['left', 'top'],
  },
  {
    text: '事件功能',
    items: ['actionType', 'url'],
  },
]

export default defineComponent({
  props: {
    props: {
      type: Object as PropType<AllComponentProps>,
      required: true,
    },
    groups: {
      type: Array as PropType<GroupProps[]>,
      default: defaultEditGroups,
    },
  },
  setup(props, context) {
    const newGroups = computed(() => {
      const allNormalProps = props.groups.reduce((prev, current) => {
        return [...prev, ...current.items]
      }, [] as string[])
      const specialProps = difference(Object.keys(props.props), allNormalProps)
      return [
        {
          text: '基本属性',
          items: specialProps,
        },
        ...props.groups,
      ]
    })
    return {
      newGroups,
    }
  },
})
</script>
