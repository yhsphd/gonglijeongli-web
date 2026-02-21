<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { Carousel, Slide, Navigation } from "vue3-carousel";
import "vue3-carousel/carousel.css";

// 갤러리 아이템 타입 정의
interface GalleryItem {
  id: number;
  src: string;
  source: "twitter" | "pixiv" | "local";
  originalUrl?: string;
}

// 관리자 상태 (추후 인증 시스템/store로 교체)
const isAdmin = ref(true);

// 기본 데이터 (백엔드 크롤링 전 임시 데이터)
const defaultGallery: GalleryItem[] = [
  { id: 1, src: "/assets/gallery/gal1.jpg", source: "twitter" },
  { id: 2, src: "/assets/gallery/gal2.jpg", source: "pixiv" },
  { id: 3, src: "/assets/gallery/gal3.jpg", source: "twitter" },
  { id: 4, src: "/assets/gallery/gal4.jpg", source: "local" },
  { id: 5, src: "/assets/gallery/gal1.jpg", source: "pixiv" },
  { id: 6, src: "/assets/gallery/gal2.jpg", source: "twitter" },
  { id: 7, src: "/assets/gallery/gal3.jpg", source: "local" },
  { id: 8, src: "/assets/gallery/gal4.jpg", source: "pixiv" },
  { id: 9, src: "/assets/gallery/gal1.jpg", source: "twitter" },
  { id: 10, src: "/assets/gallery/gal2.jpg", source: "local" },
  { id: 11, src: "/assets/gallery/gal3.jpg", source: "pixiv" },
  { id: 12, src: "/assets/gallery/gal4.jpg", source: "twitter" },
  { id: 13, src: "/assets/gallery/gal1.jpg", source: "local" },
  { id: 14, src: "/assets/gallery/gal2.jpg", source: "pixiv" },
  { id: 15, src: "/assets/gallery/gal3.jpg", source: "twitter" },
  { id: 16, src: "/assets/gallery/gal4.jpg", source: "local" },
];

// 갤러리 아이템
const galleryItems = ref<GalleryItem[]>([]);

// 무한 스크롤 관련
const displayedCount = ref(12);
const itemsPerLoad = 8;
const isLoading = ref(false);

const displayedItems = computed(() => {
  return galleryItems.value.slice(0, displayedCount.value);
});

const hasMore = computed(() => {
  return displayedCount.value < galleryItems.value.length;
});

// 데이터 로드
const loadGallery = () => {
  const savedGallery = JSON.parse(localStorage.getItem("gallery_posts") || "[]");
  galleryItems.value = [...savedGallery, ...defaultGallery];
};

// 더 불러오기
const loadMore = () => {
  if (isLoading.value || !hasMore.value) return;

  isLoading.value = true;
  setTimeout(() => {
    displayedCount.value += itemsPerLoad;
    isLoading.value = false;
  }, 300);
};

// 무한 스크롤 처리
const handleScroll = () => {
  const scrollHeight = document.documentElement.scrollHeight;
  const scrollTop = document.documentElement.scrollTop;
  const clientHeight = document.documentElement.clientHeight;

  if (scrollTop + clientHeight >= scrollHeight - 500) {
    loadMore();
  }
};

onMounted(() => {
  loadGallery();
  window.addEventListener("scroll", handleScroll);
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});

// 라이트박스
const lightboxOpen = ref(false);
const lightboxIndex = ref(0);
const carouselRef = ref<{ prev: () => void; next: () => void } | null>(null);

const openLightbox = (index: number) => {
  lightboxIndex.value = index;
  lightboxOpen.value = true;
  document.body.style.overflow = "hidden";
};

const closeLightbox = () => {
  lightboxOpen.value = false;
  document.body.style.overflow = "";
};

const onSlideChange = (data: { currentSlideIndex: number }) => {
  lightboxIndex.value = data.currentSlideIndex;
};

const currentLightboxItem = computed(() => {
  return displayedItems.value[lightboxIndex.value];
});

// 키보드 이벤트
const handleKeydown = (e: KeyboardEvent) => {
  if (!lightboxOpen.value) return;

  if (e.key === "Escape") closeLightbox();
  if (e.key === "ArrowLeft") carouselRef.value?.prev();
  if (e.key === "ArrowRight") carouselRef.value?.next();
};

