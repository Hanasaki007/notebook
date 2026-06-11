<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import TabBar from './components/TabBar.vue'
import { db } from './db'

const route = useRoute()
const currentTab = ref('notes')

// 根据当前路由更新标签页
watch(() => route.path, (path) => {
  if (path.startsWith('/notes')) {
    currentTab.value = 'notes'
  } else if (path.startsWith('/todos')) {
    currentTab.value = 'todos'
  } else if (path.startsWith('/settings')) {
    currentTab.value = 'settings'
  }
}, { immediate: true })


</script>

<template>
  <div class="app-container">
    <router-view />
    <TabBar v-if="!route.path.includes('/new') && !route.path.includes('/edit')" />
  </div>
</template>

<style>
@import './styles/global.css';

.app-container {
  min-height: 100vh;
  position: relative;
}
</style>
