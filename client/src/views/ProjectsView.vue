<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
    <!-- 页面头部 -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="flex justify-between items-center mb-12">
        <div>
          <h1 class="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            项目列表
          </h1>
          <p class="text-slate-400">管理和组织您的所有项目</p>
        </div>
        <button
          @click="showCreateModal = true"
          class="inline-flex items-center space-x-2 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg hover:shadow-xl"
        >
          <Plus class="w-5 h-5" />
          <span>新建项目</span>
        </button>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="flex justify-center py-12">
        <Loader class="w-8 h-8 text-blue-400 animate-spin" />
      </div>

      <!-- 空状态 -->
      <div v-else-if="projects.length === 0" class="text-center py-20">
        <FolderOpen class="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h3 class="text-xl font-semibold text-slate-300 mb-2">暂无项目</h3>
        <p class="text-slate-400 mb-6">点击上方按钮创建您的第一个项目</p>
      </div>

      <!-- 项目网格 -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="project in projects"
          :key="project.id"
          @click="goToProject(project.id)"
          class="group bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-6 hover:border-blue-500/50 hover:bg-slate-800/80 transition-all cursor-pointer shadow-lg hover:shadow-xl hover:shadow-blue-500/10"
        >
          <!-- 项目头部 -->
          <div class="flex justify-between items-start mb-4">
            <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center group-hover:shadow-lg transition-shadow">
              <FolderOpen class="w-6 h-6 text-white" />
            </div>
            <span
              class="px-3 py-1 text-xs rounded-full font-medium"
              :class="project.status === 'active'
                ? 'bg-green-500/20 text-green-400'
                : 'bg-slate-700/50 text-slate-400'"
            >
              {{ project.status === 'active' ? '进行中' : '已完成' }}
            </span>
          </div>

          <!-- 项目信息 -->
          <h3 class="text-lg font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
            {{ project.name }}
          </h3>
          <p class="text-slate-400 text-sm mb-4 line-clamp-2">
            {{ project.description || '暂无描述' }}
          </p>

          <!-- 项目元数据 -->
          <div class="space-y-2 pt-4 border-t border-slate-700/50">
            <div class="flex items-center space-x-2 text-xs text-slate-400">
              <User class="w-4 h-4" />
              <span>{{ project.owner_name }}</span>
            </div>
            <div class="flex items-center space-x-2 text-xs text-slate-400">
              <Calendar class="w-4 h-4" />
              <span>{{ formatDate(project.created_at) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 创建项目模态框 -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showCreateModal" class="fixed inset-0 z-50 flex items-center justify-center px-4">
          <!-- 背景遮罩 -->
          <div class="absolute inset-0 bg-black/50 backdrop-blur" @click="showCreateModal = false"></div>

          <!-- 模态框内容 -->
          <div class="relative bg-slate-800 border border-slate-700/50 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-2xl font-bold text-white">新建项目</h2>
              <button
                @click="showCreateModal = false"
                class="text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X class="w-6 h-6" />
              </button>
            </div>

            <form @submit.prevent="createProject" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-2">项目名称</label>
                <input
                  v-model="newProject.name"
                  type="text"
                  required
                  class="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600/50 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  placeholder="输入项目名称"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-2">项目描述</label>
                <textarea
                  v-model="newProject.description"
                  rows="4"
                  class="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600/50 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                  placeholder="输入项目描述"
                ></textarea>
              </div>
              <div class="flex gap-3 pt-4">
                <button
                  type="button"
                  @click="showCreateModal = false"
                  class="flex-1 px-4 py-3 rounded-lg bg-slate-700/50 text-slate-300 hover:bg-slate-700 transition-colors font-medium"
                >
                  取消
                </button>
                <button
                  type="submit"
                  class="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 transition-all font-medium"
                >
                  创建
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';
import { Plus, FolderOpen, User, Calendar, X, Loader } from 'lucide-vue-next';

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

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
