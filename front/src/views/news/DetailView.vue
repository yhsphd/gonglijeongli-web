<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import TiptapRenderer from "@/components/common/TiptapRenderer.vue";
import { useAuthStore } from "@/stores/auth";
import { fetchNewsDetail, deleteNews, type NewsItem } from "@/api/news";

const route = useRoute();
const router = useRouter();

const authStore = useAuthStore();
const isAdmin = computed(() => authStore.isAdmin);

// 화면에 렌더링하기 위해 파싱된 상태의 타입을 정의합니다.
interface ParsedNewsItem extends Omit<NewsItem, "content"> {
  content: Record<string, unknown> | string;
}

const post = ref<ParsedNewsItem | null>(null);
const isLoading = ref(true);
const error = ref<string | null>(null);

// 현재 게시글 ID
const postId = computed(() => Number(route.params.id));

// 게시글 로드
const loadPost = async () => {
  isLoading.value = true;
  error.value = null;

  try {
    const data = await fetchNewsDetail(postId.value);

    // content가 string이면 Tiptap JSON으로 파싱
    let parsedContent: Record<string, unknown> | string = data.content;
    if (typeof data.content === "string") {
      try {
        parsedContent = JSON.parse(data.content);
      } catch (e) {
        console.error("Content format error", e);
      }
    }

    post.value = { ...data, content: parsedContent };
  } catch (e) {
    error.value = "게시글을 불러오는 중 오류가 발생했습니다.";
    console.error(e);
  } finally {
    isLoading.value = false;
  }
};

// 좋아요 처리
const handleLike = () => {
  if (post.value) {
    // API 연결 시 별도의 좋아요 API가 있다면 호출 필요 (현재는 낙관적 UI 업데이트 또는 무시)
    // post.value.likes++;
    alert("좋아요 기능은 준비 중입니다!");
  }
};

// 삭제 처리
const handleDelete = async () => {
  if (!confirm("정말 삭제하시겠습니까?")) return;

  try {
    await deleteNews(postId.value);
    alert("삭제되었습니다.");
    router.push({ name: "news" });
  } catch (e) {
    alert("삭제에 실패했습니다.");
    console.error(e);
  }
};

// 목록으로 돌아가기
const goBack = () => {
  router.push({ name: "news" });
};

onMounted(() => {
  loadPost();
});
</script>

<template>
  <div class="master-news-detail-view">
    <!-- 로딩 상태 -->
    <div v-if="isLoading" class="loading">게시글을 불러오는 중...</div>

    <!-- 에러 상태 -->
    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
      <button class="btn" @click="goBack">목록으로 돌아가기</button>
    </div>

    <!-- 게시글 표시 -->
    <template v-else-if="post">
      <!-- 헤더 -->
      <header class="post-header">
        <h1 class="post-title">{{ post.title }}</h1>
        <div class="post-meta">
          <span class="meta-date">{{ post.date }}</span>
          <span class="meta-separator">|</span>
          <span class="meta-views">조회 {{ post.views }}</span>
          <span class="meta-separator">|</span>
          <span class="meta-likes">좋아요 {{ post.likes }}</span>
        </div>
      </header>

      <!-- 썸네일 -->
      <div class="post-thumbnail" v-if="post.thumbnail">
        <img :src="post.thumbnail" :alt="post.title" />
      </div>

      <article class="post-content">
        <TiptapRenderer :content="post.content as Record<string, unknown>" />
      </article>

      <!-- 하단 액션 -->
      <div class="post-actions">
        <div class="actions-left">
          <button class="btn btn-like" @click="handleLike">❤️ 좋아요 {{ post.likes }}</button>
        </div>
        <div class="actions-right">
          <button v-if="isAdmin" class="btn btn-delete" @click="handleDelete">삭제</button>
          <button class="btn btn-list" @click="goBack">목록</button>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.master-news-detail-view {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.loading,
.error {
  text-align: center;
  padding: var(--spacing-2xl);
  color: var(--color-text-secondary);
}

.error .btn {
  margin-top: var(--spacing-md);
}

/* Header */
.post-header {
  border-bottom: 1px solid var(--color-border);
  padding-bottom: var(--spacing-md);
}

.post-title {
  margin: 0 0 var(--spacing-sm);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  line-height: var(--line-height-snug);
}

.post-meta {
  display: flex;
  gap: var(--spacing-sm);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.meta-separator {
  color: var(--color-text-muted);
}

/* Thumbnail */
.post-thumbnail {
  max-width: 100%;
  text-align: center;
}

.post-thumbnail img {
  max-width: 100%;
  max-height: 25rem;
  object-fit: contain;
  border-radius: var(--radius-sm);
}

/* Content */
.post-content {
  min-height: 10rem;
  line-height: var(--line-height-normal);
}

/* Actions */
.post-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-border);
}

.actions-left,
.actions-right {
  display: flex;
  gap: var(--spacing-sm);
}

.btn {
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-border);
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  font-family: var(--font-family-base);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all 0.2s;
}

.btn:hover {
  background: var(--color-bg-subtle);
}

.btn-like {
  border-color: var(--color-like);
  color: var(--color-like);
}

.btn-like:hover {
  background: var(--color-like);
  color: var(--color-text-inverse);
}

.btn-delete {
  border-color: var(--color-danger);
  color: var(--color-danger);
}

.btn-delete:hover {
  background: var(--color-danger);
  color: var(--color-text-inverse);
}

.btn-list {
  background: var(--color-text-primary);
  color: var(--color-text-inverse);
  border-color: var(--color-text-primary);
}

.btn-list:hover {
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
}
</style>
