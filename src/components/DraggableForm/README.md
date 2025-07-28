# 拖拽表单构建器

一个基于 Vue 3 + TypeScript + Ant Design Vue + VueDraggable 的拖拽表单构建系统。

## 功能特性

- ✅ **拖拽排序**: 支持通过上下拖动调整表单组件顺序，不允许横坐标左右移动
- ✅ **三种组件**: 输入框、单选项、多选项组件
- ✅ **实时预览**: 所见即所得的表单预览
- ✅ **属性配置**: 每个组件都有完整的属性配置面板
- ✅ **数据收集**: 实时收集和展示表单数据
- ✅ **表单验证**: 支持必填、格式验证等规则

## 组件说明

### 1. 输入框组件 (FormInputComponent)
- 支持多种输入类型：文本、数字、邮箱、电话、网址、密码
- 可配置：标签、占位符、最大长度、必填、禁用等
- 内置验证：邮箱格式、手机号格式、身份证格式、自定义正则

### 2. 单选项组件 (FormRadioComponent)
- 支持垂直/水平排列
- 可动态添加/删除选项
- 支持设置默认值和禁用选项

### 3. 多选项组件 (FormCheckboxComponent)
- 支持垂直/水平排列
- 可设置最少/最多选择数量
- 支持全选功能
- 可设置默认选中项

## 使用方法

### 基础使用

```vue
<template>
  <DraggableForm />
</template>

<script setup lang="ts">
import DraggableForm from '@/components/DraggableForm/index.vue'
</script>
```

### 在路由中使用

```typescript
// router/index.ts
{
  path: '/form-builder',
  name: 'FormBuilder',
  component: () => import('@/views/FormBuilderDemo.vue')
}
```

## 目录结构

```
DraggableForm/
├── DraggableFormBuilder.vue       # 主构建器组件
├── index.vue                      # 入口文件
├── components/                    # 表单组件
│   ├── FormInputComponent.vue     # 输入框组件
│   ├── FormRadioComponent.vue     # 单选项组件
│   └── FormCheckboxComponent.vue  # 多选项组件
├── property-panels/               # 属性配置面板
│   ├── InputPropertyPanel.vue     # 输入框属性面板
│   ├── RadioPropertyPanel.vue     # 单选项属性面板
│   └── CheckboxPropertyPanel.vue  # 多选项属性面板
└── README.md                      # 说明文档
```

## 操作指南

### 1. 添加组件
- 点击左侧组件库中的组件图标
- 或使用顶部的"添加组件"按钮和下拉菜单

### 2. 拖拽排序
- 点击组件工具栏中的拖拽图标（四个方向的箭头）
- 上下拖动组件到目标位置

### 3. 编辑属性
- 点击组件工具栏中的设置图标
- 在右侧属性面板中修改组件配置

### 4. 删除组件
- 点击组件工具栏中的删除图标（红色垃圾桶）

### 5. 查看数据
- 填写表单后，底部会实时显示收集的表单数据

## 扩展开发

### 添加新的表单组件

1. 在 `components/` 目录下创建新组件
2. 在 `property-panels/` 目录下创建对应的属性面板
3. 在 `DraggableFormBuilder.vue` 中注册新组件
4. 更新组件类型映射

### 自定义样式

所有组件都使用 SCSS 编写样式，支持深度选择器自定义 Ant Design 组件样式。

## 技术栈

- **Vue 3**: 渐进式 JavaScript 框架
- **TypeScript**: 类型安全的 JavaScript 超集
- **Ant Design Vue**: 企业级 UI 设计语言和组件库
- **VueDraggable**: Vue 拖拽组件库
- **SCSS**: CSS 预处理器

## 依赖要求

确保项目已安装以下依赖：

```json
{
  "vue": "^3.5.17",
  "ant-design-vue": "^4.2.3",
  "vuedraggable": "^4.1.0"
}
```