onMounted(() => {
  window.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeydown);
});

// 관리자 기능
const handleDelete = (id: number) => {
  if (confirm("정말 삭제하시겠습니까?")) {
    const savedGallery = JSON.parse(localStorage.getItem("gallery_posts") || "[]");
    const filteredSaved = savedGallery.filter((item: { id: number }) => item.id !== id);
    localStorage.setItem("gallery_posts", JSON.stringify(filteredSaved));
    galleryItems.value = galleryItems.value.filter((item) => item.id !== id);
  }
};

// 원본 링크 열기
const openOriginal = (item: GalleryItem) => {
  if (item.originalUrl) {
    window.open(item.originalUrl, "_blank");
  }
};
</script>

<template>
  <div class="master-gallery-view">
    <header class="page-header">
      <h1>갤러리</h1>
      <p class="description">트위터와 픽시브에 공개된 일러스트를 모아봅니다.</p>
    </header>

    <!-- Masonry Grid -->
    <div class="masonry-grid">
      <div
        v-for="(item, index) in displayedItems"
        :key="item.id"
        class="masonry-item"
        @click="openLightbox(index)"
      >
        <img :src="item.src" alt="" loading="lazy" />
        <div v-if="isAdmin" class="item-actions">
          <button
            class="btn-action-item btn-delete"
            @click.stop="handleDelete(item.id)"
            title="삭제"
          >
            <FontAwesomeIcon icon="trash" />
          </button>
        </div>
        <div class="source-badge" :class="item.source">
          <FontAwesomeIcon v-if="item.source === 'twitter'" :icon="['fab', 'x-twitter']" />
          <FontAwesomeIcon v-else-if="item.source === 'pixiv'" icon="palette" />
          <FontAwesomeIcon v-else icon="image" />
        </div>
      </div>
    </div>

    <!-- Loading Indicator -->
    <div v-if="isLoading" class="loading">
      <div class="loading-spinner"></div>
    </div>

    <!-- End Message -->
    <div v-if="!hasMore && galleryItems.length > 0" class="end-message">
      <p>모든 작품을 불러왔습니다.</p>
    </div>

    <!-- Lightbox -->
    <Teleport to="body">
      <div v-if="lightboxOpen" class="lightbox-overlay" @click.self="closeLightbox">
        <button class="lightbox-close" @click="closeLightbox">
          <FontAwesomeIcon icon="xmark" />
        </button>

        <div class="lightbox-carousel-wrapper">
          <Carousel
            ref="carouselRef"
            v-model="lightboxIndex"
            :items-to-show="1"
            :wrap-around="true"
            :transition="300"
            @slide-end="onSlideChange"
          >
            <Slide v-for="item in displayedItems" :key="item.id">
              <div class="lightbox-slide">
                <img :src="item.src" alt="" @click.stop />
              </div>
            </Slide>

            <template #addons>
              <Navigation />
            </template>
          </Carousel>
        </div>

        <div class="lightbox-info">
          <span class="lightbox-counter"
            >{{ lightboxIndex + 1 }} / {{ displayedItems.length }}</span
          >
          <button
            v-if="currentLightboxItem?.originalUrl"
            class="btn-original"
            @click="openOriginal(currentLightboxItem)"
          >
            원본 보기
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.master-gallery-view {
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

/* Masonry Grid */
.masonry-grid {
  columns: 4;
  column-gap: var(--spacing-md);
}

.masonry-item {
  position: relative;
  break-inside: avoid;
  margin-bottom: var(--spacing-md);
  cursor: pointer;
  overflow: hidden;
  background: var(--color-bg-subtle);
}

.masonry-item img {
  width: 100%;
  display: block;
  transition: transform 0.3s ease;
}

.masonry-item:hover img {
  transform: scale(1.03);
}

/* Item Actions */
.item-actions {
  position: absolute;
  top: var(--spacing-sm);
  right: var(--spacing-sm);
  display: flex;
  gap: var(--spacing-xs);
  opacity: 0;
  transition: opacity 0.2s;
}

.masonry-item:hover .item-actions {
  opacity: 1;
}

.btn-action-item {
  width: 1.75rem;
  height: 1.75rem;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: rgba(0, 0, 0, 0.6);
  color: var(--color-text-inverse);
  font-size: var(--font-size-xs);
  cursor: pointer;
  transition: all 0.2s;
  border-radius: var(--radius-xs);
}

.btn-action-item.btn-delete:hover {
  background: var(--color-danger);
}

/* Source Badge */
.source-badge {
  position: absolute;
  bottom: var(--spacing-sm);
  left: var(--spacing-sm);
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
  color: var(--color-text-inverse);
  font-size: var(--font-size-xs);
  border-radius: var(--radius-xs);
  opacity: 0;
  transition: opacity 0.2s;
}

.masonry-item:hover .source-badge {
  opacity: 1;
}

.source-badge.twitter {
  background: rgba(0, 0, 0, 0.8);
}

.source-badge.pixiv {
  background: rgba(0, 150, 250, 0.8);
}

.source-badge.local {
  background: rgba(100, 100, 100, 0.8);
}

/* Loading */
.loading {
  display: flex;
  justify-content: center;
  padding: var(--spacing-xl);
}

.loading-spinner {
  width: 2rem;
  height: 2rem;
  border: 2px solid var(--color-border);
  border-top-color: var(--color-text-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* End Message */
.end-message {
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

/* Lightbox */
.lightbox-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000000;
}

.lightbox-close {
  position: absolute;
  top: var(--spacing-md);
  right: var(--spacing-md);
  width: 2.5rem;
  height: 2.5rem;
  padding: 0;
  border: none;
  background: none;
  color: var(--color-text-inverse);
  font-size: var(--font-size-lg);
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s;
  z-index: 10;
}

.lightbox-close:hover {
  opacity: 1;
}

.lightbox-carousel-wrapper {
  width: 100%;
  max-width: 90vw;
  height: 85vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lightbox-carousel-wrapper :deep(.carousel) {
  width: 100%;
  height: 100%;
}

.lightbox-carousel-wrapper :deep(.carousel__viewport) {
  height: 100%;
}

.lightbox-carousel-wrapper :deep(.carousel__track) {
  height: 100%;
}

.lightbox-carousel-wrapper :deep(.carousel__slide) {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lightbox-slide {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.lightbox-slide img {
  max-width: 100%;
  max-height: 85vh;
  object-fit: contain;
}

/* Carousel Navigation */
.lightbox-carousel-wrapper :deep(.carousel__prev),
.lightbox-carousel-wrapper :deep(.carousel__next) {
  box-sizing: content-box;
  background: none;
  border: none;
  color: var(--color-text-inverse);
  font-size: var(--font-size-lg);
  opacity: 0.7;
  transition: opacity 0.2s;
}

.lightbox-carousel-wrapper :deep(.carousel__prev:hover),
.lightbox-carousel-wrapper :deep(.carousel__next:hover) {
  opacity: 1;
}

.lightbox-carousel-wrapper :deep(.carousel__prev) {
  left: var(--spacing-md);
}

.lightbox-carousel-wrapper :deep(.carousel__next) {
  right: var(--spacing-md);
}

.lightbox-info {
  position: absolute;
  bottom: var(--spacing-md);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  color: var(--color-text-inverse);
  font-size: var(--font-size-sm);
}

.lightbox-counter {
  opacity: 0.7;
}

.btn-original {
  padding: var(--spacing-xs) var(--spacing-md);
  border: 1px solid var(--color-text-inverse);
  background: none;
  color: var(--color-text-inverse);
  font-family: var(--font-family-base);
  font-size: var(--font-size-xs);
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.btn-original:hover {
  opacity: 1;
}

/* Responsive */
@media (max-width: 1200px) {
  .masonry-grid {
    columns: 3;
  }
}

@media (max-width: 768px) {
  .masonry-grid {
    columns: 2;
  }

  .lightbox-carousel-wrapper :deep(.carousel__prev),
  .lightbox-carousel-wrapper :deep(.carousel__next) {
    transform: scale(0.8);
  }
}

@media (max-width: 480px) {
  .masonry-grid {
    columns: 2;
    column-gap: var(--spacing-xs);
  }

  .masonry-item {
    margin-bottom: var(--spacing-xs);
  }
}
</style>
