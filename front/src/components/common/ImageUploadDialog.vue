<script setup lang="ts">
import type { Editor } from "@tiptap/vue-3";
import BaseImageSelector from "./BaseImageSelector.vue";

const props = defineProps<{
  modelValue: boolean;
  editor: Editor | null;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
}>();

const closeDialog = () => {
  emit("update:modelValue", false);
};

const insertImageUrl = (url: string) => {
  if (!url.trim() || !props.editor) return;

  props.editor.chain().focus().setImage({ src: url.trim() }).run();
  closeDialog();
};
</script>

<template>
  <!-- 이미지 삽입 다이얼로그 -->
  <Teleport to="body">
    <div v-if="modelValue" class="img-dialog-overlay" @click.self="closeDialog">
      <div class="img-dialog">
        <div class="img-dialog-header">
          <span>이미지 삽입</span>
          <button type="button" class="img-dialog-close" @click="closeDialog">✕</button>
        </div>

        <BaseImageSelector @success="insertImageUrl" />
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.img-dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.img-dialog {
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  padding: var(--spacing-md);
  width: 420px;
  max-width: 90vw;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.img-dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.img-dialog-close {
  border: none;
  background: none;
  color: var(--color-text-muted);
  font-size: var(--font-size-base);
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.img-dialog-close:hover {
  color: var(--color-text-primary);
}
</style>
