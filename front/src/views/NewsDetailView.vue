<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import TiptapRenderer from "@/components/common/TiptapRenderer.vue";

const route = useRoute();
const router = useRouter();

// 관리자 상태 (추후 인증 시스템/store로 교체)
const isAdmin = ref(true);

// 게시글 데이터
interface NewsPost {
  id: number;
  title: string;
  content: object;
  thumbnail: string;
  date: string;
  views: number;
  likes: number;
}

const post = ref<NewsPost | null>(null);
const isLoading = ref(true);
const error = ref<string | null>(null);

// 현재 게시글 ID
const postId = computed(() => Number(route.params.id));

// 게시글 로드
const loadPost = () => {
  isLoading.value = true;
  error.value = null;

  try {
    // TODO: 백엔드 API 연동
    // 임시: localStorage에서 불러오기
    const savedPosts: NewsPost[] = JSON.parse(localStorage.getItem("news_posts") || "[]");
    const foundPost = savedPosts.find((p) => p.id === postId.value);

    if (foundPost) {
      post.value = foundPost;
      // 조회수 증가
      foundPost.views++;
      localStorage.setItem("news_posts", JSON.stringify(savedPosts));
    } else {
      // 기본 데이터에서 찾기 (임시)
      const defaultPosts = getDefaultPosts();
      const defaultPost = defaultPosts.find((p) => p.id === postId.value);
      if (defaultPost) {
        post.value = defaultPost;
      } else {
        error.value = "게시글을 찾을 수 없습니다.";
      }
    }
  } catch (e) {
    error.value = "게시글을 불러오는 중 오류가 발생했습니다.";
    console.error(e);
  } finally {
    isLoading.value = false;
  }
};

// 임시 기본 데이터
const getDefaultPosts = (): NewsPost[] => [
  {
    id: 1,
    title: "[행사 공지] 미래세기로의 초대장 부스 안내",
    content: {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "안녕하세요 동방프로젝트 서클 공리와정리입니다.",
            },
          ],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "2026.01.26에 개최되는 미래세기로의 초대장에서 부스로 찾아뵙게 되었습니다!",
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "부스 정보" }],
        },
        {
          type: "bulletList",
          content: [
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "부스 번호: A-15" }],
                },
              ],
            },
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "판매 예정 품목: 신작 일러스트집, 기존작 재판" }],
                },
              ],
            },
          ],
        },
        {
          type: "paragraph",
          content: [{ type: "text", text: "많은 관심 부탁드립니다!" }],
        },
      ],
    },
    thumbnail: "/assets/news/hijiri.png",
    date: "2026.02.10",
    views: 128,
    likes: 24,
  },
];

// 좋아요 처리
const handleLike = () => {
  if (post.value) {
    post.value.likes++;
    // TODO: 백엔드 API로 좋아요 저장
  }
};

// 삭제 처리
const handleDelete = () => {
  if (!confirm("정말 삭제하시겠습니까?")) return;

  try {
    // TODO: 백엔드 API 연동
    const savedPosts: NewsPost[] = JSON.parse(localStorage.getItem("news_posts") || "[]");
    const filtered = savedPosts.filter((p) => p.id !== postId.value);
    localStorage.setItem("news_posts", JSON.stringify(filtered));

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

      <!-- 본문 -->
      <article class="post-content">
        <TiptapRenderer :content="post.content" />
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
  border-color: #ff6b6b;
  color: #ff6b6b;
}

.btn-like:hover {
  background: #ff6b6b;
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
