<script setup lang="ts">
import type { NewsListItem } from "@/api/news";

defineProps<{
  item: NewsListItem;
  index: number;
  isAdmin: boolean;
  delay?: string;
}>();

const emit = defineEmits<{
  edit: [id: number];
  delete: [id: number];
}>();

const onEdit = (id: number) => emit("edit", id);
const onDelete = (id: number) => emit("delete", id);
</script>

<template>
  <tr class="master-news-table-row" :style="delay ? { '--delay': delay } : undefined">
    <td class="col-no">{{ index }}</td>
    <td class="col-thumb">
      <div class="thumb-wrapper">
        <img v-if="item.thumbnail" :src="item.thumbnail" :alt="item.title" class="thumb" />
      </div>
    </td>
    <td class="col-title">
      <RouterLink :to="{ name: 'news-detail', params: { id: item.id } }" class="title-link">
        {{ item.title }}
      </RouterLink>
    </td>
    <td class="col-views">{{ item.views }}</td>
    <td class="col-likes">{{ item.likes }}</td>
    <td class="col-date">{{ item.date }}</td>
    <td class="col-admin" v-if="isAdmin">
      <div class="admin-actions">
        <button class="btn-action btn-edit" @click="onEdit(item.id)" title="수정">
          <FontAwesomeIcon icon="pen" />
        </button>
        <button class="btn-action btn-delete" @click="onDelete(item.id)" title="삭제">
          <FontAwesomeIcon icon="trash" />
        </button>
      </div>
    </td>
  </tr>
</template>

<style scoped>
.master-news-table-row td {
  line-height: 1;
  border-bottom: 1px solid var(--color-border);
}

.master-news-table-row {
  transition: background 0.2s ease;
}

.master-news-table-row:hover {
  background: var(--color-bg-subtle);
}

.col-no {
  width: 3.5rem;
  text-align: center;
  color: var(--color-text-secondary);
  padding-left: var(--spacing-xs);
  padding-right: var(--spacing-xs);
  white-space: nowrap;
}

.col-title {
  padding: var(--spacing-md);
  text-align: left;
  min-width: 12rem;
}

.col-thumb {
  padding: var(--spacing-xs);
  width: 4.5rem;
}

.thumb-wrapper {
  width: 3.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-subtle);
  border-radius: var(--radius-xs);
  overflow: hidden;
}

.thumb {
  max-width: 100%;
  max-height: 100%;
  object-fit: cover;
}

.col-views,
.col-likes {
  width: 4rem;
  text-align: center;
  color: var(--color-text-secondary);
  padding-left: var(--spacing-xs);
  padding-right: var(--spacing-xs);
  white-space: nowrap;
}

.col-date {
  width: 6rem;
  text-align: center;
  color: var(--color-text-secondary);
  padding-left: var(--spacing-xs);
  padding-right: var(--spacing-xs);
  white-space: nowrap;
}

.col-admin {
  width: 5rem;
  text-align: center;
  padding-left: var(--spacing-xs);
  padding-right: var(--spacing-xs);
}

.admin-actions {
  display: flex;
  justify-content: center;
  gap: var(--spacing-xs);
}

.btn-action {
  width: 1.75rem;
  height: 1.75rem;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--color-border);
  background: var(--color-bg-primary);
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  cursor: pointer;
  transition: all 0.2s;
}

.btn-action.btn-edit:hover {
  border-color: var(--color-info);
  background: var(--color-info);
  color: var(--color-text-inverse);
}

.btn-action.btn-delete:hover {
  border-color: var(--color-danger);
  background: var(--color-danger);
  color: var(--color-text-inverse);
}

.title-link {
  color: var(--color-text-primary);
  text-decoration: none;
  transition: color 0.2s;
}

.title-link:hover {
  color: var(--color-text-secondary);
  text-decoration: underline;
}

@media (max-width: 768px) {
  .col-no,
  .col-views,
  .col-likes {
    display: none;
  }

  .col-date {
    width: 5rem;
    font-size: var(--font-size-xs);
  }
}

@media (max-width: 480px) {
  .col-thumb {
    display: none;
  }
}
</style>
