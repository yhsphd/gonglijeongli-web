<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import PageHeader from "@/components/common/PageHeader.vue";
import AppPagination from "@/components/common/AppPagination.vue";
import NewsTableRow from "@/components/news/NewsTableRow.vue";
import { useAuthStore } from "@/stores/auth";
import { fetchNewsList, deleteNews, type NewsListItem } from "@/api/news";

const router = useRouter();
const route = useRoute();

const authStore = useAuthStore();
const isAdmin = computed(() => authStore.isAdmin);

const newsItems = ref<NewsListItem[]>([]);
const totalItems = ref(0);
const isLoading = ref(false);

const currentPage = ref(1);
const itemsPerPage = 10;

// 파라미터에서 초기 페이지 설정 (옵션)
onMounted(() => {
  if (route.query.page) {
    currentPage.value = parseInt(route.query.page as string) || 1;
  }
  loadPosts();
});

// 최초 Router 진입 여부 (staggered fade-in 여부 결정)
const isFirstLoad = ref(true);
// 페이지 전환 중 tbody 전체 fade 제어
const isPageTransitioning = ref(false);
const PAGE_FADE_DURATION = 250; // ms
const ENTER_BASE_DURATION = 400; // ms
const ENTER_STEP_DELAY = 30; // ms
let firstLoadTimer: ReturnType<typeof setTimeout> | null = null;

const finishFirstLoadAfterStagger = () => {
  const visibleCount = Math.min(newsItems.value.length, itemsPerPage);
  const timeout = ENTER_BASE_DURATION + visibleCount * ENTER_STEP_DELAY;
  if (firstLoadTimer) {
    clearTimeout(firstLoadTimer);
  }
  firstLoadTimer = setTimeout(() => {
    isFirstLoad.value = false;
    firstLoadTimer = null;
  }, timeout);
};

const loadPosts = async (isPageChange = false) => {
  if (isPageChange) {
    // 기존 데이터는 유지한 채 tbody를 opacity 0으로 페이드 아웃
    // (배열을 비우지 않으므로 테이블 높이가 유지되어 Pagination이 움직이지 않음)
    isPageTransitioning.value = true;
    await new Promise((resolve) => setTimeout(resolve, PAGE_FADE_DURATION));
  }
  isLoading.value = true;
  try {
    const data = await fetchNewsList(currentPage.value, itemsPerPage);
    newsItems.value = data.items;
    totalItems.value = data.total;
    renderPage.value = currentPage.value; // 데이터 연동이 됨과 동시에 가상 번호 계산 기준 페이지 업데이트
    if (!isPageChange && isFirstLoad.value) {
      finishFirstLoadAfterStagger();
    }
  } catch (error) {
    console.error("뉴스 목록 로드 실패:", error);
  } finally {
    isLoading.value = false;
    isPageTransitioning.value = false; // opacity 1로 복귀 (새 데이터가 반영된 상태로 fade-in)
  }
};

onBeforeUnmount(() => {
  if (firstLoadTimer) {
    clearTimeout(firstLoadTimer);
  }
});

watch(currentPage, () => {
  // 페이지 변경시 라우터 쿼리 업데이트
  router.replace({ query: { ...route.query, page: currentPage.value } });
  loadPosts(true);
});

const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage));

// 로딩 완료된 현재 데이터를 기준으로 사용할 렌더링용 페이지 변수
const renderPage = ref(currentPage.value);

// 가상 번호 계산기 (데이터 세팅 완료 후의 기준으로 번호 계산)
const getRowNumber = (index: number) => {
  return totalItems.value - (renderPage.value - 1) * itemsPerPage - index;
};

// 관리자 기능
const handleWrite = () => {
  router.push({ name: "news-write" });
};

const handleEdit = (id: number) => {
  router.push({ name: "news-write", query: { edit: id } });
};

const handleDelete = async (id: number) => {
  if (confirm("정말 삭제하시겠습니까?")) {
    try {
      await deleteNews(id);
      await loadPosts(); // 리스트 갱신
    } catch (error) {
      console.error("뉴스 삭제 실패:", error);
      alert("삭제에 실패했습니다. 관리자 로그인 상태를 확인해주세요.");
    }
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
        <TransitionGroup
          name="list"
          tag="tbody"
          :appear="isFirstLoad"
          :css="isFirstLoad"
          :class="{ 'page-transitioning': isPageTransitioning }"
        >
          <NewsTableRow
            v-for="(item, index) in newsItems"
            :key="item.id"
            :item="item"
            :index="getRowNumber(index)"
            :is-admin="isAdmin"
            :delay="isFirstLoad ? `${index * 0.03}s` : undefined"
            @edit="handleEdit"
            @delete="handleDelete"
          />
        </TransitionGroup>
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

.news-table th {
  padding: var(--spacing-md);
  line-height: 0;
}

.news-table thead th {
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  border-bottom: 1px solid var(--color-text-primary);
  white-space: nowrap;
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

.col-thumb {
  width: 4.5rem;
}

.col-title {
  min-width: 12rem;
}

.col-views,
.col-likes {
  width: 4rem;
  text-align: center;
  padding-left: var(--spacing-xs);
  padding-right: var(--spacing-xs);
  white-space: nowrap;
}

.col-date {
  width: 6rem;
  text-align: center;
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

/* Responsive */
@media (max-width: 768px) {
  .news-table th.col-no,
  .news-table th.col-views,
  .news-table th.col-likes {
    display: none;
  }

}

@media (max-width: 480px) {
  .news-table th.col-thumb {
    display: none;
  }
}

/* ── tbody 레벨: 페이지 전환 시 전체 일괄 fade-out/in ─────────────────
 * 기존 데이터를 유지한 채 opacity만 0으로 낮추므로 테이블 높이가 보존됨
 * → Pagination 널뛰기 없음
 */
.news-table tbody {
  transition: opacity 0.25s ease;
}

.news-table tbody.page-transitioning {
  opacity: 0;
}

/* ── tr 레벨: Router 최초 진입 시 staggered fade-in ──────────────────
 * .news-table tbody tr { transition: background } (명시도 0,1,3) 을
 * tr.list-enter-active (명시도 0,1,4) 로 덮어씀
 * 구분선(border-bottom)은 td에 있지만 tr 전체 opacity가 내려가므로 함께 페이드됨
 */
.news-table tbody tr.master-news-table-row.list-enter-active {
  transition: opacity 0.4s ease;
  transition-delay: var(--delay);
}

.news-table tbody tr.master-news-table-row.list-enter-from {
  opacity: 0;
}

/* 페이지 전환 중에는 일반 tbody opacity만 사용 */
</style>
