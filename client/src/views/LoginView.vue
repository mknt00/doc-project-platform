<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
    <!-- 背景装饰 -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
      <div class="absolute bottom-20 right-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl"></div>
    </div>

    <!-- 登录卡片 -->
    <div class="relative w-full max-w-md">
      <div class="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl shadow-2xl p-8">
        <!-- 品牌 Logo -->
        <div class="flex justify-center mb-8">
          <div class="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
            <FileText class="w-8 h-8 text-white" />
          </div>
        </div>

        <!-- 标题 -->
        <h1 class="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          DocHub
        </h1>
        <p class="text-center text-slate-400 text-sm mb-8">
          {{ isLogin ? '登录您的账户' : '创建新账户' }}
        </p>

        <!-- 表单 -->
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- 邮箱字段 (仅注册时显示) -->
          <div v-if="!isLogin">
            <label class="block text-sm font-medium text-slate-300 mb-2">
              <Mail class="w-4 h-4 inline mr-2" />邮箱
            </label>
            <input
              v-model="formData.email"
              type="email"
              required
              class="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600/50 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              placeholder="your@email.com"
            />
          </div>

          <!-- 用户名字段 -->
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">
              <User class="w-4 h-4 inline mr-2" />用户名
            </label>
            <input
              v-model="formData.username"
              type="text"
              required
              class="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600/50 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              placeholder="输入用户名"
            />
          </div>

          <!-- 密码字段 -->
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">
              <Lock class="w-4 h-4 inline mr-2" />密码
            </label>
            <input
              v-model="formData.password"
              type="password"
              required
              class="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600/50 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              placeholder="••••••••"
            />
          </div>

          <!-- 错误提示 -->
          <div v-if="error" class="p-4 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400 text-sm flex items-start space-x-3">
            <AlertCircle class="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{{ error }}</span>
          </div>

          <!-- 提交按钮 -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
          >
            <span v-if="!loading" class="flex items-center justify-center space-x-2">
              <span>{{ isLogin ? '登录' : '注册' }}</span>
              <ArrowRight class="w-4 h-4" />
            </span>
            <span v-else class="flex items-center justify-center space-x-2">
              <Loader class="w-4 h-4 animate-spin" />
              <span>处理中...</span>
            </span>
          </button>
        </form>

        <!-- 切换模式 -->
        <div class="mt-6 text-center">
          <p class="text-slate-400 text-sm mb-4">
            {{ isLogin ? '还没有账号？' : '已有账号？' }}
          </p>
          <button
            @click="toggleMode"
            class="text-blue-400 hover:text-blue-300 font-semibold text-sm transition-colors"
          >
            {{ isLogin ? '立即注册' : '立即登录' }}
          </button>
        </div>
      </div>

      <!-- 底部提示 -->
      <p class="text-center text-slate-500 text-xs mt-6">
        测试账号: admin / admin123
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { FileText, User, Lock, Mail, AlertCircle, ArrowRight, Loader } from 'lucide-vue-next';

const router = useRouter();
const authStore = useAuthStore();

const isLogin = ref(true);
const error = ref('');
const loading = ref(false);
const formData = ref({
  username: '',
  email: '',
  password: '',
});

const toggleMode = () => {
  isLogin.value = !isLogin.value;
  error.value = '';
  formData.value = { username: '', email: '', password: '' };
};

const handleSubmit = async () => {
  try {
    error.value = '';
    loading.value = true;

    if (isLogin.value) {
      await authStore.login({
        username: formData.value.username,
        password: formData.value.password,
      });
    } else {
      await authStore.register(formData.value);
    }
    router.push('/');
  } catch (err: any) {
    error.value = err.response?.data?.error || '操作失败，请重试';
  } finally {
    loading.value = false;
  }
};
</script>
