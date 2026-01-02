<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold text-gray-800 mb-8">我的任务</h1>

    <div v-if="loading" class="text-center py-12">
      <div class="text-gray-500">加载中...</div>
    </div>

    <div v-else-if="tasks.length === 0" class="text-center py-12">
      <div class="text-gray-500">暂无任务</div>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="task in tasks"
        :key="task.id"
        class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
      >
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <h3 class="text-xl font-semibold text-gray-800 mb-2">{{ task.title }}</h3>
            <p class="text-gray-600 mb-3">{{ task.description }}</p>
            <div class="text-sm text-gray-500">
              <span>项目: {{ task.project_name }}</span>
              <span v-if="task.due_date" class="ml-4">截止: {{ formatDate(task.due_date) }}</span>
            </div>
          </div>
          <div class="flex gap-2">
            <span
              class="px-3 py-1 text-xs rounded-full"
              :class="getPriorityClass(task.priority)"
            >
              {{ getPriorityLabel(task.priority) }}
            </span>
            <select
              :value="task.status"
              @change="updateTaskStatus(task.id, ($event.target as HTMLSelectElement).value)"
              class="px-3 py-1 text-xs rounded-full border-0 cursor-pointer"
              :class="getTaskStatusClass(task.status)"
            >
              <option value="todo">待办</option>
              <option value="in-progress">进行中</option>
              <option value="done">已完成</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../services/api';

const tasks = ref<any[]>([]);
const loading = ref(true);

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

const updateTaskStatus = async (taskId: number, status: string) => {
  try {
    const task = tasks.value.find(t => t.id === taskId);
    if (task) {
      await api.tasks.update(taskId, { ...task, status });
      await fetchTasks();
    }
  } catch (error) {
    console.error('Failed to update task:', error);
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN');
};

const getPriorityClass = (priority: string) => {
  const classes: Record<string, string> = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-red-100 text-red-800',
  };
  return classes[priority] || 'bg-gray-100 text-gray-800';
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
    todo: 'bg-blue-100 text-blue-800',
    'in-progress': 'bg-yellow-100 text-yellow-800',
    done: 'bg-green-100 text-green-800',
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
};

onMounted(() => {
  fetchTasks();
});
</script>
