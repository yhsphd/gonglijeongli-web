<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import PageHeader from "@/components/common/PageHeader.vue";
import AppPagination from "@/components/common/AppPagination.vue";
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

const loadPosts = async () => {
  isLoading.value = true;
  try {
    const data = await fetchNewsList(currentPage.value, itemsPerPage);
    newsItems.value = data.items;
    totalItems.value = data.total;
    renderPage.value = currentPage.value; // 데이터 연동이 됨과 동시에 가상 번호 계산 기준 페이지 업데이트
  } catch (error) {
    console.error("뉴스 목록 로드 실패:", error);
  } finally {
    isLoading.value = false;
  }
};

watch(currentPage, () => {
  // 페이지 변경시 라우터 쿼리 업데이트
  router.replace({ query: { ...route.query, page: currentPage.value } });
  loadPosts();
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
        <tbody>
          <tr v-for="(item, index) in newsItems" :key="item.id" class="news-row">
            <td class="col-no">{{ getRowNumber(index) }}</td>
            <td class="col-thumb">
              <div class="thumb-wrapper">
                <img v-if="item.thumbnail" :src="item.thumbnail" :alt="item.title" class="thumb" />
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
