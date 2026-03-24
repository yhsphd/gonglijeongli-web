<script setup lang="ts">
import { ref, watch } from "vue";
import { uploadFile } from "@/api/client";

const props = withDefaults(
  defineProps<{
    initialUrl?: string;
  }>(),
  {
    initialUrl: "",
  }
);

const emit = defineEmits<{
  (e: "success", url: string): void;
}>();

const activeTab = ref<"upload" | "url">("upload");
const isUploading = ref(false);
const errorMessage = ref("");
const urlInput = ref(props.initialUrl);
const fileInputRef = ref<HTMLInputElement | null>(null);

watch(
  () => props.initialUrl,
  (newUrl) => {
    urlInput.value = newUrl;
  }
);

const switchTab = (tab: "upload" | "url") => {
  activeTab.value = tab;
  errorMessage.value = "";
  if (tab === "url") {
    urlInput.value = props.initialUrl;
  }
};

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
    emit("success", url);
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "업로드에 실패했습니다.";
  } finally {
    isUploading.value = false;
    input.value = "";
  }
};

const applyUrl = () => {
  const trimmed = urlInput.value.trim();
  if (trimmed) {
    emit("success", trimmed);
  }
  errorMessage.value = "";
};
</script>

<template>
  <div class="base-image-selector">
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
        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
        class="file-input"
        @change="handleFileChange"
      />
      <button type="button" class="btn-select" :disabled="isUploading" @click="triggerFileInput">
        <span v-if="isUploading" class="spinner" />
        <span>{{ isUploading ? "업로드 중..." : "이미지 선택" }}</span>
      </button>
      <span class="upload-hint">JPG, PNG, WEBP, GIF, SVG (최대 5MB)</span>
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
.base-image-selector {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

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

.tab-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding-top: var(--spacing-xs);
}

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

.error-msg {
  margin: 0;
  font-size: var(--font-size-xs);
  color: var(--color-danger);
}
</style>
