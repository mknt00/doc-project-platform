<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
      <h2 class="text-3xl font-bold text-center mb-8 text-gray-800">
        {{ isLogin ? '登录' : '注册' }}
      </h2>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div v-if="!isLogin">
          <label class="block text-sm font-medium text-gray-700 mb-2">邮箱</label>
          <input
            v-model="formData.email"
            type="email"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="your@email.com"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">用户名</label>
          <input
            v-model="formData.username"
            type="text"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="用户名"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">密码</label>
          <input
            v-model="formData.password"
            type="password"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="••••••••"
          />
        </div>

        <div v-if="error" class="text-red-500 text-sm">{{ error }}</div>

        <button
          type="submit"
          class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200 font-medium"
        >
          {{ isLogin ? '登录' : '注册' }}
        </button>
      </form>

      <div class="mt-6 text-center">
        <button
          @click="toggleMode"
          class="text-blue-600 hover:text-blue-800 text-sm"
        >
          {{ isLogin ? '没有账号？立即注册' : '已有账号？立即登录' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const isLogin = ref(true);
const error = ref('');
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
  }
};
</script>
