<template>
  <div class="edit-groups">
    <a-collapse v-model:activeKey="currentKey" accordion>
      <a-collapse-panel
        v-for="(item, index) in editGroups"
        :key="`item-${index}`"
        :header="item.text"
      >
        <props-table :props="item.props" @change="handleChange"></props-table>
      </a-collapse-panel>
    </a-collapse>
  </div>
</template>

<script lang="ts">
import { AllComponentProps } from '@/defaultProps'
import { difference } from 'lodash-es'
import { defineComponent, PropType, computed, ref } from 'vue'
import PropsTable from './PropsTable.vue'
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
      type: Object as PropType<Partial<AllComponentProps>>,
      required: true,
    },
    groups: {
      type: Array as PropType<GroupProps[]>,
      default: defaultEditGroups,
    },
  },
  components: {
    PropsTable,
  },
  emits: ['change'],
  setup(props, context) {
    const currentKey = ref('item-0')
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
    const editGroups = computed(() => {
      return newGroups.value.map((group) => {
        const propsMap = {} as Partial<AllComponentProps>
        group.items.forEach((item) => {
          const key = item as keyof AllComponentProps
          propsMap[key] = props.props[key]
        })
        return {
          ...group,
          props: propsMap,
        }
      })
    })
    const handleChange = (e: any) => {
      context.emit('change', e)
    }
    return {
      editGroups,
      currentKey,
      handleChange,
    }
  },
})
</script>
