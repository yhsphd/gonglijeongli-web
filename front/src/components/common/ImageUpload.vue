<script setup lang="ts">
import { computed } from "vue";
import BaseImageSelector from "./BaseImageSelector.vue";

const props = withDefaults(
  defineProps<{
    modelValue: string;
    label?: string;
  }>(),
  {
    label: "썸네일 이미지",
  }
);

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();

// 현재 이미지가 있는지 (URL이 설정된 상태)
const hasImage = computed(() => !!props.modelValue);

const clearImage = () => {
  emit("update:modelValue", "");
};

const handleSuccess = (url: string) => {
  emit("update:modelValue", url);
};
</script>

<template>
  <div class="image-upload">
    <label class="upload-label">{{ label }}</label>

    <!-- 미리보기 -->
    <div v-if="hasImage" class="preview-container">
      <img :src="modelValue" class="preview-img" alt="썸네일 미리보기" />
      <button type="button" class="btn-remove" @click="clearImage">이미지 제거</button>
    </div>

    <!-- 파일 선택 / 공통 컴포넌트 활용 -->
    <BaseImageSelector @success="handleSuccess" :initial-url="modelValue" />
  </div>
</template>

<style scoped>
.image-upload {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.upload-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

/* 미리보기 */
.preview-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.preview-img {
  width: 100%;
  max-height: 160px;
  object-fit: cover;
  border: 1px solid var(--color-border);
  background: var(--color-bg-subtle);
}

.btn-remove {
  align-self: flex-start;
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid var(--color-border);
  background: none;
  color: var(--color-text-muted);
  font-family: var(--font-family-base);
  font-size: var(--font-size-xs);
  cursor: pointer;
  transition: all 0.2s;
}

.btn-remove:hover {
  border-color: var(--color-danger);
  color: var(--color-danger);
}
</style>
