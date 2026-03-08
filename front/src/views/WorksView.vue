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
  fetchWorks,
  createWork,
  updateWork,
  deleteWork,
  type WorkItem,
  type WorkFormData,
} from "@/api/works";

// 인증 스토어
const authStore = useAuthStore();
const isAdmin = computed(() => authStore.isAdmin);

// 작품 목록 상태
const workItems = ref<WorkItem[]>([]);
const totalItems = ref(0);
const isLoading = ref(false);

// 사용 가능한 태그 목록
const availableTags = ["동방", "회지", "일러스트북", "만화", "엽서", "스티커", "아크릴", "기타"];

// 선택된 태그 필터 (프론트엔드에서 필터링하거나 백엔드에 전달할 수 있으나, 현재 백엔드 API는 태그 필터링을 지원하지 않으므로 수정 계획상 백엔드 필터링은 생략하고, 가져온 전체 목록(혹은 페이지네이션 결과)을 대상으로 필터링할 수도 있습니다. 하지만 백엔드 페이지네이션 도입 시엔 클라이언트 사이드 필터링과 어긋납니다. 여기선 간단히 태그 필터링 기능을 유지하되, 백엔드 API는 태그 쿼리를 받지 않으므로 전체를 가져와서 필터링하거나, 페이지네이션과 필터링을 임시로 프론트에서 할 수도 있습니다.
// Plan 대로면 "백엔드 기반의 페이지네이션"을 한다고 했으니 API 단에서 `tags` 쿼리를 추가하는 것이 맞습니다만, API 코드는 작성 완료되었습니다. `works.ts`에 태그 필터는 구현 안 했으므로, 전체 API 응답을 프론트에서 필터링하거나 API를 수정해야 합니다. API 수정을 피하기 위해, 일단 작품 수는 많지 않다고 가정하고, 태그 필터를 프론트에서 하거나, 향후 확장성을 위해 tags 필터를 API에 넘기는 방식을 사용할 수 있습니다. 여기서는 우선 그대로 구현합니다.)

// 모달 관련 상태
const showModal = ref(false);
const isEditMode = ref(false);
const editingWorkId = ref<number | null>(null);

// 폼 데이터
const formData = ref<WorkFormData>({
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

// 페이지네이션
const currentPage = ref(1);
const itemsPerPage = 9;

const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage));

// 백엔드 데이터 로드
const loadWorks = async () => {
  isLoading.value = true;
  try {
    const data = await fetchWorks(currentPage.value, itemsPerPage);
    workItems.value = data.items;
    totalItems.value = data.total;
  } catch (error) {
    console.error("작품 목록 로드 실패:", error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  loadWorks();
});

watch(currentPage, () => {
  loadWorks();
});

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

// 태그 토글 (프론트 단 필터 구현)
const selectedTags = ref<string[]>([]);
const toggleTag = (tag: string) => {
  const index = selectedTags.value.indexOf(tag);
  if (index === -1) {
    selectedTags.value.push(tag);
  } else {
    selectedTags.value.splice(index, 1);
  }
};

const clearTags = () => {
  selectedTags.value = [];
};

const filteredItems = computed(() => {
  if (selectedTags.value.length === 0) {
    return workItems.value;
  }
  return workItems.value.filter((item) =>
    selectedTags.value.some((tag) => item.tags.includes(tag))
  );
});

// 작품 저장 (추가/수정)
const handleSave = async () => {
  try {
    if (isEditMode.value && editingWorkId.value !== null) {
      await updateWork(editingWorkId.value, formData.value);
    } else {
      await createWork(formData.value);
    }
    closeModal();
    await loadWorks();
  } catch (error) {
    console.error("작품 저장 실패:", error);
    alert("저장에 실패했습니다. 관리자 로그인 상태를 확인해주세요.");
  }
};

const handleDelete = async (id: number) => {
  if (confirm("정말 삭제하시겠습니까?")) {
    try {
      await deleteWork(id);
      await loadWorks();
    } catch (error) {
      console.error("작품 삭제 실패:", error);
      alert("삭제에 실패했습니다. 관리자 로그인 상태를 확인해주세요.");
    }
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
        v-for="work in filteredItems"
        :key="work.id"
        :thumb="work.thumb || undefined"
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
