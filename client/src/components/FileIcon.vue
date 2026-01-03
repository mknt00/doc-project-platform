<template>
  <div
    :class="[
      'w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white text-xs flex-shrink-0',
      getIconClass(fileType)
    ]"
  >
    {{ getFileTypeLabel(fileType) }}
  </div>
</template>

<script setup lang="ts">
interface Props {
  fileType: string;
}

defineProps<Props>();

const getIconClass = (type: string): string => {
  const typeMap: Record<string, string> = {
    pdf: 'bg-red-500',
    doc: 'bg-blue-500',
    docx: 'bg-blue-500',
    xls: 'bg-green-500',
    xlsx: 'bg-green-500',
    ppt: 'bg-orange-500',
    pptx: 'bg-orange-500',
    txt: 'bg-slate-500',
    md: 'bg-slate-600',
    jpg: 'bg-purple-500',
    jpeg: 'bg-purple-500',
    png: 'bg-purple-500',
    gif: 'bg-purple-500',
    zip: 'bg-yellow-600',
    rar: 'bg-yellow-600',
  };
  return typeMap[type.toLowerCase()] || 'bg-slate-500';
};

const getFileTypeLabel = (type: string): string => {
  return type.toUpperCase().slice(0, 3);
};
</script>
