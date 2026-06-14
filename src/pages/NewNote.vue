<template>
  <div class="page page--full editor">
    <!-- ============ 顶部 ============ -->
    <header class="ed-hd">
      <button class="ed-hd__back" @click="goBack">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M15 5l-7 7 7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <span>返回</span>
      </button>
      <div class="ed-hd__spacer"></div>
      <button class="ed-hd__save" @click="saveNote">保存</button>
    </header>

    <!-- ============ 书写区 ============ -->
    <div class="editor-body">
      <input
        v-model="note.title"
        type="text"
        class="ed-title"
        placeholder="标题"
        autofocus
      />
      <textarea
        v-model="note.content"
        class="ed-content"
        placeholder="开始书写..."
        rows="12"
      ></textarea>
    </div>

    <!-- ============ 图片区 ============ -->
    <section class="img-section">
      <div class="img-section__head">
        <svg class="img-section__icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" stroke-width="1.6" />
          <circle cx="8.5" cy="8.5" r="2" stroke="currentColor" stroke-width="1.4" />
          <path d="M3 16l5-5 4 4 3-3 6 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <span class="img-section__label">图片</span>
        <span v-if="note.images.length" class="img-section__count">{{ note.images.length }}</span>
      </div>

      <div v-if="note.images.length" class="img-grid">
        <div
          v-for="(image, index) in note.images"
          :key="index"
          class="img-cell"
        >
          <img :src="image" alt="" class="img-cell__img" @click="previewImage(image)" />
          <button class="img-cell__rm" aria-label="删除图片" @click.stop="removeImage(index)">
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" fill="rgba(0,0,0,0.5)" />
              <path d="M9 9l6 6M15 9l-6 6" stroke="#fff" stroke-width="1.8" stroke-linecap="round" />
            </svg>
          </button>
        </div>
        <button class="img-cell img-cell--add" @click="addImage">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
          </svg>
        </button>
      </div>

      <button v-else class="img-drop" @click="addImage">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" stroke-width="1.2" stroke-dasharray="4 3" />
          <path d="M12 8v8M8 12h8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
        </svg>
        <span>添加图片</span>
      </button>
    </section>

    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      multiple
      hidden
      @change="handleImageUpload"
    />

    <!-- ============ 图片预览 ============ -->
    <Transition name="modal">
      <div v-if="showPreview" class="viewer" @click="closePreview">
        <div class="viewer__bg"></div>
        <div class="modal-card viewer__box" @click.stop>
          <button class="viewer__x" aria-label="关闭" @click="closePreview">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
            </svg>
          </button>
          <img
            :src="previewImageUrl"
            alt=""
            class="viewer__img"
            @contextmenu.prevent="showSaveMenu"
          />
          <Transition name="page">
            <button v-if="showSaveBtn" class="viewer__save" @click="saveImage">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 15V3m0 12l-4-4m4 4l4-4M4 19h16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              保存图片
            </button>
          </Transition>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { db } from '../db'

const router = useRouter()
const fileInput = ref(null)
const previewImageUrl = ref('')
const showPreview = ref(false)
const showSaveBtn = ref(false)

const showSaveMenu = () => {
  showSaveBtn.value = true
}

const saveImage = () => {
  const link = document.createElement('a')
  link.href = previewImageUrl.value
  link.download = `image_${Date.now()}.jpg`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  showSaveBtn.value = false
}

const note = ref({ title: '', content: '', images: [] })

const goBack = () => router.back()

const previewImage = (url) => { previewImageUrl.value = url; showPreview.value = true }
const closePreview = () => { showPreview.value = false; previewImageUrl.value = ''; showSaveBtn.value = false }
const addImage = () => fileInput.value.click()

const handleImageUpload = (event) => {
  const files = event.target.files
  for (const file of files) {
    const reader = new FileReader()
    reader.onload = (e) => {
      compressImage(e.target.result).then((c) => note.value.images.push(c))
    }
    reader.readAsDataURL(file)
  }
  event.target.value = ''
}

