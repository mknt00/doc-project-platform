<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
    <div v-if="loading" class="flex justify-center items-center min-h-screen">
      <Loader class="w-8 h-8 text-blue-400 animate-spin" />
    </div>

    <div v-else-if="docData" class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- 文档头部 -->
      <div class="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-8 mb-8">
        <div class="flex justify-between items-start mb-4">
          <div>
            <h1 class="text-4xl font-bold text-white mb-2">{{ docData.title }}</h1>
            <div class="flex items-center space-x-4 text-slate-400 text-sm">
              <div class="flex items-center space-x-2">
                <User class="w-4 h-4" />
                <span>{{ docData.author_name }}</span>
              </div>
              <div class="flex items-center space-x-2">
                <Calendar class="w-4 h-4" />
                <span>{{ formatDate(docData.updated_at) }}</span>
              </div>
              <div class="flex items-center space-x-2">
                <FileText class="w-4 h-4" />
                <span>版本 {{ docData.version }}</span>
              </div>
            </div>
          </div>
          <div class="flex gap-2">
            <span
              class="px-4 py-2 rounded-full text-sm font-medium"
              :class="docData.status === 'published' ? 'bg-green-500/20 text-green-400' : 'bg-slate-700/50 text-slate-400'"
            >
              {{ docData.status === 'published' ? '已发布' : '草稿' }}
            </span>
            <button
              v-if="docData.file_path"
              @click="downloadFile"
              class="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors font-medium"
            >
              <Download class="w-4 h-4" />
              <span>下载</span>
            </button>
          </div>
        </div>

        <!-- 文件信息 -->
        <div v-if="docData.file_name" class="mt-4 p-4 rounded-lg bg-slate-700/50 border border-slate-600/50">
          <div class="flex items-center space-x-3">
            <Paperclip class="w-5 h-5 text-blue-400" />
            <div class="flex-1">
              <div class="font-medium text-white">{{ docData.file_name }}</div>
              <div class="text-sm text-slate-400">{{ formatFileSize(docData.file_size) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 文档内容 -->
      <div class="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-8 prose prose-invert max-w-none">
        <div v-html="renderedContent" class="text-slate-300 leading-relaxed"></div>
      </div>

      <!-- 返回按钮 -->
      <div class="mt-8">
        <button
          @click="goBack"
          class="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-slate-800/50 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors font-medium"
        >
          <ArrowLeft class="w-4 h-4" />
          <span>返回项目</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../services/api';
import { marked } from 'marked';
import { Loader, User, Calendar, FileText, Download, Paperclip, ArrowLeft } from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const documentId = Number(route.params.id);

const docData = ref<any>(null);
const loading = ref(true);

const renderedContent = computed(() => {
  if (!docData.value?.content) return '';
  return marked(docData.value.content);
});

const fetchDocument = async () => {
  try {
    loading.value = true;
    const response = await api.documents.getById(documentId);
    docData.value = response.data;
  } catch (error) {
    console.error('Failed to fetch document:', error);
  } finally {
    loading.value = false;
  }
};

const downloadFile = async () => {
  try {
    const response = await api.documents.download(documentId);
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = window.document.createElement('a');
    link.href = url;
    link.setAttribute('download', docData.value.file_name);
    window.document.body.appendChild(link);
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

const goBack = () => {
  router.back();
};

onMounted(() => {
  fetchDocument();
});
</script>

<style scoped>
@reference "../assets/main.css";
:deep(.prose) {
  @apply text-slate-300;
}

:deep(.prose h1) {
  @apply text-3xl font-bold mt-8 mb-4 text-white;
}

:deep(.prose h2) {
  @apply text-2xl font-bold mt-6 mb-3 text-white;
}

:deep(.prose h3) {
  @apply text-xl font-bold mt-4 mb-2 text-white;
}

:deep(.prose p) {
  @apply mb-4 leading-relaxed;
}

:deep(.prose ul),
:deep(.prose ol) {
  @apply mb-4 ml-6;
}

:deep(.prose li) {
  @apply mb-2;
}

:deep(.prose code) {
  @apply bg-slate-700/50 px-2 py-1 rounded text-blue-400 font-mono text-sm;
}

:deep(.prose pre) {
  @apply bg-slate-700/50 p-4 rounded-lg mb-4 overflow-x-auto;
}

:deep(.prose a) {
  @apply text-blue-400 hover:text-blue-300 transition-colors;
}

:deep(.prose blockquote) {
  @apply border-l-4 border-blue-500 pl-4 py-2 my-4 text-slate-400 italic;
}

:deep(.prose table) {
  @apply w-full border-collapse mb-4;
}

:deep(.prose th),
:deep(.prose td) {
  @apply border border-slate-700 px-4 py-2 text-left;
}

:deep(.prose th) {
  @apply bg-slate-700/50 font-semibold;
}
</style>
