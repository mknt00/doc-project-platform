<template>
  <div class="container mx-auto px-4 py-8">
    <div v-if="loading" class="text-center py-12">
      <div class="text-gray-500">加载中...</div>
    </div>

    <div v-else-if="project">
      <!-- 项目头部 -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <div class="flex justify-between items-start">
          <div>
            <h1 class="text-3xl font-bold text-gray-800 mb-2">{{ project.name }}</h1>
            <p class="text-gray-600">{{ project.description }}</p>
          </div>
          <span
            class="px-4 py-2 rounded-full text-sm font-medium"
            :class="project.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
          >
            {{ project.status === 'active' ? '进行中' : '已完成' }}
          </span>
        </div>
      </div>

      <!-- 标签页 -->
      <div class="bg-white rounded-lg shadow-md mb-6">
        <div class="border-b border-gray-200">
          <nav class="flex space-x-8 px-6">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              class="py-4 px-2 border-b-2 font-medium text-sm transition"
              :class="activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
            >
              {{ tab.label }}
            </button>
          </nav>
        </div>

        <div class="p-6">
          <!-- 文档标签 -->
          <div v-if="activeTab === 'documents'">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-xl font-semibold">项目文档</h2>
              <button
                @click="showDocumentModal = true"
                class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                + 新建文档
              </button>
            </div>

            <div v-if="documents.length === 0" class="text-center py-8 text-gray-500">
              暂无文档
            </div>

            <div v-else class="space-y-4">
              <div
                v-for="doc in documents"
                :key="doc.id"
                class="border border-gray-200 rounded-lg p-4 hover:border-blue-500 transition cursor-pointer"
                @click="viewDocument(doc.id)"
              >
                <div class="flex justify-between items-start">
                  <div class="flex-1">
                    <h3 class="text-lg font-semibold text-gray-800">{{ doc.title }}</h3>
                    <div class="text-sm text-gray-500 mt-2">
                      <span>作者: {{ doc.author_name }}</span>
                      <span class="mx-2">|</span>
                      <span>版本: {{ doc.version }}</span>
                      <span class="mx-2">|</span>
                      <span>{{ formatDate(doc.updated_at) }}</span>
                    </div>
                  </div>
                  <span
                    class="px-3 py-1 text-xs rounded-full"
                    :class="getStatusClass(doc.status)"
                  >
                    {{ getStatusLabel(doc.status) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- 任务标签 -->
          <div v-if="activeTab === 'tasks'">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-xl font-semibold">项目任务</h2>
              <button
                @click="showTaskModal = true"
                class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                + 新建任务
              </button>
            </div>

            <div v-if="tasks.length === 0" class="text-center py-8 text-gray-500">
              暂无任务
            </div>

            <div v-else class="space-y-4">
              <div
                v-for="task in tasks"
                :key="task.id"
                class="border border-gray-200 rounded-lg p-4 hover:border-blue-500 transition"
              >
                <div class="flex justify-between items-start">
                  <div class="flex-1">
                    <h3 class="text-lg font-semibold text-gray-800">{{ task.title }}</h3>
                    <p class="text-gray-600 text-sm mt-2">{{ task.description }}</p>
                    <div class="text-sm text-gray-500 mt-2">
                      <span v-if="task.assignee_name">负责人: {{ task.assignee_name }}</span>
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
                    <span
                      class="px-3 py-1 text-xs rounded-full"
                      :class="getTaskStatusClass(task.status)"
                    >
                      {{ getTaskStatusLabel(task.status) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 成员标签 -->
          <div v-if="activeTab === 'members'">
            <h2 class="text-xl font-semibold mb-6">项目成员</h2>
            <div class="space-y-3">
              <div
                v-for="member in project.members"
                :key="member.id"
                class="flex justify-between items-center border border-gray-200 rounded-lg p-4"
              >
                <div>
                  <div class="font-medium text-gray-800">{{ member.username }}</div>
                  <div class="text-sm text-gray-500">{{ member.email }}</div>
                </div>
                <span
                  class="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-800"
                >
                  {{ member.role }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 新建文档模态框 -->
    <div v-if="showDocumentModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 class="text-2xl font-bold mb-6">新建文档</h2>
        <form @submit.prevent="createDocument" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">文档标题</label>
            <input
              v-model="newDocument.title"
              type="text"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">文档内容 (支持Markdown)</label>
            <textarea
              v-model="newDocument.content"
              rows="12"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            ></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">版本号</label>
            <input
              v-model="newDocument.version"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="1.0"
            />
          </div>
          <div class="flex gap-4">
            <button
              type="button"
              @click="showDocumentModal = false"
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

    <!-- 新建任务模态框 -->
    <div v-if="showTaskModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <h2 class="text-2xl font-bold mb-6">新建任务</h2>
        <form @submit.prevent="createTask" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">任务标题</label>
            <input
              v-model="newTask.title"
              type="text"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">任务描述</label>
            <textarea
              v-model="newTask.description"
              rows="4"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">优先级</label>
            <select
              v-model="newTask.priority"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">低</option>
              <option value="medium">中</option>
              <option value="high">高</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">截止日期</label>
            <input
              v-model="newTask.due_date"
              type="date"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div class="flex gap-4">
            <button
              type="button"
              @click="showTaskModal = false"
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
import { useRoute, useRouter } from 'vue-router';
import api from '../services/api';

const route = useRoute();
const router = useRouter();
const projectId = Number(route.params.id);

const project = ref<any>(null);
const documents = ref<any[]>([]);
const tasks = ref<any[]>([]);
const loading = ref(true);
const activeTab = ref('documents');
const showDocumentModal = ref(false);
const showTaskModal = ref(false);

const tabs = [
  { id: 'documents', label: '文档' },
  { id: 'tasks', label: '任务' },
  { id: 'members', label: '成员' },
];

const newDocument = ref({
  title: '',
  content: '',
  version: '1.0',
  project_id: projectId,
});

const newTask = ref({
  title: '',
  description: '',
  priority: 'medium',
  due_date: '',
  project_id: projectId,
});

const fetchProject = async () => {
  try {
    const response = await api.projects.getById(projectId);
    project.value = response.data;
  } catch (error) {
    console.error('Failed to fetch project:', error);
  }
};

const fetchDocuments = async () => {
  try {
    const response = await api.documents.getByProject(projectId);
    documents.value = response.data;
  } catch (error) {
    console.error('Failed to fetch documents:', error);
  }
};

const fetchTasks = async () => {
  try {
    const response = await api.tasks.getByProject(projectId);
    tasks.value = response.data;
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
  }
};

const createDocument = async () => {
  try {
    await api.documents.create(newDocument.value);
    showDocumentModal.value = false;
    newDocument.value = { title: '', content: '', version: '1.0', project_id: projectId };
    await fetchDocuments();
  } catch (error) {
    console.error('Failed to create document:', error);
  }
};

const createTask = async () => {
  try {
    await api.tasks.create(newTask.value);
    showTaskModal.value = false;
    newTask.value = { title: '', description: '', priority: 'medium', due_date: '', project_id: projectId };
    await fetchTasks();
  } catch (error) {
    console.error('Failed to create task:', error);
  }
};

const viewDocument = (id: number) => {
  router.push(`/documents/${id}`);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN');
};

const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800',
    published: 'bg-green-100 text-green-800',
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    draft: '草稿',
    published: '已发布',
  };
  return labels[status] || status;
};

const getTaskStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    todo: 'bg-blue-100 text-blue-800',
    'in-progress': 'bg-yellow-100 text-yellow-800',
    done: 'bg-green-100 text-green-800',
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
};

const getTaskStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    todo: '待办',
    'in-progress': '进行中',
    done: '已完成',
  };
  return labels[status] || status;
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

onMounted(async () => {
  loading.value = true;
  await Promise.all([fetchProject(), fetchDocuments(), fetchTasks()]);
  loading.value = false;
});
</script>
