<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import PageHeader from "@/components/common/PageHeader.vue";
import AppPagination from "@/components/common/AppPagination.vue";
import AdminModal from "@/components/common/AdminModal.vue";
import FormInput from "@/components/common/FormInput.vue";
import CardActions from "@/components/common/CardActions.vue";
import ContentCard from "@/components/common/ContentCard.vue";

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
    <PageHeader
      title="행사"
      description="동방 프로젝트 서클 공리와정리가 참가하는 행사 일정을 안내합니다."
    />

    <div class="events-grid">
      <ContentCard
        v-for="event in paginatedItems"
        :key="event.id"
        :thumb="event.thumb || event.thumbnail"
        :alt="event.title"
        :has-link="!!event.link"
        :class="`status-${event.status}`"
        @click="handleCardClick(event)"
      >
        <template #overlay>
          <span class="status-badge" :class="event.status">{{ getStatusLabel(event.status) }}</span>
          <CardActions
            v-if="isAdmin"
            @edit="openEditModal(event)"
            @delete="handleDelete(event.id)"
          />
        </template>
        <h3 class="card-title">{{ event.title }}</h3>
        <p class="card-date">{{ event.date }}</p>
        <p class="card-location">{{ event.location }}</p>
      </ContentCard>
    </div>

    <!-- Pagination -->
    <AppPagination v-model:current-page="currentPage" :total-pages="totalPages">
      <template #right>
        <button v-if="isAdmin" class="btn-write" @click="openAddModal">이벤트 추가</button>
      </template>
    </AppPagination>

    <!-- 이벤트 추가/수정 모달 -->
    <AdminModal
      :open="showModal"
      :title="isEditMode ? '이벤트 수정' : '이벤트 추가'"
      :submit-label="isEditMode ? '수정' : '추가'"
      @close="closeModal"
      @submit="handleSave"
    >
      <FormInput
        v-model="formData.title"
        label="행사명"
        placeholder="행사명을 입력하세요"
        required
      />
      <FormInput
        v-model="formData.date"
        label="날짜"
        placeholder="예: 2026.03.15 또는 2026.03.15 ~ 2026.03.16"
        required
      />
      <FormInput
        v-model="formData.location"
        label="장소"
        placeholder="행사 장소를 입력하세요"
        required
      />
      <FormInput
        v-model="formData.thumb"
        label="썸네일 URL"
        placeholder="/assets/events/example.png"
      />
      <FormInput
        v-model="formData.link"
        label="연결 링크"
        placeholder="https://example.com/event"
      />
      <div class="form-group">
        <label for="status">상태 *</label>
        <select id="status" v-model="formData.status" required>
          <option value="upcoming">예정</option>
          <option value="ongoing">진행중</option>
          <option value="ended">종료</option>
        </select>
      </div>
    </AdminModal>
  </div>
</template>

<style scoped>
.master-events-view {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

/* Events Grid */
.events-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-md);
}

/* Event Card - status-ended styling via ContentCard */
:deep(.content-card).status-ended {
  opacity: 0.7;
}

:deep(.content-card).status-ended:hover {
  opacity: 1;
}

/* Status Badge */
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
  background: var(--color-info);
}

.status-badge.ongoing {
  background: var(--color-success);
}

.status-badge.ended {
  background: var(--color-text-muted);
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

/* Form Group for select (not in FormInput component) */
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

.form-group select {
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-border);
  background: var(--color-bg-primary);
  font-family: var(--font-family-base);
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
}

.form-group select:focus {
  outline: none;
  border-color: var(--color-text-primary);
}
</style>
