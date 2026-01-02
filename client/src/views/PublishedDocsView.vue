<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold text-gray-800 mb-8">已发布文档</h1>

    <div v-if="loading" class="text-center py-12">
      <div class="text-gray-500">加载中...</div>
    </div>

    <div v-else-if="documents.length === 0" class="text-center py-12">
      <div class="text-gray-500">暂无已发布文档</div>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="doc in documents"
        :key="doc.id"
        class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer"
        @click="viewDocument(doc.id)"
      >
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <h3 class="text-xl font-semibold text-gray-800 mb-2">{{ doc.title }}</h3>
            <div class="text-sm text-gray-600 space-y-1">
              <div>项目: {{ doc.project_name }}</div>
              <div>作者: {{ doc.author_name }}</div>
              <div>版本: {{ doc.version }}</div>
              <div>发布时间: {{ formatDate(doc.published_at) }}</div>
            </div>
          </div>
          <span class="px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800">
            已发布
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';

const router = useRouter();
const documents = ref<any[]>([]);
const loading = ref(true);

const fetchDocuments = async () => {
  try {
    loading.value = true;
    const response = await api.documents.getPublished();
    documents.value = response.data;
  } catch (error) {
    console.error('Failed to fetch documents:', error);
  } finally {
    loading.value = false;
  }
};

const viewDocument = (id: number) => {
  router.push(`/documents/${id}`);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN');
};

onMounted(() => {
  fetchDocuments();
});
</script>
