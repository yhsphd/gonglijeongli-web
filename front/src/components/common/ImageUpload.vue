<script setup lang="ts">
import { ref, computed } from "vue";
import { uploadFile } from "@/api/client";

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

// 탭: "upload" | "url"
const activeTab = ref<"upload" | "url">("upload");

const fileInputRef = ref<HTMLInputElement | null>(null);
const isUploading = ref(false);
const errorMessage = ref("");

// URL 입력 모드용 임시 상태
const urlInput = ref(props.modelValue);

// 현재 이미지가 있는지 (URL이 설정된 상태)
const hasImage = computed(() => !!props.modelValue);

const switchTab = (tab: "upload" | "url") => {
  activeTab.value = tab;
  errorMessage.value = "";
  if (tab === "url") {
    urlInput.value = props.modelValue;
  }
};

// ── 파일 업로드 탭 ──

const triggerFileInput = () => {
  errorMessage.value = "";
  fileInputRef.value?.click();
};

const handleFileChange = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  isUploading.value = true;
  errorMessage.value = "";

  try {
    const { url } = await uploadFile(file);
    emit("update:modelValue", url);
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "업로드에 실패했습니다.";
  } finally {
    isUploading.value = false;
    input.value = "";
  }
};

// ── URL 입력 탭 ──

const applyUrl = () => {
  const trimmed = urlInput.value.trim();
  emit("update:modelValue", trimmed);
  errorMessage.value = "";
};

// ── 공통 ──

const clearImage = () => {
  emit("update:modelValue", "");
  urlInput.value = "";
  errorMessage.value = "";
};
</script>

<template>
  <div class="image-upload">
    <label class="upload-label">{{ label }}</label>

    <!-- 미리보기 -->
    <div v-if="hasImage" class="preview-container">
      <img :src="modelValue" class="preview-img" alt="썸네일 미리보기" />
      <button type="button" class="btn-remove" :disabled="isUploading" @click="clearImage">
        이미지 제거
      </button>
    </div>

    <!-- 탭 전환 -->
    <div class="tab-bar">
      <button
        type="button"
        class="tab-btn"
        :class="{ active: activeTab === 'upload' }"
        @click="switchTab('upload')"
      >
        파일 업로드
      </button>
      <button
        type="button"
        class="tab-btn"
        :class="{ active: activeTab === 'url' }"
        @click="switchTab('url')"
      >
        URL 직접 입력
      </button>
    </div>

    <!-- 파일 업로드 탭 -->
    <div v-if="activeTab === 'upload'" class="tab-content">
      <input
        ref="fileInputRef"
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        class="file-input"
        @change="handleFileChange"
      />
      <button type="button" class="btn-select" :disabled="isUploading" @click="triggerFileInput">
        <span v-if="isUploading" class="spinner" />
        <span>{{ isUploading ? "업로드 중..." : hasImage ? "이미지 교체" : "이미지 선택" }}</span>
      </button>
      <span class="upload-hint">JPG, PNG, WEBP, GIF (최대 5MB)</span>
    </div>

    <!-- URL 입력 탭 -->
    <div v-if="activeTab === 'url'" class="tab-content">
      <div class="url-row">
        <input
          v-model="urlInput"
          type="text"
          class="url-input"
          placeholder="https://example.com/image.jpg 또는 /assets/thumb.png"
          @keydown.enter.prevent="applyUrl"
        />
        <button type="button" class="btn-apply" @click="applyUrl">적용</button>
      </div>
    </div>

    <!-- 에러 메시지 -->
    <p v-if="errorMessage" class="error-msg">{{ errorMessage }}</p>
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

.btn-remove:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 탭 바 */
.tab-bar {
  display: flex;
  border-bottom: 1px solid var(--color-border);
  margin-top: var(--spacing-xs);
}

.tab-btn {
  padding: var(--spacing-xs) var(--spacing-sm);
  border: none;
  border-bottom: 2px solid transparent;
  background: none;
  color: var(--color-text-muted);
  font-family: var(--font-family-base);
  font-size: var(--font-size-xs);
  cursor: pointer;
  transition: all 0.15s;
  margin-bottom: -1px;
}

.tab-btn:hover {
  color: var(--color-text-secondary);
}

.tab-btn.active {
  color: var(--color-text-primary);
  border-bottom-color: var(--color-text-primary);
  font-weight: var(--font-weight-bold);
}

/* 탭 콘텐츠 */
.tab-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding-top: var(--spacing-xs);
}

/* 파일 업로드 탭 */
.file-input {
  display: none;
}

.btn-select {
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

.btn-select:hover:not(:disabled) {
  border-color: var(--color-text-primary);
  background: var(--color-bg-subtle);
}

.btn-select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.upload-hint {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

/* URL 입력 탭 */
.url-row {
  display: flex;
  gap: var(--spacing-xs);
  width: 100%;
}

.url-input {
  flex: 1;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-border);
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  font-family: var(--font-family-base);
  font-size: var(--font-size-sm);
  min-width: 0;
}

.url-input:focus {
  outline: none;
  border-color: var(--color-text-primary);
}

.url-input::placeholder {
  color: var(--color-text-muted);
}

.btn-apply {
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-text-primary);
  background: var(--color-text-primary);
  color: var(--color-text-inverse);
  font-family: var(--font-family-base);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-apply:hover {
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
}

/* 로딩 스피너 */
.spinner {
  display: inline-block;
  width: 0.875rem;
  height: 0.875rem;
  border: 2px solid var(--color-border);
  border-top-color: var(--color-text-primary);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 에러 메시지 */
.error-msg {
  margin: 0;
  font-size: var(--font-size-xs);
  color: var(--color-danger);
}
</style>
