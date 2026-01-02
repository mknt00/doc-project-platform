<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 顶部导航栏 -->
    <nav class="bg-white shadow-sm border-b border-gray-200">
      <div class="container mx-auto px-4">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center space-x-8">
            <router-link to="/" class="text-xl font-bold text-blue-600">
              文档项目管理平台
            </router-link>
            <div class="hidden md:flex space-x-4">
              <router-link
                to="/"
                class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                项目
              </router-link>
              <router-link
                to="/my-tasks"
                class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                我的任务
              </router-link>
              <router-link
                to="/published"
                class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                已发布文档
              </router-link>
            </div>
          </div>

          <div class="flex items-center space-x-4">
            <div v-if="authStore.user" class="text-sm text-gray-700">
              欢迎, {{ authStore.user.username }}
            </div>
            <button
              @click="handleLogout"
              class="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 text-sm"
            >
              退出
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- 主内容区 -->
    <main>
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};
</script>
