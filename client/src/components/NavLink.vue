<template>
  <router-link
    :to="to"
    :class="[
      'inline-flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors text-sm font-medium',
      isActive
        ? 'bg-slate-800 text-blue-400'
        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
    ]"
  >
    <component :is="iconComponent" class="w-4 h-4" />
    <span>{{ label }}</span>
  </router-link>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import * as LucideIcons from 'lucide-vue-next';

interface Props {
  to: string;
  icon: string;
  label: string;
}

const props = defineProps<Props>();
const route = useRoute();

const isActive = computed(() => {
  return route.path === props.to || route.path.startsWith(props.to + '/');
});

const iconComponent = computed(() => {
  return (LucideIcons as any)[props.icon] || null;
});
</script>
