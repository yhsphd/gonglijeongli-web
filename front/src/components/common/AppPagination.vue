<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  currentPage: number;
  totalPages: number;
  maxVisible?: number;
}>();

const emit = defineEmits<{
  "update:currentPage": [value: number];
}>();

const maxVisiblePages = computed(() => props.maxVisible ?? 5);

const pageNumbers = computed(() => {
  const pages: number[] = [];
  let start = Math.max(1, props.currentPage - Math.floor(maxVisiblePages.value / 2));
  const end = Math.min(props.totalPages, start + maxVisiblePages.value - 1);

  if (end - start + 1 < maxVisiblePages.value) {
    start = Math.max(1, end - maxVisiblePages.value + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  return pages;
});

const goToPage = (page: number) => {
  if (page >= 1 && page <= props.totalPages) {
    emit("update:currentPage", page);
  }
};
</script>

<template>
  <nav class="pagination-wrapper">
    <div class="pagination-left">
      <slot name="left" />
    </div>
    <div class="pagination" v-if="totalPages > 1">
      <button class="page-btn" :disabled="currentPage === 1" @click="goToPage(1)">&laquo;</button>
      <button class="page-btn" :disabled="currentPage === 1" @click="goToPage(currentPage - 1)">
        &lsaquo;
      </button>
      <button
        v-for="page in pageNumbers"
        :key="page"
        class="page-btn"
        :class="{ active: page === currentPage }"
        @click="goToPage(page)"
      >
        {{ page }}
      </button>
      <button
        class="page-btn"
        :disabled="currentPage === totalPages"
        @click="goToPage(currentPage + 1)"
      >
        &rsaquo;
      </button>
      <button class="page-btn" :disabled="currentPage === totalPages" @click="goToPage(totalPages)">
        &raquo;
      </button>
    </div>
    <div class="pagination-right">
      <slot name="right" />
    </div>
  </nav>
</template>

<style scoped>
.pagination-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--spacing-lg) 0;
}

.pagination-left,
.pagination-right {
  flex: 1;
  display: flex;
}

.pagination-left {
  justify-content: flex-start;
}

.pagination-right {
  justify-content: flex-end;
}

.pagination {
  display: flex;
  gap: var(--spacing-xs);
}

.page-btn {
  min-width: 2rem;
  height: 2rem;
  padding: 0 var(--spacing-sm);
  border: 1px solid var(--color-border);
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  font-family: var(--font-family-base);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  background: var(--color-bg-subtle);
}

.page-btn:disabled {
  color: var(--color-text-muted);
  cursor: not-allowed;
}

.page-btn.active {
  background: var(--color-text-primary);
  color: var(--color-text-inverse);
  border-color: var(--color-text-primary);
}
</style>
