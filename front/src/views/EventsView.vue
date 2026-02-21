<script setup lang="ts">
import { ref, computed, onMounted } from "vue";

// 이벤트 타입 정의
interface EventItem {
  id: number;
  title: string;
  date: string;
  location: string;
  thumb?: string;
  thumbnail?: string;
  link?: string;
  status: "upcoming" | "ongoing" | "ended";
}

// 관리자 상태 (추후 인증 시스템/store로 교체)
const isAdmin = ref(true); // 테스트용 true, 실제로는 false

// 기본 데이터 (백엔드 없을 때 사용)
const defaultEvents = [
  {
    id: 1,
    title: "미래세기로의 초대장",
    date: "2026.03.15",
    location: "킨텍스 제1전시장",
    thumb: "/assets/events/illustar10.png",
    status: "upcoming" as const,
  },
  {
    id: 2,
    title: "코믹마켓 C106",
    date: "2026.08.13 ~ 2026.08.14",
    location: "도쿄 빅사이트",
    thumb: "/assets/events/illustar10.png",
    status: "upcoming" as const,
  },
  {
    id: 3,
    title: "코믹월드 서울 2026",
    date: "2026.02.22 ~ 2026.02.23",
    location: "aT센터",
    thumb: "/assets/events/illustar10.png",
    status: "ongoing" as const,
  },
  {
    id: 4,
    title: "동방 온리전 '환상경계'",
    date: "2026.01.19",
    location: "서울무역전시컨벤션센터(SETEC)",
    thumb: "/assets/events/illustar10.png",
    status: "ended" as const,
  },
  {
    id: 5,
    title: "코믹마켓 C105",
    date: "2025.12.29 ~ 2025.12.30",
    location: "도쿄 빅사이트",
    thumb: "/assets/events/illustar10.png",
    status: "ended" as const,
  },
  {
    id: 6,
    title: "일러스타 10",
    date: "2025.11.23",
    location: "코엑스 D홀",
    thumb: "/assets/events/illustar10.png",
    status: "ended" as const,
  },
  {
    id: 7,
    title: "코믹월드 서울 2025 가을",
    date: "2025.10.18 ~ 2025.10.19",
    location: "aT센터",
    thumb: "/assets/events/illustar10.png",
    status: "ended" as const,
  },
  {
    id: 8,
    title: "동방 온리전 '추억의 향연'",
    date: "2025.09.14",
    location: "서울무역전시컨벤션센터(SETEC)",
    thumb: "/assets/events/illustar10.png",
    status: "ended" as const,
  },
  {
    id: 9,
    title: "코믹마켓 C104",
    date: "2025.08.11 ~ 2025.08.12",
    location: "도쿄 빅사이트",
    thumb: "/assets/events/illustar10.png",
    status: "ended" as const,
  },
  {
    id: 9,
    title: "코믹마켓 C104",
    date: "2025.08.11 ~ 2025.08.12",
    location: "도쿄 빅사이트",
    thumb: "/assets/events/illustar10.png",
    status: "ended" as const,
  },
  {
    id: 9,
    title: "코믹마켓 C104",
    date: "2025.08.11 ~ 2025.08.12",
    location: "도쿄 빅사이트",
    thumb: "/assets/events/illustar10.png",
    status: "ended" as const,
  },
  {
    id: 9,
    title: "코믹마켓 C104",
    date: "2025.08.11 ~ 2025.08.12",
    location: "도쿄 빅사이트",
    thumb: "/assets/events/illustar10.png",
    status: "ended" as const,
  },
  {
    id: 9,
    title: "코믹마켓 C104",
    date: "2025.08.11 ~ 2025.08.12",
    location: "도쿄 빅사이트",
    thumb: "/assets/events/illustar10.png",
    status: "ended" as const,
  },
];

// 행사 아이템 (localStorage + 기본 데이터 병합)
const eventItems = ref<EventItem[]>([]);

// 모달 관련 상태
const showModal = ref(false);
const isEditMode = ref(false);
const editingEventId = ref<number | null>(null);

