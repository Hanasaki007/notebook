<template>
  <div class="page settings-page">
    <header class="hd">
      <div class="hd__row">
        <div class="hd__left">
          <h1 class="hd__title">设置</h1>
        </div>
        <div class="hd__right">
          <button class="pill" @click="openEditModal">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M15.2 5.8l3 3L9.4 17.6H6.4v-3l9.8-8.8z"
                    stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <span>编辑</span>
          </button>
        </div>
      </div>
    </header>

    <!-- 用户资料卡片 -->
    <section class="profile">
      <button class="profile__avatar" aria-label="更换头像" @click="changeAvatar">
        <img v-if="settings.avatar" :src="settings.avatar" alt="" />
        <span v-else class="profile__avatar-fallback">{{ initials }}</span>
        <span class="profile__avatar-overlay">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
        </span>
      </button>
      <div class="profile__info">
        <span class="profile__name">{{ settings.username }}</span>
      </div>
    </section>

    <!-- 外观（主题切换） -->
    <section class="theme">
      <h3 class="section-title">外观</h3>
      <div class="theme__group" role="tablist" aria-label="主题">
        <button
          class="theme__btn"
          :class="{ 'theme__btn--active': theme === 'dark' }"
          role="tab"
          :aria-selected="theme === 'dark'"
          @click="setTheme('dark')"
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M20 13.5A8 8 0 0 1 10.5 4a8 8 0 1 0 9.5 9.5z"
                  stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" />
          </svg>
          <span>深色</span>
        </button>
        <button
          class="theme__btn"
          :class="{ 'theme__btn--active': theme === 'light' }"
          role="tab"
          :aria-selected="theme === 'light'"
          @click="setTheme('light')"
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.6" />
            <path d="M12 2.5v2.2M12 19.3v2.2M21.5 12h-2.2M4.7 12H2.5M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6M18.7 18.7l-1.6-1.6M6.9 6.9L5.3 5.3"
                  stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
          </svg>
          <span>浅色</span>
        </button>
      </div>
    </section>

    <!-- 关于 -->
    <section class="about">
      <h3 class="section-title">关于</h3>
      <div class="about__info">
          <p class="about__name">柚子便签 v2.3</p>
          <p class="about__desc">简洁大方，持续改进的便签应用</p>
      </div>
    </section>

    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      hidden
      @change="handleAvatarUpload"
    />

    <!-- 编辑用户名弹窗 -->
    <Transition name="modal">
      <div v-if="showEditModal" class="dialog" @click="closeEditModal">
        <div class="dialog__backdrop"></div>
        <div class="dialog__card modal-card" @click.stop>
          <h3 class="dialog__title">修改用户名</h3>
          <input
            v-model="tempUsername"
            type="text"
            class="dialog__input"
            placeholder="输入用户名"
            autofocus
            @keyup.enter="saveUsername"
          />
          <div class="dialog__actions">
            <button class="dialog__btn dialog__btn--cancel" @click="closeEditModal">取消</button>
            <button class="dialog__btn dialog__btn--confirm" @click="saveUsername">确定</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { db } from '../db'

const fileInput = ref(null)
const showEditModal = ref(false)
const tempUsername = ref('')
const settings = ref({
  id: 1,
  username: '用户',
  avatar: ''
})

// 主题：从 localStorage 初始化（main.js 已在挂载前应用）
const theme = ref(localStorage.getItem('theme') || 'dark')

const setTheme = (value) => {
  if (value !== 'dark' && value !== 'light') return
  theme.value = value
  localStorage.setItem('theme', value)
  document.documentElement.setAttribute('data-theme', value)
}

const initials = computed(() => {
  return settings.value.username ? settings.value.username.charAt(0).toUpperCase() : 'U'
})

const loadSettings = async () => {
  const saved = await db.settings.get(1)
  if (saved) settings.value = saved
}

const saveSettings = async () => {
  const data = JSON.parse(JSON.stringify(settings.value))
  await db.settings.put(data)
}

const openEditModal = () => {
  tempUsername.value = settings.value.username
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
}

const saveUsername = async () => {
  const trimmed = tempUsername.value.trim()
  if (trimmed) {
    settings.value.username = trimmed
    await saveSettings()
    showEditModal.value = false
  }
}

const changeAvatar = () => fileInput.value.click()

const handleAvatarUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (e) => {
    settings.value.avatar = e.target.result
    saveSettings()
  }
  reader.readAsDataURL(file)
  event.target.value = ''
}

onMounted(() => {
  loadSettings()
})
</script>

<style scoped>
/* ============ 顶部 ============ */
.hd {
  padding: var(--sp-5) var(--sp-1) var(--sp-3);
}
.hd__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.hd__left {
  display: flex;
  align-items: baseline;
  gap: var(--sp-3);
  min-width: 0;
}
.hd__title {
  font-size: clamp(1.75rem, 5vw, 2.125rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  color: var(--text-strong);
  line-height: 1.15;
}
.hd__right {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
}
.pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 36px;
  padding: 0 var(--sp-3);
  border-radius: var(--r-full);
  background: rgba(50, 50, 55, 0.72);
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  border: 0.5px solid rgba(255, 255, 255, 0.1);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
  font-size: var(--fs-sm);
  font-weight: 500;
  color: var(--text-muted);
  transition: all var(--dur-fast) var(--ease);
}
.pill svg { width: 16px; height: 16px; flex-shrink: 0; }
.pill:hover { color: var(--text); background: rgba(62, 62, 68, 0.85); }
.pill:active { transform: scale(0.96); }

