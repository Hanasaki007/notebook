<template>
  <nav class="tabbar" aria-label="主导航">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      class="tab"
      :class="{ 'tab--active': currentTab === tab.id }"
      :aria-current="currentTab === tab.id ? 'page' : undefined"
      @click="switchTab(tab.id)"
    >
      <span class="tab__icon">
        <!-- 记事：文档线条 -->
        <svg v-if="tab.id === 'notes'" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M5 3.5h9.5L19 8v12.5H5z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" />
          <path d="M14 3.5V8h4.5" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" />
          <path d="M8 12.5h7M8 15.5h7M8 18h4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
        </svg>
        <!-- 待办：对勾圆 -->
        <svg v-else-if="tab.id === 'todos'" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="8.5" stroke="currentColor" stroke-width="1.6" />
          <path d="M8.5 12.2l2.4 2.4 4.6-4.8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <!-- 设置：齿轮 -->
        <svg v-else viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.6" />
          <path d="M12 2.5v2.2M12 19.3v2.2M21.5 12h-2.2M4.7 12H2.5M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6M18.7 18.7l-1.6-1.6M6.9 6.9L5.3 5.3"
                stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
        </svg>
      </span>
      <span class="tab__label">{{ tab.label }}</span>
    </button>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const currentTab = computed(() => {
  if (route.path.startsWith('/todos')) return 'todos'
  if (route.path.startsWith('/settings')) return 'settings'
  return 'notes'
})

const tabs = [
  { id: 'notes', label: '记事' },
  { id: 'todos', label: '待办' },
  { id: 'settings', label: '设置' }
]

const switchTab = (tabId) => {
  if (currentTab.value === tabId) return
  router.push(`/${tabId}`)
}
</script>

<style scoped>
.tabbar {
  position: fixed;
  left: var(--sp-4);
  right: var(--sp-4);
  bottom: var(--sp-3);
  z-index: var(--z-bar);
  height: var(--tabbar-h);
  display: flex;
  align-items: stretch;
  background: rgba(40, 40, 50, 0.72);
  backdrop-filter: saturate(180%) blur(24px);
  -webkit-backdrop-filter: saturate(180%) blur(24px);
  border: 0.5px solid rgba(255, 255, 255, 0.18);
  border-radius: var(--r-xl) var(--r-xl) var(--r-lg) var(--r-lg);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3),
              inset 0 1px 0 rgba(255, 255, 255, 0.12);
  padding-bottom: env(safe-area-inset-bottom, 0);
}

.tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: var(--sp-1) 0;
  color: var(--gray-400);
  transition: color var(--dur-fast) var(--ease);
}

.tab__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
}
.tab__icon svg {
  width: 24px;
  height: 24px;
}

.tab__label {
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.01em;
}

.tab--active {
  color: var(--brand);
}
</style>
