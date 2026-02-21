<script setup lang="ts">
import { ref, computed, onMounted } from "vue";

// 작품 타입 정의
interface WorkItem {
  id: number;
  title: string;
  description?: string;
  date: string;
  thumb?: string;
  link?: string;
  tags: string[];
}

// 관리자 상태 (추후 인증 시스템/store로 교체)
const isAdmin = ref(true); // 테스트용 true, 실제로는 false

// 사용 가능한 태그 목록
const availableTags = ["동방", "회지", "일러스트북", "만화", "엽서", "스티커", "아크릴", "기타"];

// 기본 데이터 (백엔드 없을 때 사용)
const defaultWorks: WorkItem[] = [
  {
    id: 1,
    title: "경계의 저편",
    description: "동방 팬북 - 환상향의 경계를 넘어선 이야기",
    date: "2026.02",
    thumb: "/assets/events/illustar10.png",
    tags: ["동방", "일러스트북"],
  },
  {
    id: 2,
    title: "환상향 일러스트 컬렉션",
    description: "동방 프로젝트 캐릭터 일러스트 모음집",
    date: "2025.12",
    thumb: "/assets/events/illustar10.png",
    tags: ["동방", "일러스트북"],
  },
  {
    id: 3,
    title: "공리와정리 회지 Vol.3",
    description: "서클 정기 회지 제3호",
    date: "2025.08",
    thumb: "/assets/events/illustar10.png",
    tags: ["회지"],
  },
  {
    id: 4,
    title: "레이무 & 마리사 아크릴 스탠드",
    description: "동방 프로젝트 아크릴 굿즈 세트",
    date: "2025.08",
    thumb: "/assets/events/illustar10.png",
    tags: ["동방", "아크릴"],
  },
  {
    id: 5,
    title: "환상향 엽서 세트",
    description: "동방 캐릭터 일러스트 엽서 12종",
    date: "2025.05",
    thumb: "/assets/events/illustar10.png",
    tags: ["동방", "엽서"],
  },
  {
    id: 6,
    title: "요정대전쟁 만화",
    description: "동방 요정대전쟁 팬 만화",
    date: "2025.02",
    thumb: "/assets/events/illustar10.png",
    tags: ["동방", "만화"],
  },
  {
    id: 7,
    title: "캐릭터 스티커팩",
    description: "동방 캐릭터 스티커 20종 세트",
    date: "2024.12",
    thumb: "/assets/events/illustar10.png",
    tags: ["동방", "스티커"],
  },
  {
    id: 8,
    title: "공리와정리 회지 Vol.2",
    description: "서클 정기 회지 제2호",
    date: "2024.08",
    thumb: "/assets/events/illustar10.png",
    tags: ["회지"],
  },
  {
    id: 9,
    title: "사쿠야 아크릴 키링",
    description: "이자요이 사쿠야 아크릴 키링",
    date: "2024.05",
    thumb: "/assets/events/illustar10.png",
    tags: ["동방", "아크릴"],
  },
];

// 작품 아이템 (localStorage + 기본 데이터 병합)
const workItems = ref<WorkItem[]>([]);

// 선택된 태그 필터
const selectedTags = ref<string[]>([]);

// 모달 관련 상태
const showModal = ref(false);
const isEditMode = ref(false);
const editingWorkId = ref<number | null>(null);

// 폼 데이터
const formData = ref({
  title: "",
  description: "",
  date: "",
  thumb: "",
  link: "",
  tags: [] as string[],
});

const resetForm = () => {
  formData.value = {
    title: "",
    description: "",
    date: "",
    thumb: "",
    link: "",
    tags: [],
  };
  isEditMode.value = false;
  editingWorkId.value = null;
};

// 데이터 로드
const loadWorks = () => {
  const savedWorks = JSON.parse(localStorage.getItem("work_posts") || "[]");
  workItems.value = [...savedWorks, ...defaultWorks];
};

onMounted(() => {
  loadWorks();
});

// 필터링된 아이템
const filteredItems = computed(() => {
  if (selectedTags.value.length === 0) {
    return workItems.value;
  }
  return workItems.value.filter((item) =>
    selectedTags.value.some((tag) => item.tags.includes(tag))
  );
});

// 페이지네이션
const currentPage = ref(1);
const itemsPerPage = 9;

const totalPages = computed(() => Math.ceil(filteredItems.value.length / itemsPerPage));

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredItems.value.slice(start, end);
});

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

// 페이지 번호 배열 생성 (최대 5개 표시)
const pageNumbers = computed(() => {
  const pages: number[] = [];
  const maxVisible = 5;
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2));
  const end = Math.min(totalPages.value, start + maxVisible - 1);

  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  return pages;
});

