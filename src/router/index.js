import { createRouter, createWebHashHistory } from 'vue-router'
import Notes from '../pages/Notes.vue'
import Todos from '../pages/Todos.vue'
import Settings from '../pages/Settings.vue'
import NewNote from '../pages/NewNote.vue'
import EditNote from '../pages/EditNote.vue'
import NewTodo from '../pages/NewTodo.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/notes'
    },
    {
      path: '/notes',
      name: 'Notes',
      component: Notes
    },
    {
      path: '/todos',
      name: 'Todos',
      component: Todos
    },
    {
      path: '/settings',
      name: 'Settings',
      component: Settings
    },
    {
      path: '/notes/new',
      name: 'NewNote',
      component: NewNote
    },
    {
      path: '/notes/edit/:id',
      name: 'EditNote',
      component: EditNote
    },
    {
      path: '/todos/new',
      name: 'NewTodo',
      component: NewTodo
    }
  ]
})

export default router