const compressImage = (dataUrl) => {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const maxW = 800, maxH = 600
      let { width, height } = img
      if (width > maxW) { height = (height * maxW) / width; width = maxW }
      if (height > maxH) { width = (width * maxH) / height; height = maxH }
      const c = document.createElement('canvas')
      c.width = width; c.height = height
      c.getContext('2d').drawImage(img, 0, 0, width, height)
      resolve(c.toDataURL('image/jpeg', 0.8))
    }
    img.src = dataUrl
  })
}

const removeImage = (index) => note.value.images.splice(index, 1)

const saveNote = async () => {
  if (!note.value.title && !note.value.content) { alert('请输入标题或内容'); return }
  try {
    const now = new Date().toISOString()
    await db.notes.add(JSON.parse(JSON.stringify({
      title: note.value.title,
      content: note.value.content,
      images: note.value.images || [],
      createdAt: now,
      updatedAt: now
    })))
    router.back()
  } catch (e) {
    console.error('保存失败:', e)
    alert('保存失败，请重试')
  }
}
</script>

<style scoped>
/* ========================================================
   顶部栏
   ======================================================== */
.ed-hd {
  display: flex;
  align-items: center;
  padding: var(--sp-2) var(--sp-1);
  margin-bottom: var(--sp-2);
}
.ed-hd__back {
  height: 36px;
  padding: 0 var(--sp-3);
  border-radius: var(--r-full);
  background: rgba(50, 50, 55, 0.72);
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  border: 0.5px solid rgba(255, 255, 255, 0.18);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12);
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: var(--fs-sm);
  font-weight: 500;
  color: var(--text-muted);
  transition: color var(--dur-fast) var(--ease),
              background var(--dur-fast) var(--ease),
              transform var(--dur-fast) var(--ease);
}
.ed-hd__back svg { width: 16px; height: 16px; flex-shrink: 0; }
.ed-hd__back:hover { color: var(--text); background: rgba(62, 62, 68, 0.85); }
.ed-hd__back:active { transform: scale(0.96); }

.ed-hd__spacer { flex: 1; }

.ed-hd__save {
  height: 36px;
  padding: 0 var(--sp-4);
  border-radius: var(--r-full);
  background: var(--brand);
  color: #fff;
  font-size: var(--fs-sm);
  font-weight: 600;
  letter-spacing: 0.01em;
  transition: background var(--dur-fast) var(--ease),
              transform var(--dur-fast) var(--ease);
}
.ed-hd__save:hover { background: var(--brand-hover); }
.ed-hd__save:active { transform: scale(0.95); }

/* ========================================================
   书写区
   ======================================================== */
.editor-body {
  margin-bottom: var(--sp-6);
  background: rgba(50, 50, 55, 0.72);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-radius: var(--r-lg);
  border: 0.5px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2),
              inset 0 1px 0 rgba(255, 255, 255, 0.12);
  overflow: hidden;
}

.ed-title {
  display: block;
  width: 100%;
  padding: var(--sp-4) var(--sp-4) var(--sp-3);
  border: none;
  background: transparent;
  font-size: clamp(1.5rem, 4.5vw, 1.875rem);
  font-weight: 800;
  letter-spacing: -0.025em;
  line-height: 1.2;
  color: var(--text-strong);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  transition: border-color var(--dur) var(--ease);
}
.ed-title:focus {
  outline: none;
  border-bottom-color: var(--brand);
}
.ed-title::placeholder {
  color: var(--border-strong);
  font-weight: 700;
}

.ed-content {
  display: block;
  width: 100%;
  padding: var(--sp-4);
  border: none;
  background: transparent;
  font-size: var(--fs-base);
  line-height: 1.75;
  color: var(--text);
  resize: vertical;
  min-height: 50vh;
  word-break: break-word;
}
.ed-content:focus { outline: none; }
.ed-content::placeholder { color: var(--text-subtle); }

/* ========================================================
   图片区
   ======================================================== */
