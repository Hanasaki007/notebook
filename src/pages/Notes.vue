<template>
  <div class="page notes-page" :style="isSelectMode && selectedNotes.length > 0 ? { paddingBottom: 'calc(var(--tabbar-h) + 88px + var(--sp-3))' } : {}">
    <!-- ============ 头部 ============ -->
    <header class="hd">
      <div class="hd__row">
        <div class="hd__left">
          <h1 class="hd__title">记事</h1>
        </div>
        <div class="hd__right">
          <button
            class="pill"
            :class="{ 'pill--active': isSelectMode }"
            @click="toggleSelectMode"
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="5" y="6" width="4" height="4" rx="0.8" stroke="currentColor" stroke-width="1.6" />
              <rect x="5" y="14" width="4" height="4" rx="0.8" stroke="currentColor" stroke-width="1.6" />
              <path d="M11 8h6M11 16h6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
            </svg>
            <span>{{ isSelectMode ? '取消' : '选择' }}</span>
          </button>
          <button class="fab" aria-label="新建记事" @click="goToNewNote">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" />
            </svg>
          </button>
        </div>
      </div>
    </header>

    <!-- ============ 列表 ============ -->
    <TransitionGroup
      v-if="notes.length"
      name="list"
      tag="div"
      class="note-list"
    >
      <article
        v-for="note in sortedNotes"
        :key="note.id"
        class="card"
        :style="isSelectMode && selectedNotes.includes(note.id) ? { borderColor: 'var(--brand)', background: 'var(--brand-softer)' } : {}"
        @click="onCardClick(note)"
      >
        <div class="card__inner">
          <div class="card__head">
            <h3 class="card__title">{{ note.title || '无标题' }}</h3>
          </div>

          <p v-if="note.content" class="card__body">{{ getPreview(note.content) }}</p>

          <div class="card__foot">
            <time class="card__time">{{ formatTime(note.updatedAt) }}</time>
            <span v-if="note.images && note.images.length" class="card__img-tag">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" stroke-width="1.5" />
                <circle cx="8.5" cy="8.5" r="2" stroke="currentColor" stroke-width="1.2" />
                <path d="M3 16l5-5 4 4 3-3 6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              {{ note.images.length }}
            </span>
          </div>
        </div>

        <!-- 选择指示器 -->
        <button
          v-if="isSelectMode"
          class="pick"
          :style="{
            background: selectedNotes.includes(note.id) ? 'var(--brand)' : 'var(--surface)',
            borderColor: selectedNotes.includes(note.id) ? 'var(--brand)' : 'var(--border-strong)'
          }"
          @click.stop="toggleSelect(note.id)"
        >
          <svg viewBox="0 0 24 24" fill="none" :style="{ opacity: selectedNotes.includes(note.id) ? 1 : 0 }">
            <path d="M6 12.5l4 4 8-8.5" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
      </article>
    </TransitionGroup>

    <!-- ============ 空状态 ============ -->
    <div v-else class="empty">
      <div class="empty__visual" aria-hidden="true">
        <!-- 精致笔记本插画 -->
        <svg viewBox="0 0 120 120" fill="none">
          <!-- 本子 -->
          <rect x="30" y="18" width="60" height="84" rx="6" fill="#fff" stroke="var(--border-strong)" stroke-width="1.5" />
          <rect x="30" y="18" width="60" height="84" rx="6" fill="var(--brand-softer)" />
          <!-- 装订线 -->
          <line x1="44" y1="18" x2="44" y2="102" stroke="var(--border)" stroke-width="1" stroke-dasharray="3 3" />
          <!-- 文字行 -->
          <rect x="50" y="34" width="30" height="3" rx="1.5" fill="var(--brand)" opacity="0.35" />
          <rect x="50" y="44" width="24" height="2.5" rx="1.25" fill="var(--border-strong)" />
          <rect x="50" y="52" width="28" height="2.5" rx="1.25" fill="var(--border-strong)" />
          <rect x="50" y="60" width="18" height="2.5" rx="1.25" fill="var(--border-strong)" />
          <!-- 铅笔 -->
          <g transform="translate(76, 14) rotate(25)">
            <rect x="0" y="0" width="5" height="40" rx="1" fill="var(--brand)" />
            <rect x="0" y="36" width="5" height="8" rx="0 0 1.5 1.5" fill="#f5d5a0" />
            <polygon points="1.5,44 3.5,44 2.5,48" fill="var(--text-muted)" />
          </g>
          <!-- 小装饰点 -->
          <circle cx="22" cy="30" r="3" fill="var(--brand)" opacity="0.15" />
          <circle cx="100" cy="90" r="4" fill="var(--brand)" opacity="0.12" />
        </svg>
      </div>
      <p class="empty__title">还没有记事</p>
      <p class="empty__sub">点击右上角的 + 开始记录吧</p>
    </div>

    <!-- ============ 批量操作 ============ -->
    <Transition name="sheet">
      <div v-if="isSelectMode && selectedNotes.length > 0" class="action-bar">
        <span class="action-bar__count">已选 <strong>{{ selectedNotes.length }}</strong> 项</span>
        <div class="action-bar__btns">
          <button class="abtn abtn--ghost" @click="cancelSelect">取消</button>
          <button class="abtn abtn--danger" @click="batchDelete">删除</button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { db } from '../db'

