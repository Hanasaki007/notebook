<template>
  <div class="page page--full editor">
    <header class="ed-hd">
      <button class="ed-hd__back" @click="goBack">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M15 5l-7 7 7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <span>返回</span>
      </button>
      <div class="ed-hd__spacer"></div>
      <button class="ed-hd__save" @click="saveTodo">保存</button>
    </header>

    <div class="form">
      <label class="field">
        <span class="field__label">待办内容</span>
        <textarea
          v-model="todo.text"
          class="field__textarea"
          placeholder="需要做什么..."
          rows="3"
          autofocus
        ></textarea>
      </label>

      <label class="field">
        <span class="field__label">截止时间</span>
        <span class="field__hint">可选</span>
        <input
          v-model="todo.dueDate"
          type="datetime-local"
          class="field__input"
        />
      </label>
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

const goBack = () => router.back()

const saveTodo = async () => {
  if (!todo.value.text.trim()) {
    alert('请输入待办事项内容')
    return
  }
  const now = new Date().toISOString()
  await db.todos.add({
    text: todo.value.text.trim(),
    dueDate: todo.value.dueDate ? new Date(todo.value.dueDate).toISOString() : null,
    completed: false,
    createdAt: now
  })
  router.back()
}
</script>

<style scoped>
/* ============ 顶部 ============ */
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

/* ============ 表单 ============ */
.form {
  display: flex;
  flex-direction: column;
  gap: var(--sp-6);
}

.field {
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
}
.field__label {
  font-size: var(--fs-sm);
  font-weight: 600;
  color: var(--text);
  display: flex;
  align-items: center;
  gap: var(--sp-2);
}
.field__hint {
  font-weight: 400;
  color: var(--text-subtle);
  font-size: var(--fs-xs);
}
.field__textarea {
  width: 100%;
  border: 0.5px solid rgba(255, 255, 255, 0.18);
  border-radius: var(--r-md);
  background: rgba(50, 50, 55, 0.72);
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
  padding: var(--sp-3) var(--sp-4);
  font-size: var(--fs-base);
  line-height: 1.6;
  resize: vertical;
  min-height: 100px;
  transition: border-color var(--dur) var(--ease),
              box-shadow var(--dur) var(--ease);
}
.field__textarea:focus {
  outline: none;
  border-color: var(--brand);
  box-shadow: 0 0 0 3px var(--brand-soft),
              inset 0 1px 0 rgba(255, 255, 255, 0.08);
}
.field__textarea::placeholder { color: var(--text-subtle); }

.field__input {
  width: 100%;
  border: 0.5px solid rgba(255, 255, 255, 0.18);
  border-radius: var(--r-md);
  background: rgba(50, 50, 55, 0.72);
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
  padding: var(--sp-3) var(--sp-4);
  font-size: var(--fs-sm);
  color: var(--text);
  transition: border-color var(--dur) var(--ease),
              box-shadow var(--dur) var(--ease);
}
.field__input:focus {
  outline: none;
  border-color: var(--brand);
  box-shadow: 0 0 0 3px var(--brand-soft),
              inset 0 1px 0 rgba(255, 255, 255, 0.08);
}
</style>