.img-section {
  background: rgba(50, 50, 55, 0.72);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-radius: var(--r-lg);
  border: 0.5px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2),
              inset 0 1px 0 rgba(255, 255, 255, 0.12);
  padding: var(--sp-4);
  margin-bottom: var(--sp-8);
}
.img-section__head {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  margin-bottom: var(--sp-3);
}
.img-section__icon { width: 18px; height: 18px; color: var(--text-muted); flex-shrink: 0; }
.img-section__label {
  font-size: var(--fs-sm);
  font-weight: 600;
  color: var(--text);
}
.img-section__count {
  font-size: var(--fs-xs);
  color: var(--text-subtle);
  background: var(--surface-3);
  padding: 1px 8px;
  border-radius: var(--r-full);
  font-variant-numeric: tabular-nums;
}

.img-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: var(--sp-2);
}

.img-cell {
  position: relative;
  aspect-ratio: 1;
  border-radius: var(--r-md);
  overflow: hidden;
  background: var(--surface-2);
}
.img-cell__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  cursor: zoom-in;
  transition: opacity var(--dur-fast) var(--ease);
}
.img-cell__img:hover { opacity: 0.85; }

.img-cell__rm {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--r-full);
  transition: transform var(--dur-fast) var(--ease);
}
.img-cell__rm svg { width: 24px; height: 24px; }
.img-cell__rm:active { transform: scale(0.85); }

.img-cell--add {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px dashed var(--border-strong);
  background: var(--surface-2);
  color: var(--text-subtle);
  cursor: pointer;
  transition: all var(--dur-fast) var(--ease);
}
.img-cell--add svg { width: 24px; height: 24px; }
.img-cell--add:hover {
  border-color: var(--brand);
  color: var(--brand);
  background: var(--brand-softer);
}

.img-drop {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--sp-2);
  padding: var(--sp-8) var(--sp-4);
  border: 1.5px dashed var(--border-strong);
  border-radius: var(--r-md);
  background: var(--surface-2);
  color: var(--text-muted);
  font-size: var(--fs-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--dur-fast) var(--ease);
}
.img-drop svg { width: 32px; height: 32px; opacity: 0.6; }
.img-drop:hover {
  border-color: var(--brand);
  color: var(--brand);
  background: var(--brand-softer);
}
.img-drop:hover svg { opacity: 1; }

/* ========================================================
   图片预览
   ======================================================== */
.viewer {
  position: fixed;
  inset: 0;
  z-index: var(--z-modal);
  display: flex;
  align-items: center;
  justify-content: center;
}
.viewer__bg {
  position: absolute;
  inset: 0;
  background: rgba(12, 12, 24, 0.75);
  backdrop-filter: blur(40px) saturate(150%);
  -webkit-backdrop-filter: blur(40px) saturate(150%);
}
.viewer__box {
  position: relative;
  max-width: 92%;
  max-height: 88%;
}
.viewer__x {
  position: absolute;
  top: -48px;
  right: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(50, 50, 55, 0.72);
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  color: #fff;
  border: 0.5px solid rgba(255, 255, 255, 0.18);
  border-radius: var(--r-full);
  transition: background var(--dur-fast) var(--ease);
}
.viewer__x:hover { background: rgba(62, 62, 68, 0.85); }
.viewer__x svg { width: 18px; height: 18px; }
.viewer__img {
  max-width: 100%;
  max-height: 80vh;
  border-radius: var(--r-md);
  box-shadow: var(--shadow-lg);
}
.viewer__save {
  position: absolute;
  bottom: -52px;
  left: 50%;
  transform: translateX(-50%);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 40px;
  padding: 0 var(--sp-4);
  border-radius: var(--r-full);
  background: rgba(50, 50, 55, 0.85);
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  border: 0.5px solid rgba(255, 255, 255, 0.18);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12),
              0 4px 16px rgba(0, 0, 0, 0.3);
  color: #fff;
  font-size: var(--fs-sm);
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  transition: background var(--dur-fast) var(--ease),
              transform var(--dur-fast) var(--ease);
}
.viewer__save svg { width: 18px; height: 18px; }
.viewer__save:hover { background: rgba(62, 62, 68, 0.95); }
.viewer__save:active { transform: translateX(-50%) scale(0.96); }
</style>
