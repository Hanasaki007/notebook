<template>
  <div class="new-todo-page">
    <div class="header">
      <div class="header-left">
        <button class="back-btn" @click="goBack">返回</button>
      </div>
      <h1 class="title">新建待办</h1>
      <div class="header-right">
        <button class="save-btn" @click="saveTodo">保存</button>
      </div>
    </div>
    
    <div class="todo-form">
      <div class="form-group">
        <label class="label">待办事项</label>
        <textarea 
          v-model="todo.text" 
          class="text-input"
          placeholder="输入待办事项..."
          rows="3"
        ></textarea>
      </div>
      
      <div class="form-group">
        <label class="label">截止时间（可选）</label>
        <input 
          type="datetime-local" 
          v-model="todo.dueDate" 
          class="date-input"
        />
      </div>
      

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { db } from '../db'

const router = useRouter()

const todo = ref({
  text: '',
  dueDate: '',
  completed: false
})

const goBack = () => {
  router.back()
}

const saveTodo = async () => {
  if (!todo.value.text.trim()) {
    alert('请输入待办事项内容')
    return
  }
  
  const now = new Date().toISOString()
  await db.todos.add({
    text: todo.value.text,
    dueDate: todo.value.dueDate ? new Date(todo.value.dueDate).toISOString() : null,
    completed: false,
    createdAt: now
  })
  
  router.back()
}
</script>

<style scoped>
.new-todo-page {
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

.todo-form {
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
  color: var(--text-primary);
}

.text-input {
  width: 100%;
  padding: 16px;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  font-size: 16px;
  line-height: 1.5;
  resize: vertical;
  min-height: 100px;
  background: var(--input-bg);
  color: var(--text-primary);
  font-family: inherit;
  transition: border-color 0.2s;
}

.text-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.date-input {
  width: 100%;
  padding: 16px;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  font-size: 16px;
  background: var(--input-bg);
  color: var(--text-primary);
  transition: border-color 0.2s;
}

.date-input:focus {
  outline: none;
  border-color: var(--primary-color);
}


</style>