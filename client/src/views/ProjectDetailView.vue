<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
    <div v-if="loading" class="flex justify-center items-center min-h-screen">
      <Loader class="w-8 h-8 text-blue-400 animate-spin" />
    </div>

    <div v-else-if="project" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- 项目头部 -->
      <div class="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-8 mb-8">
        <div class="flex justify-between items-start">
          <div>
            <h1 class="text-4xl font-bold text-white mb-2">{{ project.name }}</h1>
            <p class="text-slate-400">{{ project.description }}</p>
          </div>
          <span
            class="px-4 py-2 rounded-full text-sm font-medium"
            :class="project.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-slate-700/50 text-slate-400'"
          >
            {{ project.status === 'active' ? '进行中' : '已完成' }}
          </span>
        </div>
      </div>

      <!-- 标签页 -->
      <div class="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl overflow-hidden">
        <!-- 标签页导航 -->
        <div class="border-b border-slate-700/50 flex overflow-x-auto">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'px-6 py-4 font-medium text-sm whitespace-nowrap transition-all flex items-center space-x-2',
              activeTab === tab.id
                ? 'border-b-2 border-blue-500 text-blue-400 bg-slate-800/50'
                : 'text-slate-400 hover:text-slate-200'
            ]"
          >
            <component :is="tab.icon" class="w-4 h-4" />
            <span>{{ tab.label }}</span>
          </button>
        </div>

        <!-- 标签页内容 -->
        <div class="p-6">
          <!-- 文档标签 -->
          <div v-if="activeTab === 'documents'">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-xl font-semibold text-white">项目文档</h2>
              <button
                @click="showDocumentModal = true"
                class="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors font-medium"
              >
                <Plus class="w-4 h-4" />
                <span>新建文档</span>
              </button>
            </div>

            <div v-if="documents.length === 0" class="text-center py-12">
              <FileText class="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p class="text-slate-400">暂无文档</p>
            </div>

            <div v-else class="space-y-3">
              <div
                v-for="doc in documents"
                :key="doc.id"
                class="border border-slate-700/50 rounded-lg p-4 hover:border-blue-500/50 hover:bg-slate-800/50 transition-all"
              >
                <div class="flex items-start justify-between">
                  <div class="flex-1 cursor-pointer" @click="viewDocument(doc.id)">
                    <div class="flex items-center space-x-3 mb-2">
                      <FileText class="w-5 h-5 text-blue-400 flex-shrink-0" />
                      <h3 class="text-lg font-semibold text-white hover:text-blue-400 transition-colors">{{ doc.title }}</h3>
                    </div>
                    <div class="text-sm text-slate-500 space-y-1">
                      <div>作者: {{ doc.author_name }} | 版本: {{ doc.version }} | {{ formatDate(doc.updated_at) }}</div>
                      <div v-if="doc.file_name" class="flex items-center space-x-2">
                        <Paperclip class="w-4 h-4" />
                        <span>{{ doc.file_name }} ({{ formatFileSize(doc.file_size) }})</span>
                      </div>
                    </div>
                  </div>
                  <div class="flex items-center space-x-2">
                    <span
                      class="px-3 py-1 text-xs rounded-full"
                      :class="getStatusClass(doc.status)"
                    >
                      {{ getStatusLabel(doc.status) }}
                    </span>
                    <button
                      v-if="doc.file_path"
                      @click="downloadFile(doc.id, doc.file_name)"
                      class="p-2 text-slate-400 hover:text-blue-400 transition-colors"
                      title="下载文件"
                    >
                      <Download class="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 任务标签 -->
          <div v-if="activeTab === 'tasks'">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-xl font-semibold text-white">项目任务</h2>
              <button
                @click="showTaskModal = true"
                class="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors font-medium"
              >
                <Plus class="w-4 h-4" />
                <span>新建任务</span>
              </button>
            </div>

            <div v-if="tasks.length === 0" class="text-center py-12">
              <CheckSquare class="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p class="text-slate-400">暂无任务</p>
            </div>

            <div v-else class="space-y-3">
              <div
                v-for="task in tasks"
                :key="task.id"
                class="border border-slate-700/50 rounded-lg p-4 hover:border-blue-500/50 hover:bg-slate-800/50 transition-all"
              >
                <div class="flex justify-between items-start">
                  <div class="flex-1">
                    <h3 class="text-lg font-semibold text-white mb-2">{{ task.title }}</h3>
                    <p class="text-slate-400 text-sm mb-3">{{ task.description }}</p>
                    <div class="text-sm text-slate-500 space-y-1">
                      <div v-if="task.assignee_name">负责人: {{ task.assignee_name }}</div>
                      <div v-if="task.due_date">截止: {{ formatDate(task.due_date) }}</div>
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
            <h2 class="text-xl font-semibold text-white mb-6">项目成员</h2>
            <div class="space-y-3">
              <div
                v-for="member in project.members"
                :key="member.id"
                class="flex justify-between items-center border border-slate-700/50 rounded-lg p-4"
              >
                <div class="flex items-center space-x-3">
                  <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <User class="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div class="font-medium text-white">{{ member.username }}</div>
                    <div class="text-sm text-slate-500">{{ member.email }}</div>
                  </div>
                </div>
                <span class="px-3 py-1 text-xs rounded-full bg-blue-500/20 text-blue-400">
                  {{ member.role }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 新建文档模态框 -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showDocumentModal" class="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div class="absolute inset-0 bg-black/50 backdrop-blur" @click="showDocumentModal = false"></div>
          <div class="relative bg-slate-800 border border-slate-700/50 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-2xl font-bold text-white">新建文档</h2>
              <button @click="showDocumentModal = false" class="text-slate-400 hover:text-slate-200">
                <X class="w-6 h-6" />
              </button>
            </div>
            <form @submit.prevent="createDocument" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-2">文档标题</label>
                <input
                  v-model="newDocument.title"
                  type="text"
                  required
                  class="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600/50 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-2">文档内容 (支持Markdown)</label>
                <textarea
                  v-model="newDocument.content"
                  rows="8"
                  class="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600/50 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-mono text-sm resize-none"
                ></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-2">上传文件 (可选)</label>
                <FileUpload @files-selected="onFilesSelected" />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-2">版本号</label>
                <input
                  v-model="newDocument.version"
                  type="text"
                  class="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600/50 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  placeholder="1.0"
                />
              </div>
              <div class="flex gap-3 pt-4">
                <button
                  type="button"
                  @click="showDocumentModal = false"
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

    <!-- 新建任务模态框 -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showTaskModal" class="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div class="absolute inset-0 bg-black/50 backdrop-blur" @click="showTaskModal = false"></div>
          <div class="relative bg-slate-800 border border-slate-700/50 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-2xl font-bold text-white">新建任务</h2>
              <button @click="showTaskModal = false" class="text-slate-400 hover:text-slate-200">
                <X class="w-6 h-6" />
              </button>
            </div>
            <form @submit.prevent="createTask" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-2">任务标题</label>
                <input
                  v-model="newTask.title"
                  type="text"
                  required
                  class="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600/50 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-2">任务描述</label>
                <textarea
                  v-model="newTask.description"
                  rows="3"
                  class="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600/50 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                ></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-2">优先级</label>
                <select
                  v-model="newTask.priority"
                  class="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600/50 text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                >
                  <option value="low">低</option>
                  <option value="medium">中</option>
                  <option value="high">高</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-2">截止日期</label>
                <input
                  v-model="newTask.due_date"
                  type="date"
                  class="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600/50 text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
              <div class="flex gap-3 pt-4">
                <button
                  type="button"
                  @click="showTaskModal = false"
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
import { useRoute, useRouter } from 'vue-router';
import api from '../services/api';
import FileUpload from '../components/FileUpload.vue';
import { Plus, FileText, CheckSquare, User, X, Loader, Download, Paperclip } from 'lucide-vue-next';

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
const selectedFile = ref<any>(null);

const tabs = [
  { id: 'documents', label: '文档', icon: FileText },
  { id: 'tasks', label: '任务', icon: CheckSquare },
  { id: 'members', label: '成员', icon: User },
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

const onFilesSelected = (files: File[]) => {
  if (files && files.length > 0) {
    selectedFile.value = files[0];
  } else {
    selectedFile.value = null;
  }
};

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
    const formData = new FormData();
    formData.append('title', newDocument.value.title);
    formData.append('content', newDocument.value.content);
    formData.append('version', newDocument.value.version);
    formData.append('project_id', projectId.toString());
    if (selectedFile.value) {
      formData.append('file', selectedFile.value);
    }

    await api.documents.create(formData);
    showDocumentModal.value = false;
    newDocument.value = { title: '', content: '', version: '1.0', project_id: projectId };
    selectedFile.value = null;
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

const downloadFile = async (id: number, fileName: string) => {
  try {
    const response = await api.documents.download(id);
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
  } catch (error) {
    console.error('Failed to download file:', error);
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN');
};

const formatFileSize = (bytes: number): string => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    draft: 'bg-slate-700/50 text-slate-400',
    published: 'bg-green-500/20 text-green-400',
  };
  return classes[status] || 'bg-slate-700/50 text-slate-400';
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

const getPriorityClass = (priority: string) => {
  const classes: Record<string, string> = {
    low: 'bg-slate-700/50 text-slate-400',
    medium: 'bg-blue-500/20 text-blue-400',
    high: 'bg-red-500/20 text-red-400',
  };
  return classes[priority] || 'bg-slate-700/50 text-slate-400';
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

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
