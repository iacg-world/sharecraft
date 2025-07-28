<template>
  <div class="form-builder-demo">
    <DraggableForm />
  </div>
</template>

<script setup lang="ts">
import DraggableForm from '@/components/DraggableForm/index.vue'
</script>

<style scoped lang="scss">
.form-builder-demo {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}
</style>