// 태그 토글
const toggleTag = (tag: string) => {
  const index = selectedTags.value.indexOf(tag);
  if (index === -1) {
    selectedTags.value.push(tag);
  } else {
    selectedTags.value.splice(index, 1);
  }
  currentPage.value = 1; // 필터 변경 시 첫 페이지로 이동
};

const clearTags = () => {
  selectedTags.value = [];
  currentPage.value = 1;
};

// 관리자 기능 - 모달 열기
const openAddModal = () => {
  resetForm();
  showModal.value = true;
};

const openEditModal = (work: WorkItem) => {
  isEditMode.value = true;
  editingWorkId.value = work.id;
  formData.value = {
    title: work.title,
    description: work.description || "",
    date: work.date,
    thumb: work.thumb || "",
    link: work.link || "",
    tags: [...work.tags],
  };
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  resetForm();
};

// 폼 태그 토글
const toggleFormTag = (tag: string) => {
  const index = formData.value.tags.indexOf(tag);
  if (index === -1) {
    formData.value.tags.push(tag);
  } else {
    formData.value.tags.splice(index, 1);
  }
};

// 작품 저장 (추가/수정)
const handleSave = () => {
  const savedWorks = JSON.parse(localStorage.getItem("work_posts") || "[]");

  if (isEditMode.value && editingWorkId.value !== null) {
    // 수정 모드
    const index = workItems.value.findIndex((item) => item.id === editingWorkId.value);
    if (index !== -1) {
      workItems.value[index] = {
        id: editingWorkId.value,
        title: formData.value.title,
        description: formData.value.description,
        date: formData.value.date,
        thumb: formData.value.thumb,
        link: formData.value.link,
        tags: formData.value.tags,
      };
      // localStorage 업데이트
      const savedIndex = savedWorks.findIndex((item: WorkItem) => item.id === editingWorkId.value);
      if (savedIndex !== -1) {
        savedWorks[savedIndex] = workItems.value[index];
        localStorage.setItem("work_posts", JSON.stringify(savedWorks));
      }
    }
  } else {
    // 추가 모드
    const newId = Date.now();
    const newWork: WorkItem = {
      id: newId,
      title: formData.value.title,
      description: formData.value.description,
      date: formData.value.date,
      thumb: formData.value.thumb,
      link: formData.value.link,
      tags: formData.value.tags,
    };
    savedWorks.unshift(newWork);
    localStorage.setItem("work_posts", JSON.stringify(savedWorks));
    workItems.value.unshift(newWork);
  }

  closeModal();
};

const handleDelete = (id: number) => {
  if (confirm("정말 삭제하시겠습니까?")) {
    const savedWorks = JSON.parse(localStorage.getItem("work_posts") || "[]");
    const filteredSaved = savedWorks.filter((item: { id: number }) => item.id !== id);
    localStorage.setItem("work_posts", JSON.stringify(filteredSaved));
    workItems.value = workItems.value.filter((item) => item.id !== id);
  }
};

// 카드 클릭 시 링크 이동
const handleCardClick = (work: WorkItem) => {
  if (work.link) {
    window.open(work.link, "_blank");
  }
};
</script>

