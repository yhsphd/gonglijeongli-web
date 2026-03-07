<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import TiptapEditor from "@/components/common/TiptapEditor.vue";
import { createNews, updateNews, fetchNewsDetail } from "@/api/news";

const router = useRouter();
const route = useRoute();

const editId = ref<number | null>(null);

// 폼 데이터
const title = ref("");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const content = ref<any>({
  type: "doc",
  content: [{ type: "paragraph" }],
});
const thumbnail = ref("");

// 초기 데이터 로드 (수정 모드일 경우)
onMounted(async () => {
  if (route.query.edit) {
    const id = parseInt(route.query.edit as string);
    if (!isNaN(id)) {
      editId.value = id;
      try {
        const data = await fetchNewsDetail(id);
        title.value = data.title;
        thumbnail.value = data.thumbnail || "";
        // content가 string이면 JSON으로 파싱 시도
        if (data.content) {
          try {
            content.value =
              typeof data.content === "string" ? JSON.parse(data.content) : data.content;
          } catch (e) {
            // 파싱 실패시 텍스트로 취급할 수도 있으나, 본 서비스에서는 Tiptap JSON 구조라고 가정
            console.error("Content parsing error", e);
          }
        }
      } catch (error) {
        console.error("뉴스 상세 로드 실패:", error);
        alert("글 정보를 불러오는데 실패했습니다.");
        router.push({ name: "news" });
      }
    }
  }
});

// 저장 처리
const isSubmitting = ref(false);

const handleSubmit = async () => {
  if (!title.value.trim()) {
    alert("제목을 입력해주세요.");
    return;
  }

  isSubmitting.value = true;

  try {
    const todayStr = new Date().toISOString().split("T")[0];
    const dateFormatted = todayStr ? todayStr.replace(/-/g, ".") : "";

    const postData = {
      title: title.value,
      content: content.value,
      thumbnail: thumbnail.value || null,
      date: dateFormatted,
    };

    if (editId.value) {
      await updateNews(editId.value, postData);
      alert("글이 수정되었습니다.");
    } else {
      await createNews(postData);
      alert("글이 작성되었습니다.");
    }

    router.push({ name: "news" });
  } catch (error) {
    console.error("저장 실패:", error);
    alert("저장에 실패했습니다.");
  } finally {
    isSubmitting.value = false;
  }
};

const handleCancel = () => {
  if (
    title.value.trim() ||
    JSON.stringify(content.value) !== '{"type":"doc","content":[{"type":"paragraph"}]}'
  ) {
    if (!confirm("작성 중인 내용이 있습니다. 정말 취소하시겠습니까?")) {
      return;
    }
  }
  router.push({ name: "news" });
};
</script>

<template>
  <div class="master-news-write-view">
    <header class="page-header">
      <h1>{{ editId ? "글 수정" : "글쓰기" }}</h1>
    </header>

    <form class="write-form" @submit.prevent="handleSubmit">
      <!-- 제목 입력 -->
      <div class="form-group">
        <label for="title" class="form-label">제목</label>
        <input
          id="title"
          v-model="title"
          type="text"
          class="form-input"
          placeholder="제목을 입력하세요"
          maxlength="100"
        />
      </div>

      <!-- 썸네일 URL -->
      <div class="form-group">
        <label for="thumbnail" class="form-label">썸네일 이미지 URL (선택)</label>
        <input
          id="thumbnail"
          v-model="thumbnail"
          type="text"
          class="form-input"
          placeholder="/assets/news/example.png"
        />
      </div>

      <!-- 에디터 -->
      <div class="form-group">
        <label class="form-label">내용</label>
        <TiptapEditor v-model="content" placeholder="내용을 입력하세요..." />
      </div>

      <!-- 버튼 -->
      <div class="form-actions">
        <button type="button" class="btn btn-cancel" @click="handleCancel">취소</button>
        <button type="submit" class="btn btn-submit" :disabled="isSubmitting">
          {{ isSubmitting ? "저장 중..." : "저장" }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.master-news-write-view {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.page-header h1 {
  margin: 0;
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.write-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.form-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.form-input {
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-family: var(--font-family-base);
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-text-primary);
}

.form-input::placeholder {
  color: var(--color-text-muted);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-border);
}

.btn {
  padding: var(--spacing-sm) var(--spacing-xl);
  border: 1px solid var(--color-border);
  font-family: var(--font-family-base);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel {
  background: var(--color-bg-primary);
  color: var(--color-text-secondary);
}

.btn-cancel:hover {
  background: var(--color-bg-subtle);
}

.btn-submit {
  background: var(--color-text-primary);
  color: var(--color-text-inverse);
  border-color: var(--color-text-primary);
}

.btn-submit:hover:not(:disabled) {
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
