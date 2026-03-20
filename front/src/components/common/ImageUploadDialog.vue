<script setup lang="ts">
import { ref } from "vue";
import { uploadFile } from "@/api/client";
import type { Editor } from "@tiptap/vue-3";

const props = defineProps<{
  modelValue: boolean;
  editor: Editor | null;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
}>();

// 탭 상태
const imageDialogTab = ref<"upload" | "url">("upload");
const imageUrlInput = ref("");
const imageFileInput = ref<HTMLInputElement | null>(null);
const isImageUploading = ref(false);
const imageUploadError = ref("");

const closeDialog = () => {
  emit("update:modelValue", false);
};

const insertImageUrl = (url: string) => {
  if (!url.trim() || !props.editor) return;

  props.editor.chain().focus().setImage({ src: url.trim() }).run();
  closeDialog();
  imageUrlInput.value = "";
};

const handleImageFileChange = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file || !props.editor) return;

  isImageUploading.value = true;
  imageUploadError.value = "";

  try {
    const { url } = await uploadFile(file);
    insertImageUrl(url);
  } catch (error) {
    imageUploadError.value =
      error instanceof Error ? error.message : "업로드에 실패했습니다.";
  } finally {
    isImageUploading.value = false;
    input.value = "";
  }
};

const triggerFileInput = () => {
  imageFileInput?.value?.click();
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

        <!-- 탭 -->
        <div class="img-dialog-tabs">
          <button
            type="button"
            class="img-tab-btn"
            :class="{ active: imageDialogTab === 'upload' }"
            @click="imageDialogTab = 'upload'; imageUploadError = ''"
          >파일 업로드</button>
          <button
            type="button"
            class="img-tab-btn"
            :class="{ active: imageDialogTab === 'url' }"
            @click="imageDialogTab = 'url'; imageUploadError = ''"
          >URL 입력</button>
        </div>

        <!-- 파일 업로드 탭 -->
        <div v-if="imageDialogTab === 'upload'" class="img-dialog-body">
          <input
            ref="imageFileInput"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            class="img-file-input"
            @change="handleImageFileChange"
          />
          <button
            type="button"
            class="img-btn-select"
            :disabled="isImageUploading"
            @click="triggerFileInput"
          >
            <span v-if="isImageUploading" class="img-spinner" />
            {{ isImageUploading ? '업로드 중...' : '파일 선택' }}
          </button>
          <span class="img-hint">JPG, PNG, WEBP, GIF (최대 5MB)</span>
        </div>

        <!-- URL 입력 탭 -->
        <div v-if="imageDialogTab === 'url'" class="img-dialog-body">
          <div class="img-url-row">
            <input
              v-model="imageUrlInput"
              type="text"
              class="img-url-input"
              placeholder="https://example.com/image.jpg"
              @keydown.enter.prevent="insertImageUrl(imageUrlInput)"
            />
            <button type="button" class="img-btn-apply" @click="insertImageUrl(imageUrlInput)">
              삽입
            </button>
          </div>
        </div>

        <!-- 에러 -->
        <p v-if="imageUploadError" class="img-error">{{ imageUploadError }}</p>
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

.img-dialog-tabs {
  display: flex;
  border-bottom: 1px solid var(--color-border);
}

.img-tab-btn {
  padding: var(--spacing-xs) var(--spacing-sm);
  border: none;
  border-bottom: 2px solid transparent;
  background: none;
  color: var(--color-text-muted);
  font-family: var(--font-family-base);
  font-size: var(--font-size-xs);
  cursor: pointer;
  margin-bottom: -1px;
  transition: all 0.15s;
}

.img-tab-btn.active {
  color: var(--color-text-primary);
  border-bottom-color: var(--color-text-primary);
  font-weight: var(--font-weight-bold);
}

.img-dialog-body {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding-top: var(--spacing-xs);
}

.img-file-input {
  display: none;
}

.img-btn-select {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-border);
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  font-family: var(--font-family-base);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.img-btn-select:hover:not(:disabled) {
  border-color: var(--color-text-primary);
}

.img-btn-select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.img-hint {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.img-url-row {
  display: flex;
  gap: var(--spacing-xs);
  width: 100%;
}

.img-url-input {
  flex: 1;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-border);
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  font-family: var(--font-family-base);
  font-size: var(--font-size-sm);
  min-width: 0;
}

.img-url-input:focus {
  outline: none;
  border-color: var(--color-text-primary);
}

.img-url-input::placeholder {
  color: var(--color-text-muted);
}

.img-btn-apply {
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-text-primary);
  background: var(--color-text-primary);
  color: var(--color-text-inverse);
  font-family: var(--font-family-base);
  font-size: var(--font-size-sm);
  cursor: pointer;
  white-space: nowrap;
}

.img-btn-apply:hover {
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
}

.img-spinner {
  display: inline-block;
  width: 0.75rem;
  height: 0.75rem;
  border: 2px solid var(--color-border);
  border-top-color: var(--color-text-primary);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.img-error {
  margin: 0;
  font-size: var(--font-size-xs);
  color: var(--color-danger);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
