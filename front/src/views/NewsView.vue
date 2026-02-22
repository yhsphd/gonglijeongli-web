<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import PageHeader from "@/components/common/PageHeader.vue";
import AppPagination from "@/components/common/AppPagination.vue";

const router = useRouter();

// 관리자 상태 (추후 인증 시스템/store로 교체)
const isAdmin = ref(true); // 테스트용 true, 실제로는 false

// 기본 데이터 (백엔드 없을 때 사용)
const defaultPosts = [
  {
    id: 1,
    title: "[행사 공지] 미래세기로의 초대장 부스 안내",
    date: "2026.02.10",
    thumb: "/assets/news/hijiri.png",
    views: 128,
    likes: 24,
  },
  {
    id: 2,
    title: "[신작 안내] 동방 팬북 '경계의 저편' 발매",
    date: "2026.02.05",
    thumb: "/assets/news/hijiri.png",
    views: 256,
    likes: 45,
  },
  {
    id: 3,
    title: "[통판 안내] 겨울 신작 통신판매 시작",
    date: "2026.01.28",
    thumb: "/assets/news/hijiri.png",
    views: 189,
    likes: 32,
  },
  {
    id: 4,
    title: "[행사 공지] 코믹월드 서울 참가 안내",
    date: "2026.01.15",
    thumb: "/assets/news/hijiri.png",
    views: 312,
    likes: 58,
  },
  {
    id: 5,
    title: "[공지] 2026년 활동 계획 안내",
    date: "2026.01.01",
    thumb: "/assets/news/hijiri.png",
    views: 421,
    likes: 73,
  },
  {
    id: 6,
    title: "[행사 후기] 코믹마켓 C105 참가 후기",
    date: "2025.12.31",
    thumb: "/assets/news/hijiri.png",
    views: 534,
    likes: 89,
  },
  {
    id: 7,
    title: "[신작 안내] 동방 일러스트집 예약 안내",
    date: "2025.12.20",
    thumb: "/assets/news/hijiri.png",
    views: 287,
    likes: 41,
  },
  {
    id: 8,
    title: "[통판 안내] 여름 신작 통신판매 종료 안내",
    date: "2025.12.10",
    thumb: "/assets/news/hijiri.png",
    views: 156,
    likes: 19,
  },
  {
    id: 9,
    title: "[행사 공지] 코믹마켓 C105 참가 안내",
    date: "2025.11.25",
    thumb: "/assets/news/hijiri.png",
    views: 478,
    likes: 67,
  },
  {
    id: 10,
    title: "[공지] 서클 홈페이지 오픈",
    date: "2025.11.01",
    thumb: "/assets/news/hijiri.png",
    views: 623,
    likes: 102,
  },
  {
    id: 11,
    title: "[행사 후기] 가을 온리전 참가 후기",
    date: "2025.10.20",
    thumb: "/assets/news/hijiri.png",
    views: 345,
    likes: 52,
  },
  {
    id: 12,
    title: "[신작 안내] 가을 신작 안내",
    date: "2025.10.01",
    thumb: "/assets/news/hijiri.png",
    views: 267,
    likes: 38,
  },
];

// 뉴스 아이템 (localStorage + 기본 데이터 병합)
const newsItems = ref<
  Array<{
    id: number;
    title: string;
    date: string;
    thumb?: string;
    thumbnail?: string;
    views: number;
    likes: number;
  }>
>([]);

// 데이터 로드
const loadPosts = () => {
  const savedPosts = JSON.parse(localStorage.getItem("news_posts") || "[]");
  // localStorage 데이터를 먼저, 그 다음 기본 데이터
  newsItems.value = [...savedPosts, ...defaultPosts];
};

onMounted(() => {
  loadPosts();
});

// 페이지네이션
const currentPage = ref(1);
const itemsPerPage = 10;

const totalPages = computed(() => Math.ceil(newsItems.value.length / itemsPerPage));

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return newsItems.value.slice(start, end);
});

// 관리자 기능
const handleWrite = () => {
  router.push({ name: "news-write" });
};

const handleEdit = (id: number) => {
  router.push({ name: "news-write", query: { edit: id } });
};

const handleDelete = (id: number) => {
  if (confirm("정말 삭제하시겠습니까?")) {
    // localStorage에서도 삭제
    const savedPosts = JSON.parse(localStorage.getItem("news_posts") || "[]");
    const filteredSaved = savedPosts.filter((item: { id: number }) => item.id !== id);
    localStorage.setItem("news_posts", JSON.stringify(filteredSaved));

    // 화면에서도 삭제
    newsItems.value = newsItems.value.filter((item) => item.id !== id);
  }
};
</script>

<template>
  <div class="master-news-view">
    <PageHeader
      title="소식"
      description="동방 프로젝트 서클 공리와정리의 공지사항 및 소식을 전해드립니다."
    />

    <div class="news-table-wrapper">
      <table class="news-table">
        <thead>
          <tr>
            <th class="col-no">번호</th>
            <th class="col-thumb"></th>
            <th class="col-title">제목</th>
            <th class="col-views">조회수</th>
            <th class="col-likes">좋아요</th>
            <th class="col-date">작성일</th>
            <th class="col-admin" v-if="isAdmin">관리</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in paginatedItems" :key="item.id" class="news-row">
            <td class="col-no">{{ item.id }}</td>
            <td class="col-thumb">
              <div class="thumb-wrapper">
                <img :src="item.thumb || item.thumbnail" :alt="item.title" class="thumb" />
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
                <button class="btn-action btn-edit" @click="handleEdit(item.id)" title="수정">
                  <FontAwesomeIcon icon="pen" />
                </button>
                <button class="btn-action btn-delete" @click="handleDelete(item.id)" title="삭제">
                  <FontAwesomeIcon icon="trash" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <AppPagination v-model:current-page="currentPage" :total-pages="totalPages">
      <template #right>
        <button v-if="isAdmin" class="btn-write" @click="handleWrite">글쓰기</button>
      </template>
    </AppPagination>
  </div>
</template>

<style scoped>
.master-news-view {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

/* Admin Toolbar */
.btn-write {
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-text-primary);
  background: var(--color-text-primary);
  color: var(--color-text-inverse);
  font-family: var(--font-family-base);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all 0.2s;
}

.btn-write:hover {
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
}

/* Table */
.news-table-wrapper {
  width: 100%;
  overflow-x: auto;
}

.news-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--font-size-sm);
}

.news-table th,
.news-table td {
  padding: var(--spacing-md);
  line-height: 1;
  /* text-align: left; */
  border-bottom: 1px solid var(--color-border);
}

.news-table th {
  line-height: 0;
}

.news-table thead th {
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  border-bottom: 1px solid var(--color-text-primary);
}

.news-table tbody tr {
  transition: background 0.2s ease;
}

.news-table tbody tr:hover {
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
  text-align: left;
}

.news-table .col-thumb {
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

.col-title {
  min-width: 12rem;
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

/* Responsive */
@media (max-width: 768px) {
  .col-no,
  .col-views,
  .col-likes {
    display: none;
  }

  .news-table th.col-no,
  .news-table td.col-no,
  .news-table th.col-views,
  .news-table td.col-views,
  .news-table th.col-likes,
  .news-table td.col-likes {
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

  .news-table th.col-thumb,
  .news-table td.col-thumb {
    display: none;
  }
}
</style>
