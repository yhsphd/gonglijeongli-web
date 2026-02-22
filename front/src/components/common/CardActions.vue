<script setup lang="ts">
defineEmits<{
  edit: [];
  delete: [];
}>();
</script>

<template>
  <div class="card-actions">
    <button class="btn-action btn-edit" @click.stop="$emit('edit')" title="수정">
      <FontAwesomeIcon icon="pen" />
    </button>
    <button class="btn-action btn-delete" @click.stop="$emit('delete')" title="삭제">
      <FontAwesomeIcon icon="trash" />
    </button>
  </div>
</template>

<style scoped>
.card-actions {
  position: absolute;
  top: var(--spacing-sm);
  right: var(--spacing-sm);
  display: flex;
  gap: var(--spacing-xs);
}

.btn-action {
  width: 1.5rem;
  height: 1.5rem;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: var(--color-overlay-dark);
  color: var(--color-text-inverse);
  font-size: var(--font-size-xs);
  line-height: 1;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-action.btn-edit:hover {
  background: var(--color-info);
}

.btn-action.btn-delete:hover {
  background: var(--color-danger);
}
</style>