// 폼 데이터
const formData = ref({
  title: "",
  date: "",
  location: "",
  thumb: "",
  link: "",
  status: "upcoming" as "upcoming" | "ongoing" | "ended",
});

const resetForm = () => {
  formData.value = {
    title: "",
    date: "",
    location: "",
    thumb: "",
    link: "",
    status: "upcoming",
  };
  isEditMode.value = false;
  editingEventId.value = null;
};

// 데이터 로드
const loadEvents = () => {
  const savedEvents = JSON.parse(localStorage.getItem("event_posts") || "[]");
  // localStorage 데이터를 먼저, 그 다음 기본 데이터
  eventItems.value = [...savedEvents, ...defaultEvents];
};

onMounted(() => {
  loadEvents();
});

// 페이지네이션
const currentPage = ref(1);
const itemsPerPage = 9;

const totalPages = computed(() => Math.ceil(eventItems.value.length / itemsPerPage));

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return eventItems.value.slice(start, end);
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

// 상태 라벨
const getStatusLabel = (status: "upcoming" | "ongoing" | "ended") => {
  switch (status) {
    case "upcoming":
      return "예정";
    case "ongoing":
      return "진행중";
    case "ended":
      return "종료";
  }
};

// 관리자 기능 - 모달 열기
const openAddModal = () => {
  resetForm();
  showModal.value = true;
};

const openEditModal = (event: EventItem) => {
  isEditMode.value = true;
  editingEventId.value = event.id;
  formData.value = {
    title: event.title,
    date: event.date,
    location: event.location,
    thumb: event.thumb || event.thumbnail || "",
    link: event.link || "",
    status: event.status,
  };
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  resetForm();
};

// 이벤트 저장 (추가/수정)
const handleSave = () => {
  const savedEvents = JSON.parse(localStorage.getItem("event_posts") || "[]");

  if (isEditMode.value && editingEventId.value !== null) {
    // 수정 모드
    const index = eventItems.value.findIndex((item) => item.id === editingEventId.value);
    if (index !== -1) {
      eventItems.value[index] = {
        id: editingEventId.value,
        title: formData.value.title,
        date: formData.value.date,
        location: formData.value.location,
        thumb: formData.value.thumb,
        link: formData.value.link,
        status: formData.value.status,
      };
      // localStorage 업데이트
      const savedIndex = savedEvents.findIndex(
        (item: EventItem) => item.id === editingEventId.value
      );
      if (savedIndex !== -1) {
        savedEvents[savedIndex] = eventItems.value[index];
        localStorage.setItem("event_posts", JSON.stringify(savedEvents));
      }
    }
  } else {
    // 추가 모드
    const newId = Date.now();
    const newEvent: EventItem = {
      id: newId,
      title: formData.value.title,
      date: formData.value.date,
      location: formData.value.location,
      thumb: formData.value.thumb,
      link: formData.value.link,
      status: formData.value.status,
    };
    savedEvents.unshift(newEvent);
    localStorage.setItem("event_posts", JSON.stringify(savedEvents));
    eventItems.value.unshift(newEvent);
  }

  closeModal();
};

const handleDelete = (id: number) => {
  if (confirm("정말 삭제하시겠습니까?")) {
    // localStorage에서도 삭제
    const savedEvents = JSON.parse(localStorage.getItem("event_posts") || "[]");
    const filteredSaved = savedEvents.filter((item: { id: number }) => item.id !== id);
    localStorage.setItem("event_posts", JSON.stringify(filteredSaved));

    // 화면에서도 삭제
    eventItems.value = eventItems.value.filter((item) => item.id !== id);
  }
};

// 카드 클릭 시 링크 이동
const handleCardClick = (event: EventItem) => {
  if (event.link) {
    window.open(event.link, "_blank");
  }
};
</script>

