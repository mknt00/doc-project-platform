<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- 页面头部 -->
      <div class="mb-12">
        <h1 class="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
          我的任务
        </h1>
        <p class="text-slate-400">管理您的所有待办任务</p>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="flex justify-center py-12">
        <Loader class="w-8 h-8 text-blue-400 animate-spin" />
      </div>

      <!-- 空状态 -->
      <div v-else-if="tasks.length === 0" class="text-center py-20">
        <CheckSquare class="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h3 class="text-xl font-semibold text-slate-300 mb-2">暂无任务</h3>
        <p class="text-slate-400">您已完成所有任务！</p>
      </div>

      <!-- 任务分组显示 -->
      <div v-else class="space-y-8">
        <!-- 按优先级分组 -->
        <div v-for="priority in ['high', 'medium', 'low']" :key="priority">
            <div
            v-if="tasksByPriority[priority] && tasksByPriority[priority].length > 0"
            class="space-y-4"
          >
            <div class="flex items-center space-x-3 mb-4">
              <div
                class="w-3 h-3 rounded-full"
                :class="getPriorityColor(priority)"
              ></div>
              <h2 class="text-lg font-semibold text-white">
                {{ getPriorityLabel(priority) }}优先级 ({{ tasksByPriority[priority]?.length || 0 }})
              </h2>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div
                v-for="task in (tasksByPriority[priority] || [])"
                :key="task.id"
                class="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-6 hover:border-blue-500/50 hover:bg-slate-800/80 transition-all shadow-lg hover:shadow-xl hover:shadow-blue-500/10"
              >
                <!-- 任务头部 -->
                <div class="flex justify-between items-start mb-4">
                  <div class="flex-1">
                    <h3 class="text-lg font-semibold text-white mb-2 hover:text-blue-400 transition-colors">
                      {{ task.title }}
                    </h3>
                    <p class="text-slate-400 text-sm line-clamp-2">
                      {{ task.description || '暂无描述' }}
                    </p>
                  </div>
                  <span
                    class="px-3 py-1 text-xs rounded-full font-medium flex-shrink-0 ml-2"
                    :class="getPriorityClass(task.priority)"
                  >
                    {{ getPriorityLabel(task.priority) }}
                  </span>
                </div>

                <!-- 任务元数据 -->
                <div class="space-y-2 pt-4 border-t border-slate-700/50">
                  <div class="flex items-center space-x-2 text-xs text-slate-400">
                    <FolderOpen class="w-4 h-4" />
                    <span>{{ task.project_name }}</span>
                  </div>
                  <div v-if="task.due_date" class="flex items-center space-x-2 text-xs" :class="isOverdue(task.due_date) ? 'text-red-400' : 'text-slate-400'">
                    <Calendar class="w-4 h-4" />
                    <span>{{ formatDate(task.due_date) }}</span>
                  </div>
                </div>

                <!-- 任务状态选择 -->
                <div class="mt-4 flex gap-2">
                  <button
                    v-for="status in ['todo', 'in-progress', 'done']"
                    :key="status"
                    @click="updateTaskStatus(task.id, status)"
                    :class="[
                      'flex-1 py-2 px-3 rounded text-xs font-medium transition-all',
                      task.status === status
                        ? getTaskStatusClass(status) + ' ring-2 ring-offset-2 ring-offset-slate-800'
                        : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
                    ]"
                  >
                    {{ getTaskStatusLabel(status) }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import api from '../services/api';
import { Loader, CheckSquare, FolderOpen, Calendar } from 'lucide-vue-next';

const tasks = ref<any[]>([]);
const loading = ref(true);

const tasksByPriority = computed(() => {
  const groups: Record<string, any[]> = {
    high: tasks.value.filter(t => t.priority === 'high'),
    medium: tasks.value.filter(t => t.priority === 'medium'),
    low: tasks.value.filter(t => t.priority === 'low'),
  };
  return groups;
});

const fetchTasks = async () => {
  try {
    loading.value = true;
    const response = await api.tasks.getMyTasks();
    tasks.value = response.data;
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
  } finally {
    loading.value = false;
  }
};

const updateTaskStatus = async (id: number, status: string) => {
  try {
    await api.tasks.update(id, { status });
    const task = tasks.value.find(t => t.id === id);
    if (task) {
      task.status = status;
    }
  } catch (error) {
    console.error('Failed to update task:', error);
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN');
};

const isOverdue = (dateString: string) => {
  return new Date(dateString) < new Date();
};

const getPriorityClass = (priority: string) => {
  const classes: Record<string, string> = {
    low: 'bg-slate-700/50 text-slate-400',
    medium: 'bg-blue-500/20 text-blue-400',
    high: 'bg-red-500/20 text-red-400',
  };
  return classes[priority] || 'bg-slate-700/50 text-slate-400';
};

const getPriorityColor = (priority: string) => {
  const colors: Record<string, string> = {
    low: 'bg-slate-500',
    medium: 'bg-blue-500',
    high: 'bg-red-500',
  };
  return colors[priority] || 'bg-slate-500';
};

const getPriorityLabel = (priority: string) => {
  const labels: Record<string, string> = {
    low: '低',
    medium: '中',
    high: '高',
  };
  return labels[priority] || priority;
};

const getTaskStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    todo: 'bg-blue-500/20 text-blue-400',
    'in-progress': 'bg-yellow-500/20 text-yellow-400',
    done: 'bg-green-500/20 text-green-400',
  };
  return classes[status] || 'bg-slate-700/50 text-slate-400';
};

const getTaskStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    todo: '待办',
    'in-progress': '进行中',
    done: '已完成',
  };
  return labels[status] || status;
};

onMounted(() => {
  fetchTasks();
});
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
