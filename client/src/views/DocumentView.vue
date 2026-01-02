<template>
  <div class="container mx-auto px-4 py-8">
    <div v-if="loading" class="text-center py-12">
      <div class="text-gray-500">加载中...</div>
    </div>

    <div v-else-if="document" class="max-w-4xl mx-auto">
      <div class="bg-white rounded-lg shadow-md p-8">
        <!-- 文档头部 -->
        <div class="border-b border-gray-200 pb-6 mb-6">
          <div class="flex justify-between items-start mb-4">
            <h1 class="text-3xl font-bold text-gray-800">{{ document.title }}</h1>
            <span
              class="px-4 py-2 rounded-full text-sm font-medium"
              :class="document.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
            >
              {{ document.status === 'published' ? '已发布' : '草稿' }}
            </span>
          </div>

          <div class="flex flex-wrap gap-4 text-sm text-gray-600">
            <div>作者: {{ document.author_name }}</div>
            <div>项目: {{ document.project_name }}</div>
            <div>版本: {{ document.version }}</div>
            <div>更新时间: {{ formatDate(document.updated_at) }}</div>
          </div>

          <div class="mt-4 flex gap-3">
            <button
              v-if="document.status === 'draft'"
              @click="publishDocument"
              class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              发布文档
            </button>
            <button
              @click="editDocument"
              class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              编辑文档
            </button>
            <button
              @click="goBack"
              class="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
            >
              返回
            </button>
          </div>
        </div>

        <!-- 文档内容 -->
        <div class="prose max-w-none" v-html="document.html_content"></div>
      </div>
    </div>

    <!-- 编辑模态框 -->
    <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 class="text-2xl font-bold mb-6">编辑文档</h2>
        <form @submit.prevent="updateDocument" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">文档标题</label>
            <input
              v-model="editForm.title"
              type="text"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">文档内容 (支持Markdown)</label>
            <textarea
              v-model="editForm.content"
              rows="16"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            ></textarea>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">版本号</label>
              <input
                v-model="editForm.version"
                type="text"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">状态</label>
              <select
                v-model="editForm.status"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="draft">草稿</option>
                <option value="published">已发布</option>
              </select>
            </div>
          </div>
          <div class="flex gap-4">
            <button
              type="button"
              @click="showEditModal = false"
              class="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300"
            >
              取消
            </button>
            <button
              type="submit"
              class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
            >
              保存
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
const documentId = Number(route.params.id);

const document = ref<any>(null);
const loading = ref(true);
const showEditModal = ref(false);
const editForm = ref({
  title: '',
  content: '',
  version: '',
  status: 'draft',
});

const fetchDocument = async () => {
  try {
    loading.value = true;
    const response = await api.documents.getById(documentId);
    document.value = response.data;
    editForm.value = {
      title: document.value.title,
      content: document.value.content,
      version: document.value.version,
      status: document.value.status,
    };
  } catch (error) {
    console.error('Failed to fetch document:', error);
  } finally {
    loading.value = false;
  }
};

const editDocument = () => {
  showEditModal.value = true;
};

const updateDocument = async () => {
  try {
    await api.documents.update(documentId, editForm.value);
    showEditModal.value = false;
    await fetchDocument();
  } catch (error) {
    console.error('Failed to update document:', error);
  }
};

const publishDocument = async () => {
  try {
    await api.documents.publish(documentId);
    await fetchDocument();
  } catch (error) {
    console.error('Failed to publish document:', error);
  }
};

const goBack = () => {
  router.back();
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN');
};

onMounted(() => {
  fetchDocument();
});
</script>

<style scoped>
.prose {
  @apply text-gray-800 leading-relaxed;
}

.prose :deep(h1) {
  @apply text-3xl font-bold mt-8 mb-4;
}

.prose :deep(h2) {
  @apply text-2xl font-bold mt-6 mb-3;
}

.prose :deep(h3) {
  @apply text-xl font-bold mt-4 mb-2;
}

.prose :deep(p) {
  @apply mb-4;
}

.prose :deep(ul), .prose :deep(ol) {
  @apply ml-6 mb-4;
}

.prose :deep(li) {
  @apply mb-2;
}

.prose :deep(code) {
  @apply bg-gray-100 px-2 py-1 rounded text-sm font-mono;
}

.prose :deep(pre) {
  @apply bg-gray-100 p-4 rounded overflow-x-auto mb-4;
}

.prose :deep(blockquote) {
  @apply border-l-4 border-gray-300 pl-4 italic my-4;
}

.prose :deep(a) {
  @apply text-blue-600 hover:underline;
}
</style>
