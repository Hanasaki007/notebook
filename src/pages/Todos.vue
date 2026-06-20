<template>
  <div class="page todos-page" :style="isSelectMode && selectedTodos.length > 0 ? { paddingBottom: 'calc(var(--tabbar-h) + 88px + var(--sp-3))' } : {}">
    <!-- ============ 头部 ============ -->
    <header class="hd">
      <div class="hd__row">
        <div class="hd__left">
          <h1 class="hd__title">待办</h1>
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
          <button class="fab" aria-label="新建待办" @click="goToNewTodo">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" />
            </svg>
          </button>
        </div>
      </div>
    </header>

    <!-- ============ 列表 ============ -->
    <template v-if="todos.length">
      <TransitionGroup name="list" tag="div" class="todo-list">
        <article
          v-for="todo in uncompleted"
          :key="todo.id"
          class="card"
          :style="isSelectMode && selectedTodos.includes(todo.id) ? { borderColor: 'var(--brand)', background: 'var(--brand-softer)' } : {}"
          @click="onCardClick(todo)"
        >
          <div class="card__inner">
            <button
              class="ck"
              :class="{ 'ck--on': todo.completed }"
              aria-label="切换完成"
              @click.stop="toggleComplete(todo)"
            >
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M6 12.5l4 4 8-8.5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
            <div class="card__body">
              <p class="card__text">{{ todo.text }}</p>
              <span
                v-if="todo.dueDate"
                class="card__due"
                :class="{ 'card__due--late': isOverdue(todo.dueDate) }"
              >
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5" />
                  <path d="M12 7v5.5l3 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                </svg>
                {{ formatDate(todo.dueDate) }}
              </span>
            </div>
          </div>
          <button
            v-if="isSelectMode"
            class="pick"
            :style="{
              background: selectedTodos.includes(todo.id) ? 'var(--brand)' : 'var(--surface)',
              borderColor: selectedTodos.includes(todo.id) ? 'var(--brand)' : 'var(--border-strong)'
            }"
            @click.stop="toggleSelect(todo.id)"
          >
            <svg viewBox="0 0 24 24" fill="none" :style="{ opacity: selectedTodos.includes(todo.id) ? 1 : 0 }">
              <path d="M6 12.5l4 4 8-8.5" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
        </article>

        <!-- 已完成：直接排在未完成下面，不再折叠 -->
        <article
          v-for="todo in completed"
          :key="todo.id"
          class="card card--done"
        >
          <div class="card__accent card__accent--done" aria-hidden="true"></div>
          <div class="card__inner">
            <button
              class="ck ck--on"
              aria-label="取消完成"
              @click.stop="toggleComplete(todo)"
            >
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M6 12.5l4 4 8-8.5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
            <div class="card__body">
              <p class="card__text card__text--done">{{ todo.text }}</p>
              <span v-if="todo.dueDate" class="card__due">{{ formatDate(todo.dueDate) }}</span>
            </div>
          </div>
          <button class="card__rm" aria-label="删除" @click.stop="quickDelete(todo)">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
            </svg>
          </button>
        </article>
      </TransitionGroup>
    </template>

    <!-- ============ 空状态 ============ -->
    <div v-else class="empty">
      <div class="empty__visual" aria-hidden="true">
        <svg viewBox="0 0 120 120" fill="none">
          <!-- 圆形底 -->
          <circle cx="60" cy="60" r="40" fill="var(--brand-softer)" />
          <circle cx="60" cy="60" r="40" stroke="var(--border-strong)" stroke-width="1.5" />
          <!-- 对勾 -->
          <path d="M44 61l9 9 18-19" stroke="var(--brand)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" />
          <!-- 装饰 -->
          <circle cx="26" cy="32" r="3" fill="var(--brand)" opacity="0.12" />
          <circle cx="96" cy="88" r="4" fill="var(--brand)" opacity="0.10" />
          <rect x="82" y="28" width="6" height="6" rx="1.5" fill="var(--brand)" opacity="0.08" />
        </svg>
      </div>
      <p class="empty__title">没有待办事项</p>
      <p class="empty__sub">点击右上角的 + 开始添加</p>
    </div>

    <!-- ============ 批量操作 ============ -->
    <Transition name="sheet">
      <div v-if="isSelectMode && selectedTodos.length > 0" class="action-bar">
        <span class="action-bar__count">已选 <strong>{{ selectedTodos.length }}</strong> 项</span>
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
const todos = ref([])
const isSelectMode = ref(false)
const selectedTodos = ref([])

const uncompleted = computed(() =>
  todos.value.filter((t) => !t.completed)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
)

const completed = computed(() =>
  todos.value.filter((t) => t.completed)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
)

