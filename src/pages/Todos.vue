<template>
  <div class="todos-page">
    <div class="header">
      <div class="header-left">
        <button class="icon-btn" @click="goToNewTodo">
          <span class="icon">＋</span>
        </button>
      </div>
      <h1 class="title">待办</h1>
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
    
    <div class="todos-list" v-if="todos.length > 0">
      <div
        v-for="todo in sortedTodos"
        :key="todo.id"
        class="todo-card"
        :class="{ completed: todo.completed, selected: selectedTodos.includes(todo.id), 'select-mode': isSelectMode }"
      >
        <div class="todo-content" @click="toggleComplete(todo)">
          <div class="todo-checkbox">
            <input 
              type="checkbox" 
              :checked="todo.completed"
              @change.stop="toggleComplete(todo)"
            />
          </div>
          <div class="todo-text">
            <p class="todo-title" :class="{ 'line-through': todo.completed }">{{ todo.text }}</p>
            <div class="todo-due" v-if="todo.dueDate">
              <span class="due-label">截止：</span>
              <span class="due-date" :class="{ overdue: isOverdue(todo.dueDate) }">
                {{ formatDate(todo.dueDate) }}
              </span>
            </div>
          </div>
        </div>
        
        <div class="select-checkbox" v-if="isSelectMode">
          <input 
            type="checkbox" 
            :checked="selectedTodos.includes(todo.id)"
            @change="toggleSelect(todo.id)"
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
      <p>还没有待办事项</p>
      <p>点击左上角的 + 开始添加</p>
    </div>
    
    <div class="batch-actions" v-if="isSelectMode && selectedTodos.length > 0">
      <button class="batch-btn" @click="batchDelete">
        删除选中 ({{ selectedTodos.length }})
      </button>
      <button class="batch-btn cancel" @click="cancelSelect">取消</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { db } from '../db'
import emptyIcon from '@/assets/icon-todos.png'

const router = useRouter()
const todos = ref([])
const isSelectMode = ref(false)
const selectedTodos = ref([])

const sortedTodos = computed(() => {
  return [...todos.value].sort((a, b) => {
    // 未完成的在前，已完成的在后
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1
    }
    // 按创建时间排序
    return new Date(b.createdAt) - new Date(a.createdAt)
  })
})

const loadTodos = async () => {
  todos.value = await db.todos.toArray()
}

const goToNewTodo = () => {
  router.push('/todos/new')
}

const toggleComplete = async (todo) => {
  await db.todos.update(todo.id, { completed: !todo.completed })
  await loadTodos()
}

const toggleSelectMode = () => {
  isSelectMode.value = !isSelectMode.value
  if (!isSelectMode.value) {
    selectedTodos.value = []
  }
}

const toggleSelect = (id) => {
  const index = selectedTodos.value.indexOf(id)
  if (index > -1) {
    selectedTodos.value.splice(index, 1)
  } else {
    selectedTodos.value.push(id)
  }
}

const batchDelete = async () => {
  if (confirm(`确定要删除选中的 ${selectedTodos.value.length} 个待办事项吗？`)) {
    await db.todos.bulkDelete(selectedTodos.value)
    selectedTodos.value = []
    isSelectMode.value = false
    await loadTodos()
  }
}

const cancelSelect = () => {
  selectedTodos.value = []
  isSelectMode.value = false
}

const isOverdue = (dueDate) => {
  return new Date(dueDate) < new Date()
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('zh-CN')
}

onMounted(() => {
  loadTodos()
})
</script>

<style scoped>
.todos-page {
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

.todos-list {
  padding: 16px;
}

.todo-card {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  position: relative;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  align-items: center;
}

.todo-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.todo-card.completed {
  opacity: 0.7;
}

.todo-card.selected {
  border: 2px solid var(--primary-color);
}

.todo-card.select-mode {
  padding-right: 44px;
}

.todo-content {
  display: flex;
  gap: 12px;
  flex: 1;
}

.todo-checkbox {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.todo-checkbox input {
  width: 20px;
  height: 20px;
  cursor: pointer;
  margin: 0;
}

.todo-text {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.todo-title {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.4;
}

.todo-title.line-through {
  text-decoration: line-through;
  color: var(--text-secondary);
}

.todo-due {
  font-size: 12px;
  color: var(--text-secondary);
}

.due-label {
  color: var(--text-tertiary);
}

.due-date {
  color: var(--text-secondary);
}

.due-date.overdue {
  color: #dc2626;
  font-weight: 500;
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