<template>
  <Home />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Home from './views/HomeView.vue'
import Editor from './views/Editor.vue'
import TemplateDetail from './views/TemplateDetail.vue'
export default defineComponent({
  name: 'App',
  components: {
    Home,
  },
})
</script>