<template>
  <div class="master-events-view">
    <header class="page-header">
      <h1>행사</h1>
      <p class="description">동방 프로젝트 서클 공리와정리가 참가하는 행사 일정을 안내합니다.</p>
    </header>

    <div class="events-grid">
      <article
        v-for="event in paginatedItems"
        :key="event.id"
        class="event-card"
        :class="[`status-${event.status}`, { 'has-link': !!event.link }]"
        @click="handleCardClick(event)"
      >
        <div class="card-thumb">
          <img :src="event.thumb || event.thumbnail" :alt="event.title" class="thumb-img" />
          <span class="status-badge" :class="event.status">{{ getStatusLabel(event.status) }}</span>
          <div v-if="isAdmin" class="card-actions">
            <button
              class="btn-action-card btn-edit"
              @click.stop="openEditModal(event)"
              title="수정"
            >
              <FontAwesomeIcon icon="pen" />
            </button>
            <button
              class="btn-action-card btn-delete"
              @click.stop="handleDelete(event.id)"
              title="삭제"
            >
              <FontAwesomeIcon icon="trash" />
            </button>
          </div>
        </div>
        <div class="card-content">
          <h3 class="card-title">{{ event.title }}</h3>
          <p class="card-date">{{ event.date }}</p>
          <p class="card-location">{{ event.location }}</p>
        </div>
      </article>
    </div>

    <!-- Pagination -->
    <nav class="pagination-wrapper">
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
        <button v-if="isAdmin" class="btn-write" @click="openAddModal">이벤트 추가</button>
      </div>
    </nav>

    <!-- 이벤트 추가/수정 모달 -->
    <Teleport to="body">
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content">
          <header class="modal-header">
            <h2>{{ isEditMode ? "이벤트 수정" : "이벤트 추가" }}</h2>
            <button class="btn-close" @click="closeModal"><FontAwesomeIcon icon="xmark" /></button>
          </header>
          <form class="modal-body" @submit.prevent="handleSave">
            <div class="form-group">
              <label for="title">행사명 *</label>
              <input
                id="title"
                v-model="formData.title"
                type="text"
                placeholder="행사명을 입력하세요"
                required
              />
            </div>
            <div class="form-group">
              <label for="date">날짜 *</label>
              <input
                id="date"
                v-model="formData.date"
                type="text"
                placeholder="예: 2026.03.15 또는 2026.03.15 ~ 2026.03.16"
                required
              />
            </div>
            <div class="form-group">
              <label for="location">장소 *</label>
              <input
                id="location"
                v-model="formData.location"
                type="text"
                placeholder="행사 장소를 입력하세요"
                required
              />
            </div>
            <div class="form-group">
              <label for="thumb">썸네일 URL</label>
              <input
                id="thumb"
                v-model="formData.thumb"
                type="text"
                placeholder="/assets/events/example.png"
              />
            </div>
            <div class="form-group">
              <label for="link">연결 링크</label>
              <input
                id="link"
                v-model="formData.link"
                type="text"
                placeholder="https://example.com/event"
              />
            </div>
            <div class="form-group">
              <label for="status">상태 *</label>
              <select id="status" v-model="formData.status" required>
                <option value="upcoming">예정</option>
                <option value="ongoing">진행중</option>
                <option value="ended">종료</option>
              </select>
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
.master-events-view {
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

/* Events Grid */
.events-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-xl);
}

/* Event Card */
.event-card {
  display: flex;
  flex-direction: column;
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  overflow: hidden;
  transition: all 0.3s ease;
}

.event-card.has-link {
  cursor: pointer;
}

.event-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

.event-card.status-ended {
  opacity: 0.7;
}

.event-card.status-ended:hover {
  opacity: 1;
}

/* Card Thumbnail */
.card-thumb {
  position: relative;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  background: var(--color-bg-subtle);
}

.thumb-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: transform 0.3s ease;
}

.event-card:hover .thumb-img {
  transform: scale(1.05);
}

.status-badge {
  position: absolute;
  top: var(--spacing-sm);
  left: var(--spacing-sm);
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-inverse);
}

.status-badge.upcoming {
  background: #2563eb;
}

.status-badge.ongoing {
  background: #16a34a;
}

.status-badge.ended {
  background: var(--color-text-muted);
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

.event-card:hover .card-actions {
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

.card-date {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.card-location {
  margin: 0;
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
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
  .events-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-md);
  }
}

@media (max-width: 480px) {
  .events-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
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
