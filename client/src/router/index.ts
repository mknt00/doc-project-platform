import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import MainLayout from '../components/MainLayout.vue'
import LoginView from '../views/LoginView.vue'
import ProjectsView from '../views/ProjectsView.vue'
import ProjectDetailView from '../views/ProjectDetailView.vue'
import DocumentView from '../views/DocumentView.vue'
import MyTasksView from '../views/MyTasksView.vue'
import PublishedDocsView from '../views/PublishedDocsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/',
      component: MainLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'projects',
          component: ProjectsView,
        },
        {
          path: 'projects/:id',
          name: 'project-detail',
          component: ProjectDetailView,
        },
        {
          path: 'documents/:id',
          name: 'document',
          component: DocumentView,
        },
        {
          path: 'my-tasks',
          name: 'my-tasks',
          component: MyTasksView,
        },
        {
          path: 'published',
          name: 'published',
          component: PublishedDocsView,
        },
      ],
    },
  ],
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.path === '/login' && authStore.isAuthenticated) {
    next('/')
  } else {
    next()
  }
})

export default router
