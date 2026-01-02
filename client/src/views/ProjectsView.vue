<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold text-gray-800">项目列表</h1>
      <button
        @click="showCreateModal = true"
        class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
      >
        + 新建项目
      </button>
    </div>

    <div v-if="loading" class="text-center py-12">
      <div class="text-gray-500">加载中...</div>
    </div>

    <div v-else-if="projects.length === 0" class="text-center py-12">
      <div class="text-gray-500">暂无项目，点击上方按钮创建第一个项目</div>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="project in projects"
        :key="project.id"
        class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer"
        @click="goToProject(project.id)"
      >
        <div class="flex justify-between items-start mb-4">
          <h3 class="text-xl font-semibold text-gray-800">{{ project.name }}</h3>
          <span
            class="px-3 py-1 text-xs rounded-full"
            :class="project.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
          >
            {{ project.status === 'active' ? '进行中' : '已完成' }}
          </span>
        </div>
        <p class="text-gray-600 text-sm mb-4">{{ project.description || '暂无描述' }}</p>
        <div class="text-xs text-gray-500">
          <div>负责人: {{ project.owner_name }}</div>
          <div>创建时间: {{ formatDate(project.created_at) }}</div>
        </div>
      </div>
    </div>

    <!-- 创建项目模态框 -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <h2 class="text-2xl font-bold mb-6">新建项目</h2>
        <form @submit.prevent="createProject" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">项目名称</label>
            <input
              v-model="newProject.name"
              type="text"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="输入项目名称"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">项目描述</label>
            <textarea
              v-model="newProject.description"
              rows="4"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="输入项目描述"
            ></textarea>
          </div>
          <div class="flex gap-4">
            <button
              type="button"
              @click="showCreateModal = false"
              class="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300"
            >
              取消
            </button>
            <button
              type="submit"
              class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
            >
              创建
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';

const router = useRouter();
const projects = ref<any[]>([]);
const loading = ref(true);
const showCreateModal = ref(false);
const newProject = ref({
  name: '',
  description: '',
});

const fetchProjects = async () => {
  try {
    loading.value = true;
    const response = await api.projects.getAll();
    projects.value = response.data;
  } catch (error) {
    console.error('Failed to fetch projects:', error);
  } finally {
    loading.value = false;
  }
};

const createProject = async () => {
  try {
    await api.projects.create(newProject.value);
    showCreateModal.value = false;
    newProject.value = { name: '', description: '' };
    await fetchProjects();
  } catch (error) {
    console.error('Failed to create project:', error);
  }
};

const goToProject = (id: number) => {
  router.push(`/projects/${id}`);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN');
};

onMounted(() => {
  fetchProjects();
});
</script>
