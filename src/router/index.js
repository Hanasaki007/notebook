import { createRouter, createWebHashHistory } from 'vue-router'

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
      component: () => import('../pages/Notes.vue')
    },
    {
      path: '/todos',
      name: 'Todos',
      component: () => import('../pages/Todos.vue')
    },
    {
      path: '/settings',
      name: 'Settings',
      component: () => import('../pages/Settings.vue')
    },
    {
      path: '/notes/new',
      name: 'NewNote',
      component: () => import('../pages/NewNote.vue'),
      meta: { hideTabBar: true }
    },
    {
      path: '/notes/edit/:id',
      name: 'EditNote',
      component: () => import('../pages/EditNote.vue'),
      meta: { hideTabBar: true }
    },
    {
      path: '/todos/new',
      name: 'NewTodo',
      component: () => import('../pages/NewTodo.vue'),
      meta: { hideTabBar: true }
    },
    {
      path: '/todos/edit/:id',
      name: 'EditTodo',
      component: () => import('../pages/EditTodo.vue'),
      meta: { hideTabBar: true }
    }
  ]
})

export default router
