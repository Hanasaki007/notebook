<template>
  <div class="notes-page">
    <div class="header">
      <div class="header-left">
        <button class="icon-btn" @click="goToNewNote">
          <span class="icon">＋</span>
        </button>
      </div>
      <h1 class="title">记事</h1>
      <div class="header-right">
        <button
          class="icon-btn"
          :class="{ active: isSelectMode }"
          @click="toggleSelectMode"
        >
          <span class="icon">－</span>
        </button>
      </div>
    </div>
    
    <div class="notes-list" v-if="notes.length > 0">
      <div
        v-for="note in sortedNotes"
        :key="note.id"
        class="note-card"
        :class="{ selected: selectedNotes.includes(note.id), 'select-mode': isSelectMode }"
      >
        <div class="note-content" @click="editNote(note)">
          <h3 class="note-title">{{ note.title || '无标题' }}</h3>
          <p class="note-preview">{{ getPreview(note.content) }}</p>
          <div class="note-images" v-if="note.images && note.images.length > 0">
            <div class="image-count">{{ note.images.length }}张图片</div>
          </div>
          <div class="note-time">{{ formatTime(note.updatedAt) }}</div>
        </div>
        
        <div class="select-checkbox" v-if="isSelectMode">
          <input 
            type="checkbox" 
            :checked="selectedNotes.includes(note.id)"
            @change="toggleSelect(note.id)"
          />
        </div>
      </div>
    </div>
    
    <div class="empty-state" v-else>
      <div class="empty-icon">
        <img
          :src="emptyIcon"
          alt=""
          aria-hidden="true"
          width="64"
          height="64"
          @error="(e) => (e.target.style.display = 'none')"
        />
      </div>
      <p>还没有记事</p>
      <p>点击左上角的 + 开始记录</p>
    </div>
    
    <div class="batch-actions" v-if="isSelectMode && selectedNotes.length > 0">
      <button class="batch-btn" @click="batchDelete">
        删除选中 ({{ selectedNotes.length }})
      </button>
      <button class="batch-btn cancel" @click="cancelSelect">取消</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { db } from '../db'
import emptyIcon from '@/assets/icon-notes.png'

const router = useRouter()
const notes = ref([])
const isSelectMode = ref(false)
const selectedNotes = ref([])

const sortedNotes = computed(() => {
  return [...notes.value].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
})

const loadNotes = async () => {
  notes.value = await db.notes.toArray()
}

const goToNewNote = () => {
  router.push('/notes/new')
}

const editNote = (note) => {
  router.push(`/notes/edit/${note.id}`)
}

const deleteNote = async (id) => {
  if (confirm('确定要删除这个记事吗？')) {
    await db.notes.delete(id)
    await loadNotes()
  }
}

const toggleSelectMode = () => {
  isSelectMode.value = !isSelectMode.value
  if (!isSelectMode.value) {
    selectedNotes.value = []
  }
}

const toggleSelect = (id) => {
  const index = selectedNotes.value.indexOf(id)
  if (index > -1) {
    selectedNotes.value.splice(index, 1)
  } else {
    selectedNotes.value.push(id)
  }
}

const batchDelete = async () => {
  if (confirm(`确定要删除选中的 ${selectedNotes.value.length} 个记事吗？`)) {
    await db.notes.bulkDelete(selectedNotes.value)
    selectedNotes.value = []
    isSelectMode.value = false
    await loadNotes()
  }
}

const cancelSelect = () => {
  selectedNotes.value = []
  isSelectMode.value = false
}

const getPreview = (content) => {
  if (!content) return ''
  return content.substring(0, 100) + (content.length > 100 ? '...' : '')
}

const formatTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  return date.toLocaleString('zh-CN')
}

onMounted(() => {
  loadNotes()
})
</script>

<style scoped>
.notes-page {
  padding-bottom: 70px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-color);
}

.title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.icon-btn {
  width: 44px;
  height: 44px;
  border: none;
  background: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s;
}

.icon-btn:hover {
  background: var(--hover-bg);
}

.icon-btn.active {
  background: var(--primary-color);
  color: white;
}

.icon {
  font-size: 24px;
}

.notes-list {
  padding: 16px;
}

.note-card {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  position: relative;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.note-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.note-card.selected {
  border: 2px solid var(--primary-color);
}

.note-card.select-mode {
  padding-right: 44px;
}

.note-title {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.note-preview {
  margin: 0 0 8px 0;
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.note-images {
  margin-bottom: 8px;
}

.image-count {
  font-size: 12px;
  color: var(--text-secondary);
}

.note-time {
  font-size: 12px;
  color: var(--text-tertiary);
}

.note-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.action-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  background: var(--hover-bg);
  color: var(--text-primary);
}

.action-btn.delete {
  background: #fee2e2;
  color: #dc2626;
}

.select-checkbox {
  position: absolute;
  top: 16px;
  right: 16px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  color: var(--text-secondary);
}

.empty-icon {
  margin-bottom: 16px;
}

.empty-icon img {
  width: 64px;
  height: 64px;
  object-fit: contain;
}

.batch-actions {
  position: fixed;
  bottom: 70px;
  left: 0;
  right: 0;
  padding: 16px;
  background: var(--bg-primary);
  border-top: 1px solid var(--border-color);
  display: flex;
  gap: 12px;
}

.batch-btn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  background: var(--primary-color);
  color: white;
}

.batch-btn.cancel {
  background: var(--hover-bg);
  color: var(--text-primary);
}
</style>