const router = useRouter()
const notes = ref([])
const isSelectMode = ref(false)
const selectedNotes = ref([])

const sortedNotes = computed(() =>
  [...notes.value].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
)

const loadNotes = async () => { notes.value = await db.notes.toArray() }

const goToNewNote = () => router.push('/notes/new')

const onCardClick = (note) => {
  if (isSelectMode.value) toggleSelect(note.id)
  else router.push(`/notes/edit/${note.id}`)
}

const toggleSelectMode = () => {
  isSelectMode.value = !isSelectMode.value
  if (!isSelectMode.value) selectedNotes.value = []
}

const toggleSelect = (id) => {
  const i = selectedNotes.value.indexOf(id)
  if (i > -1) selectedNotes.value.splice(i, 1)
  else selectedNotes.value.push(id)
}

const batchDelete = async () => {
  if (!confirm(`确定删除选中的 ${selectedNotes.value.length} 个记事吗？`)) return
  await db.notes.bulkDelete(selectedNotes.value)
  selectedNotes.value = []
  isSelectMode.value = false
  await loadNotes()
}

const cancelSelect = () => {
  selectedNotes.value = []
  isSelectMode.value = false
}

const getPreview = (content) => {
  if (!content) return ''
  return content.length > 120 ? content.slice(0, 120) + '…' : content
}

