<template>
  <div>
    <Select
      v-model:value="v1"
      placeholder="中文字体"
      :options="formatOptions(fontFamilyArr[0].options)"
      @change="selectChange"
      allowClear
      style="min-width: 130px; margin-bottom: 5px"
    ></Select>
    <Select
      v-model:value="v2"
      placeholder="英文字体"
      :options="formatOptions(fontFamilyArr[1].options)"
      @change="selectChange"
      allowClear
      style="min-width: 130px"
    ></Select>
  </div>
</template>

<script setup lang="tsx">
import { Select, SelectProps } from 'ant-design-vue/es'
import { ref, VNode, defineProps, defineEmits } from 'vue'
const props = defineProps({
  value: {
    type: String,
  },
})
const arr = props.value?.split(',') || []
const v1 = ref(arr[1])
const v2 = ref(arr[0])
const fontFamilyArr = [
  {
    label: '中文字体',
    options: [
      { label: '无', value: '无' },
      { label: '宋体', value: '"SimSun"' },
      { label: '黑体', value: '"SimHei"' },
      // { label: '微软雅黑', value: '"Microsoft YaHei"' },
      { label: '楷体', value: '"KaiTi"' },
      { label: '仿宋', value: '"FangSong"' },
      { label: '目哉像素体（三方）', value: '"MuzaiPixel"' },
      { label: '汇文明朝体（三方）', value: '"Huiwen-mincho"' },
    ],
  },
  {
    label: '英文字体',
    options: [
      { label: '无', value: '无' },
      {
        label: 'Palatino Linotype',
        value: '"Palatino Linotype"',
      },
      { label: 'Comic Sans MS', value: '"Comic Sans MS"' },
      { label: 'Verdana', value: '"Verdana"' },
      { label: 'Times New Roman', value: '"Times New Roman"' },
      { label: 'Trebuchet MS', value: '"Trebuchet MS"' },
      { label: 'Georgia', value: '"Georgia"' },
      { label: 'Arial', value: '"Arial"' },
      { label: 'Impact', value: '"Impact"' },
    ],
  },
]
const formatOptions = (options: Exclude<SelectProps['options'], undefined>) => {
  return options.map((font) => {
    return {
      value: font.value,
      label: (
        <span style={{ fontFamily: font.value as string }}>{font.label}</span>
      ) as VNode,
    }
  })
}

const emit = defineEmits(['change'])
const selectChange = () => {
  const res = [v2.value || '无', v1.value].filter((item) => item).toString()

  emit('change', res)
}
</script>

<style></style>
