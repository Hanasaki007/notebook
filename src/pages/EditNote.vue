<template>
  <div class="edit-note-page">
    <div class="header">
      <div class="header-left">
        <button class="back-btn" @click="goBack">返回</button>
      </div>
      <h1 class="title">编辑记事</h1>
      <div class="header-right">
        <button class="save-btn" @click="saveNote">保存</button>
      </div>
    </div>
    
    <div class="note-form" v-if="note">
      <div class="form-group">
        <input 
          type="text" 
          v-model="note.title" 
          class="title-input"
          placeholder="输入标题..."
        />
      </div>
      
      <div class="form-group">
        <textarea 
          v-model="note.content" 
          class="content-input"
          placeholder="输入内容..."
          rows="10"
        ></textarea>
      </div>
      
      <div class="image-section">
        <div class="section-header">
          <h3>图片</h3>
          <button class="add-image-btn" @click="addImage">
            <span class="icon">+</span>
          </button>
        </div>
        
        <div class="image-preview" v-if="note.images && note.images.length > 0">
          <div 
            v-for="(image, index) in note.images" 
            :key="index" 
            class="image-item"
            @click="previewImage(image)"
          >
            <img :src="image" alt="预览图片" />
            <button class="remove-image" @click.stop="removeImage(index)">×</button>
          </div>
        </div>
        
        <div class="image-hint" v-else>
          点击上方按钮添加图片
        </div>
      </div>
    </div>
    
    <div class="loading" v-else>
      <p>加载中...</p>
    </div>
    
    <input 
      type="file" 
      ref="fileInput" 
      accept="image/*" 
      multiple
      style="display: none" 
      @change="handleImageUpload"
    />
    
    <!-- 图片预览模态框 -->
    <div class="image-preview-modal" v-if="showPreview" @click="closePreview">
      <div class="preview-overlay"></div>
      <div class="preview-container">
        <button class="close-preview" @click="closePreview">×</button>
        <img :src="previewImageUrl" alt="预览图片" class="preview-image" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { db } from '../db'

const router = useRouter()
const route = useRoute()
const fileInput = ref(null)
const previewImageUrl = ref('')
const showPreview = ref(false)

const previewImage = (url) => {
  previewImageUrl.value = url
  showPreview.value = true
}

const closePreview = () => {
  showPreview.value = false
  previewImageUrl.value = ''
}

const note = ref(null)

const goBack = () => {
  router.back()
}

const loadNote = async () => {
  const noteId = parseInt(route.params.id)
  if (noteId) {
    note.value = await db.notes.get(noteId)
    if (!note.value) {
      alert('记事不存在')
      router.back()
    }
  }
}

const addImage = () => {
  fileInput.value.click()
}

const handleImageUpload = (event) => {
  const files = event.target.files
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const reader = new FileReader()
    reader.onload = (e) => {
      if (!note.value.images) {
        note.value.images = []
      }
      // 压缩图片并转换为base64
      compressImage(e.target.result).then(compressedData => {
        note.value.images.push(compressedData)
      })
    }
    reader.readAsDataURL(file)
  }
}

const compressImage = (dataUrl) => {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      // 设置最大尺寸
      const maxWidth = 800
      const maxHeight = 600
      let width = img.width
      let height = img.height
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height
        height = maxHeight
      }
      
      canvas.width = width
      canvas.height = height
      
      // 绘制图片
      ctx.drawImage(img, 0, 0, width, height)
      
      // 转换为base64，质量压缩为0.8
      const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8)
      resolve(compressedDataUrl)
    }
    img.src = dataUrl
  })
}

const removeImage = (index) => {
  note.value.images.splice(index, 1)
}

const saveNote = async () => {
  if (!note.value.title && !note.value.content) {
    alert('请输入标题或内容')
    return
  }
  
  try {
    const now = new Date().toISOString()
    
    // 使用JSON序列化确保数据是纯对象，可以被IndexedDB克隆
    const updateData = JSON.parse(JSON.stringify({
      title: note.value.title,
      content: note.value.content,
      images: note.value.images || [],
      updatedAt: now
    }))
    
    await db.notes.update(note.value.id, updateData)
    
    router.back()
  } catch (error) {
    console.error('保存失败:', error)
    alert('保存失败，请重试')
  }
}

onMounted(() => {
  loadNote()
})
</script>

<style scoped>
.edit-note-page {
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
  width: 40px;
  height: 40px;
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

.icon {
  font-size: 20px;
}

.save-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  background: var(--primary-color);
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.save-btn:hover {
  background: var(--primary-hover);
}

.back-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  background: var(--primary-color);
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.back-btn:hover {
  background: var(--primary-hover);
}

.note-form {
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.title-input {
  width: 100%;
  padding: 16px;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  font-size: 18px;
  font-weight: 600;
  background: var(--input-bg);
  color: var(--text-primary);
  transition: border-color 0.2s;
}

.title-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.content-input {
  width: 100%;
  padding: 16px;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  font-size: 16px;
  line-height: 1.5;
  resize: vertical;
  min-height: 200px;
  background: var(--input-bg);
  color: var(--text-primary);
  font-family: inherit;
  transition: border-color 0.2s;
}

.content-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.image-section {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.add-image-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 12px;
  border: 1px dashed var(--border-color);
  border-radius: 8px;
  background: none;
  cursor: pointer;
  font-size: 14px;
  color: var(--text-secondary);
  transition: all 0.2s;
}

.add-image-btn:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.image-preview {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
}

.image-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
}

.image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-image {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  cursor: pointer;
  font-size: 16px;
  line-height: 24px;
  padding: 0;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-hint {
  text-align: center;
  padding: 20px;
  color: var(--text-tertiary);
  font-size: 14px;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px;
  color: var(--text-secondary);
}

.image-preview-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
}

.preview-container {
  position: relative;
  max-width: 90%;
  max-height: 90%;
  z-index: 1001;
}

.close-preview {
  position: absolute;
  top: -40px;
  right: 0;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  font-size: 20px;
  cursor: pointer;
  z-index: 1002;
  line-height: 32px;
  padding: 0;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-preview:hover {
  background: white;
}

.preview-image {
  max-width: 100%;
  max-height: 90vh;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
}
</style>