const formatTime = (time) => {
  if (!time) return ''
  const d = new Date(time)
  const now = new Date()
  const diffMs = now - d
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return '刚刚'
  if (diffMin < 60) return `${diffMin} 分钟前`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr} 小时前`
  const sameYear = d.getFullYear() === now.getFullYear()
  if (sameYear) return d.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })
  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
}

onMounted(() => { loadNotes() })
</script>

<style scoped>
/* ========================================================
   头部
   ======================================================== */
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

/* 选择按钮（pill） */
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
.pill--active {
  background: var(--brand-soft);
  border-color: var(--brand);
  color: var(--brand);
}

/* 新建按钮（圆形 FAB） */
.fab {
  width: 40px;
  height: 40px;
  border-radius: var(--r-full);
  background: var(--brand);
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background var(--dur-fast) var(--ease),
              transform var(--dur-fast) var(--ease);
}
.fab svg { width: 20px; height: 20px; }
.fab:hover { background: var(--brand-hover); }
.fab:active { transform: scale(0.92); }

/* ========================================================
   卡片列表
   ======================================================== */
.note-list {
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
  position: relative;
}

.card {
  display: flex;
  background: rgba(50, 50, 55, 0.72);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-radius: var(--r-lg);
  border: 0.5px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2),
              inset 0 1px 0 rgba(255, 255, 255, 0.12);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  height: 110px;
  transition: background var(--dur-fast) var(--ease),
              transform var(--dur-fast) var(--ease);
}
.card:active {
  transform: scale(0.98);
  background: rgba(62, 62, 68, 0.85);
}

.card__inner {
  flex: 1;
  min-width: 0;
  padding: var(--sp-4) var(--sp-4) var(--sp-3);
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
  overflow: hidden;
}

.card__head {
  min-width: 0;
}
.card__title {
  font-size: var(--fs-base);
  font-weight: 700;
  color: var(--text-strong);
  line-height: 1.3;
  letter-spacing: -0.01em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card__body {
  font-size: var(--fs-sm);
  color: var(--text-muted);
  line-height: 1.55;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card__foot {
  margin-top: auto;
  padding-top: 4px;
  display: flex;
  align-items: center;
  gap: var(--sp-2);
}
.card__time {
  font-size: var(--fs-xs);
  color: var(--text-subtle);
  font-variant-numeric: tabular-nums;
}
.card__img-tag {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: var(--fs-xs);
  color: var(--text-subtle);
  font-variant-numeric: tabular-nums;
}
.card__img-tag svg { width: 13px; height: 13px; }

/* 选择圆形 */
.pick {
  position: absolute;
  top: var(--sp-3);
  right: var(--sp-3);
  width: 24px;
  height: 24px;
  border-radius: var(--r-full);
  border: 2px solid var(--border-strong);
  background: var(--surface);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background var(--dur-fast) var(--ease),
              border-color var(--dur-fast) var(--ease);
  z-index: 2;
}
.pick svg {
  width: 14px;
  height: 14px;
  transition: opacity var(--dur-fast) var(--ease);
}

/* ========================================================
   空状态
   ======================================================== */
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: var(--sp-12) var(--sp-4) var(--sp-8);
}
.empty__visual {
  width: 120px;
  height: 120px;
  margin-bottom: var(--sp-6);
}
.empty__visual svg { width: 100%; height: 100%; }
.empty__title {
  font-size: var(--fs-lg);
  font-weight: 700;
  color: var(--text);
  margin-bottom: var(--sp-1);
}
.empty__sub {
  font-size: var(--fs-sm);
  color: var(--text-muted);
  line-height: 1.5;
}

/* ========================================================
   批量操作栏
   ======================================================== */
.action-bar {
  position: fixed;
  left: var(--sp-4);
  right: var(--sp-4);
  bottom: calc(var(--tabbar-h) + var(--sp-6));
  z-index: var(--z-sheet);
  background: rgba(50, 50, 55, 0.92);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  color: #fff;
  border-radius: var(--r-lg);
  border: 0.5px solid rgba(255, 255, 255, 0.1);
  padding: var(--sp-3) var(--sp-4);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-3);
  box-shadow: var(--shadow-lg);
  max-width: calc(var(--content-max) - var(--sp-4) * 2);
  margin-inline: auto;
}
.action-bar__count {
  font-size: var(--fs-sm);
  color: rgba(255, 255, 255, 0.65);
}
.action-bar__count strong {
  color: #fff;
  font-weight: 600;
}
.action-bar__btns {
  display: flex;
  gap: var(--sp-2);
}
.abtn {
  font-size: var(--fs-sm);
  font-weight: 500;
  padding: var(--sp-2) var(--sp-4);
  border-radius: var(--r-sm);
  transition: background var(--dur-fast) var(--ease),
              transform var(--dur-fast) var(--ease);
  white-space: nowrap;
}
.abtn:active { transform: scale(0.96); }
.abtn--ghost {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.85);
}
.abtn--ghost:hover { background: rgba(255, 255, 255, 0.18); }
.abtn--danger { background: var(--danger); color: #fff; }
.abtn--danger:hover { background: #b91c1c; }
</style>
