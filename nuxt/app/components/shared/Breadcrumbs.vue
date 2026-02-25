<template>
  <nav v-if="breadcrumbs && breadcrumbs.length > 1" aria-label="Breadcrumb">
    <ol class="breadcrumb-list">
      <li v-for="(crumb, idx) in breadcrumbs" :key="crumb.id" class="breadcrumb-item">
        <NuxtLink v-if="idx < breadcrumbs.length - 1" :to="crumb.permalink">{{ crumb.title }}</NuxtLink>
        <span v-else aria-current="page">{{ crumb.title }}</span>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
interface BreadcrumbItem {
  id: string;
  title: string;
  permalink: string;
}

const props = defineProps<{ permalink: string }>();
const permalink = toRef(props, 'permalink');

const { data: breadcrumbs, error: breadcrumbsError } = await useFetch<BreadcrumbItem[]>('/api/pages/breadcrumbs', {
  query: { permalink },
});

if (import.meta.dev && breadcrumbsError.value) {
  console.error('[Breadcrumbs] Failed to fetch breadcrumbs:', breadcrumbsError.value);
}
</script>

<style scoped>
.breadcrumb-list {
  display: flex;
  gap: 0.5em;
  list-style: none;
  padding: 0;
  margin: 0;
}
.breadcrumb-item + .breadcrumb-item:before {
  content: '/';
  margin: 0 0.5em;
  color: #888;
}
</style>
