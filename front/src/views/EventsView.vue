<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import PageHeader from "@/components/common/PageHeader.vue";
import AppPagination from "@/components/common/AppPagination.vue";
import AdminModal from "@/components/common/AdminModal.vue";
import FormInput from "@/components/common/FormInput.vue";
import CardActions from "@/components/common/CardActions.vue";
import ContentCard from "@/components/common/ContentCard.vue";
import { useAuthStore } from "@/stores/auth";
import {
  fetchEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  type EventItem,
  type EventFormData,
} from "@/api/events";

// 인증 스토어
const authStore = useAuthStore();

// 행사 목록 상태
const eventItems = ref<EventItem[]>([]);
const totalItems = ref(0);
const isLoading = ref(false);

// 모달 관련 상태
const showModal = ref(false);
const isEditMode = ref(false);
const editingEventId = ref<number | null>(null);

// 폼 데이터
const formData = ref<EventFormData>({
  title: "",
  date: "",
  location: "",
  thumb: "",
  link: "",
  status: "upcoming",
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

// 페이지네이션
const currentPage = ref(1);
const itemsPerPage = 9;

const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage));

// 데이터 로드 (API 호출)
const loadEvents = async () => {
  isLoading.value = true;
  try {
    const data = await fetchEvents(currentPage.value, itemsPerPage);
    eventItems.value = data.items;
    totalItems.value = data.total;
  } catch (error) {
    console.error("행사 목록 로드 실패:", error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  loadEvents();
});

// 페이지 변경 시 다시 로드
watch(currentPage, () => {
  loadEvents();
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
    thumb: event.thumb || "",
    link: event.link || "",
    status: event.status,
  };
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  resetForm();
};

// 이벤트 저장 (추가/수정) - API 호출
const handleSave = async () => {
  try {
    if (isEditMode.value && editingEventId.value !== null) {
      await updateEvent(editingEventId.value, formData.value);
    } else {
      await createEvent(formData.value);
    }
    closeModal();
    await loadEvents(); // 목록 갱신
  } catch (error) {
    console.error("행사 저장 실패:", error);
    alert("저장에 실패했습니다. 관리자 로그인 상태를 확인해주세요.");
  }
};

const handleDelete = async (id: number) => {
  if (confirm("정말 삭제하시겠습니까?")) {
    try {
      await deleteEvent(id);
      await loadEvents(); // 목록 갱신
    } catch (error) {
      console.error("행사 삭제 실패:", error);
      alert("삭제에 실패했습니다. 관리자 로그인 상태를 확인해주세요.");
    }
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

    <TransitionGroup name="list" tag="div" class="events-grid">
      <div
        v-for="(event, index) in eventItems"
        :key="event.id"
        :style="{ '--delay': `${index * 0.05}s` }"
      >
        <ContentCard
          :thumb="event.thumb || undefined"
          :alt="event.title"
          :has-link="!!event.link"
          :class="`status-${event.status}`"
          @click="handleCardClick(event)"
        >
          <template #overlay>
            <span class="status-badge" :class="event.status">{{ getStatusLabel(event.status) }}</span>
            <CardActions
              v-if="authStore.isAdmin"
              @edit="openEditModal(event)"
              @delete="handleDelete(event.id)"
            />
          </template>
          <h3 class="card-title">{{ event.title }}</h3>
          <p class="card-date">{{ event.date }}</p>
          <p class="card-location">{{ event.location }}</p>
        </ContentCard>
      </div>
    </TransitionGroup>

    <!-- Pagination -->
    <AppPagination v-model:current-page="currentPage" :total-pages="totalPages">
      <template #right>
        <button v-if="authStore.isAdmin" class="btn-write" @click="openAddModal">
          이벤트 추가
        </button>
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

.events-grid > div {
  display: flex;
}

.events-grid > div :deep(.content-card) {
  flex: 1;
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

/* List Transition */
.list-enter-active {
  transition: all 0.5s ease;
  transition-delay: var(--delay);
}

.list-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.list-move {
  transition: transform 0.5s ease;
}
</style>