const loadTodos = async () => { todos.value = await db.todos.toArray() }

const goToNewTodo = () => router.push('/todos/new')

const onCardClick = (todo) => {
  if (isSelectMode.value) toggleSelect(todo.id)
  else router.push(`/todos/edit/${todo.id}`)
}

const toggleComplete = async (todo) => {
  await db.todos.update(todo.id, { completed: !todo.completed })
  await loadTodos()
}

const toggleSelectMode = () => {
  isSelectMode.value = !isSelectMode.value
  if (!isSelectMode.value) selectedTodos.value = []
}

const toggleSelect = (id) => {
  const i = selectedTodos.value.indexOf(id)
  if (i > -1) selectedTodos.value.splice(i, 1)
  else selectedTodos.value.push(id)
}

const batchDelete = async () => {
  if (!confirm(`确定删除选中的 ${selectedTodos.value.length} 个待办吗？`)) return
  await db.todos.bulkDelete(selectedTodos.value)
  selectedTodos.value = []
  isSelectMode.value = false
  await loadTodos()
}

const cancelSelect = () => { selectedTodos.value = []; isSelectMode.value = false }

const quickDelete = async (todo) => {
  await db.todos.delete(todo.id)
  await loadTodos()
}

const isOverdue = (dueDate) => new Date(dueDate) < new Date()

const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  const now = new Date()
  const sameDay = d.toDateString() === now.toDateString()
  if (sameDay) return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  return d.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })
}

onMounted(() => { loadTodos() })
</script>

<style scoped>
/* ========================================================
   头部（与 Notes 完全一致）
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
.todo-list {
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
  position: relative;
}
.todo-list--muted {
  gap: var(--sp-2);
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
  height: 88px;
  transition: background var(--dur-fast) var(--ease),
              transform var(--dur-fast) var(--ease);
}
.card:active {
  transform: scale(0.98);
  background: rgba(62, 62, 68, 0.85);
}
.card--done {
  cursor: default;
}
.card--done:active {
  transform: none;
}

.card__inner {
  flex: 1;
  min-width: 0;
  padding: var(--sp-3) var(--sp-4);
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  overflow: hidden;
}

.card__body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  min-width: 0;
  overflow: hidden;
}

.card__text {
  font-size: var(--fs-sm);
  font-weight: 600;
  color: var(--text);
  line-height: 1.45;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.card__text--done {
  text-decoration: line-through;
  color: var(--text-subtle);
  font-weight: 500;
}

.card__due {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: var(--fs-xs);
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
}
.card__due svg { width: 13px; height: 13px; flex-shrink: 0; }
.card__due--late {
  color: var(--danger);
  font-weight: 600;
}

/* 复选框 */
.ck {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--r-full);
  border: 2px solid var(--border-strong);
  background: var(--surface);
  color: transparent;
  transition: all var(--dur-fast) var(--ease-out);
}
.ck svg { width: 13px; height: 13px; }
.ck:hover {
  border-color: var(--brand);
  color: var(--brand);
}
.ck--on {
  background: var(--brand);
  border-color: var(--brand);
  color: #fff;
}

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

/* 已完成项快速删除 */
.card__rm {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--r-full);
  color: var(--text-subtle);
  margin-right: var(--sp-2);
  transition: all var(--dur-fast) var(--ease);
}
.card__rm svg { width: 15px; height: 15px; }
.card__rm:hover { background: var(--danger-soft); color: var(--danger); }

/* 已完成分组折叠 */
.group-toggle {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  margin-top: var(--sp-5);
  margin-bottom: var(--sp-3);
  font-size: var(--fs-sm);
  font-weight: 500;
  color: var(--text-muted);
  padding: var(--sp-2) 0;
  transition: color var(--dur-fast) var(--ease);
}
.group-toggle:hover { color: var(--text); }
.group-toggle__arrow {
  width: 16px;
  height: 16px;
  transition: transform var(--dur) var(--ease-out);
}
.group-toggle__arrow.is-open { transform: rotate(90deg); }

.done-group { margin-bottom: var(--sp-4); }

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
.action-bar__count { font-size: var(--fs-sm); color: rgba(255, 255, 255, 0.65); }
.action-bar__count strong { color: #fff; font-weight: 600; }
.action-bar__btns { display: flex; gap: var(--sp-2); }

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
.abtn--ghost { background: rgba(255, 255, 255, 0.1); color: rgba(255, 255, 255, 0.85); }
.abtn--ghost:hover { background: rgba(255, 255, 255, 0.18); }
.abtn--danger { background: var(--danger); color: #fff; }
.abtn--danger:hover { background: #b91c1c; }
</style>