/* ============ 用户资料 ============ */
.profile {
  background: rgba(50, 50, 55, 0.72);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-radius: var(--r-lg);
  border: 0.5px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2),
              inset 0 1px 0 rgba(255, 255, 255, 0.12);
  padding: var(--sp-6) var(--sp-4);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-4);
  margin-bottom: var(--sp-3);
}

.profile__avatar {
  width: 72px;
  height: 72px;
  border-radius: var(--r-full);
  overflow: hidden;
  position: relative;
  transition: transform var(--dur-fast) var(--ease);
}
.profile__avatar:hover {
  transform: scale(1.04);
}
.profile__avatar:active {
  transform: scale(0.98);
}
.profile__avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.profile__avatar-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--brand);
  color: #fff;
  font-size: var(--fs-xl);
  font-weight: 700;
  letter-spacing: -0.02em;
}
.profile__avatar-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.45);
  color: #fff;
  opacity: 0;
  transition: opacity var(--dur-fast) var(--ease);
}
.profile__avatar:hover .profile__avatar-overlay {
  opacity: 1;
}
.profile__avatar-overlay svg {
  width: 24px;
  height: 24px;
}

.profile__info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-2);
}
.profile__name {
  font-size: var(--fs-lg);
  font-weight: 700;
  color: var(--text-strong);
}

/* ============ 主题切换 ============ */
.theme {
  background: rgba(50, 50, 55, 0.72);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-radius: var(--r-lg);
  border: 0.5px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2),
              inset 0 1px 0 rgba(255, 255, 255, 0.12);
  padding: var(--sp-5) var(--sp-4);
  margin-top: var(--sp-3);
}
.theme__group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--sp-3);
}
.theme__btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--sp-2);
  padding: var(--sp-4) var(--sp-3);
  border-radius: var(--r-md);
  background: rgba(255, 255, 255, 0.06);
  border: 0.5px solid rgba(255, 255, 255, 0.10);
  color: var(--text-muted);
  font-size: var(--fs-sm);
  font-weight: 600;
  transition: all var(--dur-fast) var(--ease);
}
.theme__btn svg {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}
.theme__btn:hover {
  background: rgba(255, 255, 255, 0.12);
  color: var(--text);
}
.theme__btn:active {
  transform: scale(0.97);
}
.theme__btn--active {
  background: var(--brand);
  color: #fff;
  border-color: var(--brand);
  box-shadow: 0 2px 8px var(--brand-soft);
}
.theme__btn--active:hover {
  background: var(--brand-hover);
  color: #fff;
}

/* ============ 关于 ============ */
.about {
  background: rgba(50, 50, 55, 0.72);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-radius: var(--r-lg);
  border: 0.5px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2),
              inset 0 1px 0 rgba(255, 255, 255, 0.12);
  padding: var(--sp-5) var(--sp-4);
  margin-top: var(--sp-3);
  text-align: center;
}
.section-title {
  font-size: var(--fs-sm);
  font-weight: 600;
  color: var(--text-muted);
  margin-bottom: var(--sp-3);
  letter-spacing: 0.02em;
}
.about__info {
  display: flex;
  flex-direction: column;
  gap: var(--sp-1);
}
.about__name {
  font-size: var(--fs-base);
  font-weight: 700;
  color: var(--text-strong);
}
.about__desc {
  font-size: var(--fs-sm);
  color: var(--text-muted);
}

/* ============ 弹窗 ============ */
.dialog {
  position: fixed;
  inset: 0;
  z-index: var(--z-modal);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--sp-4);
}
.dialog__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(13, 11, 9, 0.55);
  backdrop-filter: blur(4px);
}
.dialog__card {
  position: relative;
  width: 100%;
  max-width: 320px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-xl);
  padding: var(--sp-6);
  box-shadow: var(--shadow-lg);
}
.dialog__title {
  font-size: var(--fs-lg);
  font-weight: 700;
  color: var(--text-strong);
  text-align: center;
  margin-bottom: var(--sp-4);
}
.dialog__input {
  width: 100%;
  padding: var(--sp-3) var(--sp-4);
  border: 1px solid var(--border);
  border-radius: var(--r-md);
  font-size: var(--fs-base);
  background: var(--surface-2);
  color: var(--text);
  margin-bottom: var(--sp-4);
  transition: border-color var(--dur) var(--ease),
              box-shadow var(--dur) var(--ease);
}
.dialog__input:focus {
  outline: none;
  border-color: var(--brand);
  box-shadow: 0 0 0 3px var(--brand-soft);
}
.dialog__input::placeholder { color: var(--text-subtle); }

.dialog__actions {
  display: flex;
  gap: var(--sp-3);
}
.dialog__btn {
  flex: 1;
  padding: var(--sp-3);
  border-radius: var(--r-md);
  font-size: var(--fs-sm);
  font-weight: 600;
  transition: background var(--dur-fast) var(--ease),
              transform var(--dur-fast) var(--ease);
}
.dialog__btn:active { transform: scale(0.97); }
.dialog__btn--cancel {
  background: var(--surface-3);
  color: var(--text-muted);
}
.dialog__btn--cancel:hover {
  background: var(--border);
}
.dialog__btn--confirm {
  background: var(--brand);
  color: #fff;
}
.dialog__btn--confirm:hover {
  background: var(--brand-hover);
}
</style>
