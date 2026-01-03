<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
    <!-- 顶部导航栏 -->
    <nav class="sticky top-0 z-50 bg-slate-900/95 backdrop-blur border-b border-slate-700/50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo 和品牌 -->
          <router-link to="/" class="flex items-center space-x-3 group">
            <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
              <FileText class="w-6 h-6 text-white" />
            </div>
            <div class="hidden sm:block">
              <h1 class="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                DocHub
              </h1>
              <p class="text-xs text-slate-400">文档与项目管理</p>
            </div>
          </router-link>

          <!-- 中间导航菜单 -->
          <div class="hidden md:flex items-center space-x-1">
            <NavLink to="/" icon="Home" label="项目" />
            <NavLink to="/my-tasks" icon="CheckSquare" label="我的任务" />
            <NavLink to="/published" icon="BookOpen" label="已发布文档" />
          </div>

          <!-- 右侧用户菜单 -->
          <div class="flex items-center space-x-4">
            <div v-if="authStore.user" class="hidden sm:flex items-center space-x-2 px-3 py-2 rounded-lg bg-slate-800/50">
              <User class="w-4 h-4 text-slate-400" />
              <span class="text-sm text-slate-300">{{ authStore.user.username }}</span>
            </div>
            <button
              @click="handleLogout"
              class="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors font-medium text-sm"
            >
              <LogOut class="w-4 h-4" />
              <span class="hidden sm:inline">退出</span>
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- 主内容区域 -->
    <main class="min-h-[calc(100vh-64px)]">
      <router-view />
    </main>

    <!-- 页脚 -->
    <footer class="border-t border-slate-700/50 bg-slate-900/50 mt-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="text-center text-slate-400 text-sm">
          <p>© 2026 DocHub. 现代化的文档与项目管理平台。</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { FileText, User, LogOut } from 'lucide-vue-next';
import NavLink from './NavLink.vue';

const router = useRouter();
const authStore = useAuthStore();

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};
</script>

<style scoped>
</style>
