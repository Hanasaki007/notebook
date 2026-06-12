<template>
  <div class="tab-bar">
    <div
      v-for="tab in tabs"
      :key="tab.id"
      class="tab-item"
      :class="{ active: currentTab === tab.id }"
      @click="switchTab(tab.id)"
    >
      <div class="tab-icon">
        <img
          :src="tab.icon"
          alt=""
          aria-hidden="true"
          width="24"
          height="24"
          @error="(e) => (e.target.style.display = 'none')"
        />
      </div>
      <div class="tab-label">{{ tab.label }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import notesIcon from '@/assets/icon-notes.png'
import todosIcon from '@/assets/icon-todos.png'
import settingsIcon from '@/assets/icon-settings.png'

const router = useRouter()
const route = useRoute()

const currentTab = computed(() => {
  if (route.path.startsWith('/todos')) return 'todos'
  if (route.path.startsWith('/settings')) return 'settings'
  return 'notes'
})

const tabs = [
  { id: 'notes', label: '记事', icon: notesIcon },
  { id: 'todos', label: '待办', icon: todosIcon },
  { id: 'settings', label: '设置', icon: settingsIcon }
]

const switchTab = (tabId) => {
  router.push(`/${tabId}`)
}
</script>

<style scoped>
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: var(--bg-secondary);
  display: flex;
  justify-content: space-around;
  align-items: center;
  border-top: 1px solid var(--border-color);
  z-index: 100;
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6px 16px;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
  border-radius: 8px;
  margin: 4px 0;
  position: relative;
}

.tab-item:hover {
  background: var(--hover-bg);
}

.tab-item.active {
  color: var(--primary-color);
  background: none;
}

.tab-icon {
  margin-bottom: 4px;
  transition: transform var(--duration-fast) var(--ease-spring);
}

.tab-item:active .tab-icon {
  transform: scale(0.85);
}

.tab-item.active .tab-icon {
  transform: scale(1.1);
}

.tab-icon img {
  width: 24px;
  height: 24px;
  object-fit: contain;
  filter: grayscale(100%);
  opacity: 0.4;
  transition: filter var(--duration-normal) var(--ease-out),
              opacity var(--duration-normal) var(--ease-out);
}

.tab-item.active .tab-icon img {
  filter: none;
  opacity: 1;
}

.tab-label {
  font-size: 12px;
  font-weight: 500;
  transition: color var(--duration-fast) var(--ease-out),
              transform var(--duration-fast) var(--ease-out);
}

.tab-item.active .tab-label {
  transform: translateY(-1px);
}
</style>