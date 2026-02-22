<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import PageHeader from "@/components/common/PageHeader.vue";
import AppPagination from "@/components/common/AppPagination.vue";
import AdminModal from "@/components/common/AdminModal.vue";
import FormInput from "@/components/common/FormInput.vue";
import CardActions from "@/components/common/CardActions.vue";
import ContentCard from "@/components/common/ContentCard.vue";

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
    <PageHeader
      title="작품"
      description="동방 프로젝트 서클 공리와정리의 동인지 및 굿즈를 소개합니다."
    />

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
      <ContentCard
        v-for="work in paginatedItems"
        :key="work.id"
        :thumb="work.thumb"
        :alt="work.title"
        :has-link="!!work.link"
        @click="handleCardClick(work)"
      >
        <template #overlay>
          <CardActions v-if="isAdmin" @edit="openEditModal(work)" @delete="handleDelete(work.id)" />
        </template>
        <div class="card-tags">
          <span v-for="tag in work.tags" :key="tag" class="tag">{{ tag }}</span>
        </div>
        <h3 class="card-title">{{ work.title }}</h3>
        <p v-if="work.description" class="card-description">{{ work.description }}</p>
        <p class="card-date">{{ work.date }}</p>
      </ContentCard>
    </div>

    <!-- 결과 없음 -->
    <div v-if="filteredItems.length === 0" class="no-results">
      <p>선택한 태그에 해당하는 작품이 없습니다.</p>
    </div>

    <!-- Pagination -->
    <AppPagination
      v-if="filteredItems.length > 0"
      v-model:current-page="currentPage"
      :total-pages="totalPages"
    >
      <template #right>
        <button v-if="isAdmin" class="btn-write" @click="openAddModal">작품 추가</button>
      </template>
    </AppPagination>

    <!-- 작품 추가/수정 모달 -->
    <AdminModal
      :open="showModal"
      :title="isEditMode ? '작품 수정' : '작품 추가'"
      :submit-label="isEditMode ? '수정' : '추가'"
      @close="closeModal"
      @submit="handleSave"
    >
      <FormInput
        v-model="formData.title"
        label="작품명"
        placeholder="작품명을 입력하세요"
        required
      />
      <FormInput
        v-model="formData.description"
        label="설명"
        placeholder="작품에 대한 간단한 설명"
      />
      <FormInput v-model="formData.date" label="발행일" placeholder="예: 2026.02" required />
      <FormInput
        v-model="formData.thumb"
        label="썸네일 URL"
        placeholder="/assets/works/example.png"
      />
      <FormInput v-model="formData.link" label="연결 링크" placeholder="https://example.com/work" />
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
    </AdminModal>
  </div>
</template>

<style scoped>
.master-works-view {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
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
  gap: var(--spacing-md);
}

/* Card Content */
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

/* Form Tags (for tag selection in modal) */
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
</style>
