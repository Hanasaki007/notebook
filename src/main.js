import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// 在挂载前应用主题，避免首屏闪烁
const savedTheme = localStorage.getItem('theme')
if (savedTheme === 'light' || savedTheme === 'dark') {
  document.documentElement.setAttribute('data-theme', savedTheme)
}

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
