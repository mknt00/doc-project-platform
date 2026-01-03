<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- 页面头部 -->
      <div class="mb-12">
        <h1 class="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
          已发布文档
        </h1>
        <p class="text-slate-400">浏览团队共享的所有公开文档</p>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="flex justify-center py-12">
        <Loader class="w-8 h-8 text-blue-400 animate-spin" />
      </div>

      <!-- 空状态 -->
      <div v-else-if="documents.length === 0" class="text-center py-20">
        <BookOpen class="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h3 class="text-xl font-semibold text-slate-300 mb-2">暂无已发布文档</h3>
        <p class="text-slate-400">发布文档后将在此处显示</p>
      </div>

      <!-- 文档列表 -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="doc in documents"
          :key="doc.id"
          @click="viewDocument(doc.id)"
          class="group bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-6 hover:border-blue-500/50 hover:bg-slate-800/80 transition-all cursor-pointer shadow-lg hover:shadow-xl hover:shadow-blue-500/10"
        >
          <!-- 文档头部 -->
          <div class="flex justify-between items-start mb-4">
            <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center group-hover:shadow-lg transition-shadow">
              <FileText class="w-6 h-6 text-white" />
            </div>
            <div v-if="doc.file_name" class="p-2 rounded-lg bg-slate-700/50 text-blue-400" title="包含附件">
              <Paperclip class="w-4 h-4" />
            </div>
          </div>

          <!-- 文档信息 -->
          <h3 class="text-lg font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
            {{ doc.title }}
          </h3>
          <div class="flex items-center space-x-2 text-xs text-slate-500 mb-4">
            <FolderOpen class="w-3 h-3" />
            <span>{{ doc.project_name }}</span>
          </div>

          <!-- 文档元数据 -->
          <div class="space-y-2 pt-4 border-t border-slate-700/50">
            <div class="flex items-center space-x-2 text-xs text-slate-400">
              <User class="w-4 h-4" />
              <span>{{ doc.author_name }}</span>
            </div>
            <div class="flex items-center space-x-2 text-xs text-slate-400">
              <Calendar class="w-4 h-4" />
              <span>{{ formatDate(doc.published_at || doc.updated_at) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';
import { Loader, BookOpen, FileText, User, Calendar, FolderOpen, Paperclip } from 'lucide-vue-next';

const router = useRouter();
const documents = ref<any[]>([]);
const loading = ref(true);

const fetchPublishedDocuments = async () => {
  try {
    loading.value = true;
    const response = await api.documents.getPublished();
    documents.value = response.data;
  } catch (error) {
    console.error('Failed to fetch published documents:', error);
  } finally {
    loading.value = false;
  }
};

const viewDocument = (id: number) => {
  router.push(`/documents/${id}`);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN');
};

onMounted(() => {
  fetchPublishedDocuments();
});
</script>
