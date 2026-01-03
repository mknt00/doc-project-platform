<template>
  <div class="w-full">
    <!-- 拖放区域 -->
    <div
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
      :class="[
        'border-2 border-dashed rounded-lg p-8 text-center transition-all',
        isDragging
          ? 'border-blue-500 bg-blue-500/10'
          : 'border-slate-600 bg-slate-800/50 hover:border-slate-500'
      ]"
    >
      <Upload class="w-12 h-12 mx-auto mb-3" :class="isDragging ? 'text-blue-400' : 'text-slate-400'" />
      <p class="text-slate-300 font-medium mb-1">拖放文件到此处</p>
      <p class="text-slate-500 text-sm mb-4">或点击下方按钮选择文件</p>
      <label class="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors cursor-pointer font-medium">
        <FileUp class="w-4 h-4" />
        <span>选择文件</span>
        <input
          type="file"
          multiple
          class="hidden"
          @change="handleFileSelect"
          :accept="acceptedFormats.join(',')"
        />
      </label>
      <p class="text-slate-500 text-xs mt-4">
        支持格式: {{ acceptedFormatsDisplay }}
      </p>
    </div>

    <!-- 文件列表 -->
    <div v-if="selectedFiles.length > 0" class="mt-6 space-y-3">
      <h3 class="text-sm font-semibold text-slate-300">已选择文件:</h3>
      <div
        v-for="(file, index) in selectedFiles"
        :key="index"
        class="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700/50"
      >
        <div class="flex items-center space-x-3 flex-1">
          <FileIcon :file-type="getFileType(file.name)" />
          <div class="flex-1 min-w-0">
            <p class="text-slate-300 font-medium truncate">{{ file.name }}</p>
            <p class="text-slate-500 text-xs">{{ formatFileSize(file.size) }}</p>
          </div>
        </div>
        <button
          @click="removeFile(index)"
          class="text-slate-400 hover:text-red-400 transition-colors p-2"
        >
          <X class="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Upload, FileUp, X } from 'lucide-vue-next';
import FileIcon from './FileIcon.vue';

interface Props {
  acceptedFormats?: string[];
}

const props = withDefaults(defineProps<Props>(), {
  acceptedFormats: () => [
    '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
    '.txt', '.md', '.jpg', '.jpeg', '.png', '.gif', '.zip', '.rar'
  ]
});

const emit = defineEmits<{
  filesSelected: [files: File[]];
}>();

const isDragging = ref(false);
const selectedFiles = ref<File[]>([]);

const acceptedFormatsDisplay = props.acceptedFormats.join(', ');

const handleDrop = (e: DragEvent) => {
  isDragging.value = false;
  const files = e.dataTransfer?.files;
  if (files) {
    handleFiles(Array.from(files));
  }
};

const handleFileSelect = (e: Event) => {
  const input = e.target as HTMLInputElement;
  if (input.files) {
    handleFiles(Array.from(input.files));
  }
};

const handleFiles = (files: File[]) => {
  selectedFiles.value = [...selectedFiles.value, ...files];
  emit('filesSelected', selectedFiles.value);
};

const removeFile = (index: number) => {
  selectedFiles.value.splice(index, 1);
  emit('filesSelected', selectedFiles.value);
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

const getFileType = (fileName: string): string => {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  return ext;
};
</script>