<template>
  <div class="master-works-view">
    <header class="page-header">
      <h1>작품</h1>
      <p class="description">동방 프로젝트 서클 공리와정리의 동인지 및 굿즈를 소개합니다.</p>
    </header>

    <!-- 태그 필터 -->
    <div class="tag-filter">
      <div class="tag-list">
        <button
          v-for="tag in availableTags"
          :key="tag"
          class="tag-btn"
          :class="{ active: selectedTags.includes(tag) }"
          @click="toggleTag(tag)"
        >
          {{ tag }}
        </button>
      </div>
      <button v-if="selectedTags.length > 0" class="btn-clear" @click="clearTags">
        필터 초기화
      </button>
    </div>

    <!-- 작품 그리드 -->
    <div class="works-grid">
      <article
        v-for="work in paginatedItems"
        :key="work.id"
        class="work-card"
        :class="{ 'has-link': !!work.link }"
        @click="handleCardClick(work)"
      >
        <div class="card-thumb">
          <img :src="work.thumb" :alt="work.title" class="thumb-img" />
          <div v-if="isAdmin" class="card-actions">
            <button class="btn-action-card btn-edit" @click.stop="openEditModal(work)" title="수정">
              <FontAwesomeIcon icon="pen" />
            </button>
            <button
              class="btn-action-card btn-delete"
              @click.stop="handleDelete(work.id)"
              title="삭제"
            >
              <FontAwesomeIcon icon="trash" />
            </button>
          </div>
        </div>
        <div class="card-content">
          <div class="card-tags">
            <span v-for="tag in work.tags" :key="tag" class="tag">{{ tag }}</span>
          </div>
          <h3 class="card-title">{{ work.title }}</h3>
          <p v-if="work.description" class="card-description">{{ work.description }}</p>
          <p class="card-date">{{ work.date }}</p>
        </div>
      </article>
    </div>

    <!-- 결과 없음 -->
    <div v-if="filteredItems.length === 0" class="no-results">
      <p>선택한 태그에 해당하는 작품이 없습니다.</p>
    </div>

    <!-- Pagination -->
    <nav class="pagination-wrapper" v-if="filteredItems.length > 0">
      <div class="pagination-left"></div>
      <div class="pagination" v-if="totalPages > 1">
        <button class="page-btn" :disabled="currentPage === 1" @click="goToPage(1)">&laquo;</button>
        <button class="page-btn" :disabled="currentPage === 1" @click="goToPage(currentPage - 1)">
          &lsaquo;
        </button>
        <button
          v-for="page in pageNumbers"
          :key="page"
          class="page-btn"
          :class="{ active: page === currentPage }"
          @click="goToPage(page)"
        >
          {{ page }}
        </button>
        <button
          class="page-btn"
          :disabled="currentPage === totalPages"
          @click="goToPage(currentPage + 1)"
        >
          &rsaquo;
        </button>
        <button
          class="page-btn"
          :disabled="currentPage === totalPages"
          @click="goToPage(totalPages)"
        >
          &raquo;
        </button>
      </div>
      <div class="pagination-right">
        <button v-if="isAdmin" class="btn-write" @click="openAddModal">작품 추가</button>
      </div>
    </nav>

    <!-- 작품 추가/수정 모달 -->
    <Teleport to="body">
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content">
          <header class="modal-header">
            <h2>{{ isEditMode ? "작품 수정" : "작품 추가" }}</h2>
            <button class="btn-close" @click="closeModal">
              <FontAwesomeIcon icon="xmark" />
            </button>
          </header>
          <form class="modal-body" @submit.prevent="handleSave">
            <div class="form-group">
              <label for="title">작품명 *</label>
              <input
                id="title"
                v-model="formData.title"
                type="text"
                placeholder="작품명을 입력하세요"
                required
              />
            </div>
            <div class="form-group">
              <label for="description">설명</label>
              <input
                id="description"
                v-model="formData.description"
                type="text"
                placeholder="작품에 대한 간단한 설명"
              />
            </div>
            <div class="form-group">
              <label for="date">발행일 *</label>
              <input
                id="date"
                v-model="formData.date"
                type="text"
                placeholder="예: 2026.02"
                required
              />
            </div>
            <div class="form-group">
              <label for="thumb">썸네일 URL</label>
              <input
                id="thumb"
                v-model="formData.thumb"
                type="text"
                placeholder="/assets/works/example.png"
              />
            </div>
            <div class="form-group">
              <label for="link">연결 링크</label>
              <input
                id="link"
                v-model="formData.link"
                type="text"
                placeholder="https://example.com/work"
              />
            </div>
            <div class="form-group">
              <label>태그 *</label>
              <div class="form-tags">
                <button
                  v-for="tag in availableTags"
                  :key="tag"
                  type="button"
                  class="form-tag-btn"
                  :class="{ active: formData.tags.includes(tag) }"
                  @click="toggleFormTag(tag)"
                >
                  {{ tag }}
                </button>
              </div>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn-cancel" @click="closeModal">취소</button>
              <button type="submit" class="btn-submit">{{ isEditMode ? "수정" : "추가" }}</button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.master-works-view {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.page-header h1 {
  margin: 0 0 var(--spacing-sm);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.page-header .description {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

/* Tag Filter */
.tag-filter {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.tag-list {
  display: flex;
  gap: var(--spacing-xs);
  flex-wrap: wrap;
}

.tag-btn {
  padding: var(--spacing-xs) var(--spacing-md);
  border: 1px solid var(--color-border);
  background: var(--color-bg-primary);
  color: var(--color-text-secondary);
  font-family: var(--font-family-base);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all 0.2s;
}

.tag-btn:hover {
  border-color: var(--color-text-primary);
  color: var(--color-text-primary);
}

.tag-btn.active {
  background: var(--color-text-primary);
  color: var(--color-text-inverse);
  border-color: var(--color-text-primary);
}

.btn-clear {
  padding: var(--spacing-xs) var(--spacing-sm);
  border: none;
  background: none;
  color: var(--color-text-muted);
  font-family: var(--font-family-base);
  font-size: var(--font-size-xs);
  cursor: pointer;
  text-decoration: underline;
}

.btn-clear:hover {
  color: var(--color-text-secondary);
}

/* Works Grid */
.works-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-xl);
}

/* Work Card */
.work-card {
  display: flex;
  flex-direction: column;
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  overflow: hidden;
  transition: all 0.3s ease;
}

.work-card.has-link {
  cursor: pointer;
}

.work-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

/* Card Thumbnail */
.card-thumb {
  position: relative;
  aspect-ratio: 1 / 1.2;
  overflow: hidden;
  background: var(--color-bg-subtle);
}

.thumb-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: transform 0.3s ease;
}

.work-card:hover .thumb-img {
  transform: scale(1.05);
}

.card-actions {
  position: absolute;
  top: var(--spacing-sm);
  right: var(--spacing-sm);
  display: flex;
  gap: var(--spacing-xs);
  opacity: 0;
  transition: opacity 0.2s;
}

.work-card:hover .card-actions {
  opacity: 1;
}

.btn-action-card {
  width: 1.5rem;
  height: 1.5rem;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: rgba(0, 0, 0, 0.5);
  color: var(--color-text-inverse);
  font-size: var(--font-size-xs);
  line-height: 1;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-action-card.btn-edit:hover {
  background: #2563eb;
}

.btn-action-card.btn-delete:hover {
  background: var(--color-danger);
}

/* Card Content */
.card-content {
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.card-tags {
  display: flex;
  gap: var(--spacing-xs);
  flex-wrap: wrap;
}

.tag {
  padding: 2px var(--spacing-xs);
  background: var(--color-bg-subtle);
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
}

.card-title {
  margin: 0;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  line-height: var(--line-height-snug);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-description {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-date {
  margin: 0;
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

/* No Results */
.no-results {
  text-align: center;
  padding: var(--spacing-2xl);
  color: var(--color-text-muted);
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

/* Pagination */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--spacing-lg) 0;
}

.pagination-left,
.pagination-right {
  flex: 1;
  display: flex;
}

.pagination-left {
  justify-content: flex-start;
}

.pagination-right {
  justify-content: flex-end;
}

.pagination {
  display: flex;
  gap: var(--spacing-xs);
}

.page-btn {
  min-width: 2rem;
  height: 2rem;
  padding: 0 var(--spacing-sm);
  border: 1px solid var(--color-border);
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  font-family: var(--font-family-base);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  background: var(--color-bg-subtle);
}

.page-btn:disabled {
  color: var(--color-text-muted);
  cursor: not-allowed;
}

.page-btn.active {
  background: var(--color-text-primary);
  color: var(--color-text-inverse);
  border-color: var(--color-text-primary);
}

/* Responsive */
@media (max-width: 768px) {
  .works-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-md);
  }
}

@media (max-width: 480px) {
  .works-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }

  .tag-filter {
    flex-direction: column;
    align-items: flex-start;
  }
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000000;
}

.modal-content {
  background: var(--color-bg-primary);
  width: 100%;
  max-width: 28rem;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid var(--color-border);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--color-border);
}

.modal-header h2 {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
}

.btn-close {
  width: 2rem;
  height: 2rem;
  padding: 0;
  border: none;
  background: none;
  font-size: var(--font-size-lg);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: color 0.2s;
}

.btn-close:hover {
  color: var(--color-text-primary);
}

.modal-body {
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.form-group label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.form-group input,
.form-group select {
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-border);
  background: var(--color-bg-primary);
  font-family: var(--font-family-base);
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--color-text-primary);
}

.form-tags {
  display: flex;
  gap: var(--spacing-xs);
  flex-wrap: wrap;
}

.form-tag-btn {
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid var(--color-border);
  background: var(--color-bg-primary);
  color: var(--color-text-secondary);
  font-family: var(--font-family-base);
  font-size: var(--font-size-xs);
  cursor: pointer;
  transition: all 0.2s;
}

.form-tag-btn:hover {
  border-color: var(--color-text-primary);
}

.form-tag-btn.active {
  background: var(--color-text-primary);
  color: var(--color-text-inverse);
  border-color: var(--color-text-primary);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-border);
}

.btn-cancel,
.btn-submit {
  padding: var(--spacing-sm) var(--spacing-lg);
  border: 1px solid var(--color-border);
  font-family: var(--font-family-base);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel {
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
}

.btn-cancel:hover {
  background: var(--color-bg-subtle);
}

.btn-submit {
  background: var(--color-text-primary);
  color: var(--color-text-inverse);
  border-color: var(--color-text-primary);
}

.btn-submit:hover {
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
}
</style>
