<template>
  <div class="settings-page">
    <div class="header">
      <h1 class="title">设置</h1>
    </div>

    <div class="settings-content">
      <div class="profile-section">
        <div class="avatar-section" @click="changeAvatar">
          <div class="avatar">
            <img v-if="settings.avatar" :src="settings.avatar" alt="用户头像" />
            <div v-else class="avatar-placeholder">{{ getInitials }}</div>
          </div>
          <div class="username-display">{{ settings.username }}</div>
          <div class="edit-username" @click.stop="openEditModal">编辑</div>
        </div>
      </div>



      <div class="about-section">
        <h3 class="section-title">关于</h3>
        <div class="about-content">
          <p>柚子便签 v2.1</p>
          <p class="description">一款简洁大方，持续改进的便签应用</p>
        </div>
      </div>
    </div>

    <!-- 编辑用户名弹窗 -->
    <div class="modal-overlay" v-if="showEditModal" @click="closeEditModal">
      <div class="modal-content" @click.stop>
        <h3 class="modal-title">修改用户名</h3>
        <input
          type="text"
          v-model="tempUsername"
          class="modal-input"
          placeholder="输入用户名"
          @keyup.enter="saveUsername"
        />
        <div class="modal-actions">
          <button class="modal-btn cancel" @click="closeEditModal">取消</button>
          <button class="modal-btn confirm" @click="saveUsername">确定</button>
        </div>
      </div>
    </div>

    <input
      type="file"
      ref="fileInput"
      accept="image/*"
      style="display: none"
      @change="handleAvatarUpload"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { db } from '../db'

const fileInput = ref(null)
const showEditModal = ref(false)
const tempUsername = ref('')
const settings = ref({
  id: 1,
  username: '用户',
  avatar: ''
})

const getInitials = computed(() => {
  return settings.value.username ? settings.value.username.charAt(0).toUpperCase() : 'U'
})

const loadSettings = async () => {
  const savedSettings = await db.settings.get(1)
  if (savedSettings) {
    settings.value = savedSettings
  }
}

const saveSettings = async () => {
  // 使用JSON序列化确保数据是纯对象，可以被IndexedDB克隆
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
  if (tempUsername.value.trim()) {
    settings.value.username = tempUsername.value.trim()
    await saveSettings()
    showEditModal.value = false
  }
}

const changeAvatar = () => {
  fileInput.value.click()
}

const handleAvatarUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      settings.value.avatar = e.target.result
      saveSettings()
    }
    reader.readAsDataURL(file)
  }
}

onMounted(() => {
  loadSettings()
})

watch(() => settings.value.username, () => {
  saveSettings()
})
</script>

<style scoped>
.settings-page {
  padding-bottom: 70px;
}

.header {
  padding: 16px;
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-color);
}

.title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  text-align: center;
}

.settings-content {
  padding: 20px;
}

.profile-section {
  background: var(--card-bg);
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 10px;
  cursor: pointer;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 8px;
  border: 3px solid var(--border-color);
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-color);
  color: white;
  font-size: 28px;
  font-weight: 600;
}







.username-display {
  font-size: 20px;
  font-weight: 600;
  margin: 8px 0 4px 0;
  color: var(--text-primary);
}

.edit-username {
  font-size: 12px;
  color: var(--text-secondary);
  cursor: pointer;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: 2px 8px;
  margin-top: 4px;
}

.edit-username:hover {
  color: var(--primary-color);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 24px;
  width: 80%;
  max-width: 320px;
  box-shadow: var(--shadow-lg);
}

.modal-title {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  text-align: center;
}

.modal-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 16px;
  background: var(--input-bg);
  color: var(--text-primary);
  margin-bottom: 16px;
}

.modal-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.modal-actions {
  display: flex;
  gap: 12px;
}

.modal-btn {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.modal-btn.cancel {
  background: var(--hover-bg);
  color: var(--text-primary);
}

.modal-btn.confirm {
  background: var(--primary-color);
  color: white;
}

.about-section {
  background: var(--card-bg);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  text-align: center;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: var(--text-primary);
}

.about-content p {
  margin: 8px 0;
  color: var(--text-secondary);
  font-size: 14px;
}

.about-content .description {
  font-style: italic;
}
</style>
