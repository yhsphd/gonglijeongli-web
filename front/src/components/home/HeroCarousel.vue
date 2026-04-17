<script setup lang="ts">
import { ref, onMounted } from "vue";
import { fetchBanners, type BannerItem } from "@/api/banners";
import { Carousel, Slide, Pagination, Navigation } from "vue3-carousel";
import "vue3-carousel/carousel.css";

const carouselConfig = {
  itemsToShow: 1.25,
  snapAlign: "center" as const,
  wrapAround: true,
  autoplay: 5000,
};

const banners = ref<BannerItem[]>([]);

onMounted(async () => {
  try {
    banners.value = await fetchBanners(true); // activeOnly = true
  } catch (error) {
    console.error("배너를 불러오지 못했습니다:", error);
  }
});
</script>

<template>
  <Carousel v-if="banners && banners.length > 0" class="hero" v-bind="carouselConfig">
    <Slide v-for="item in banners" :key="item.id">
      <div class="carousel__item">
        <div class="carousel__bg" :style="{ backgroundImage: `url(${item.imageUrl})` }"></div>
        <a
          v-if="item.linkUrl"
          :href="item.linkUrl"
          target="_blank"
          rel="noopener noreferrer"
          style="display: block; width: 100%; height: 100%; cursor: pointer"
        >
          <img :src="item.imageUrl" />
        </a>
        <img v-else :src="item.imageUrl" />
      </div>
    </Slide>

    <template #addons>
      <Navigation />
      <Pagination />
    </template>
  </Carousel>
  <!-- 배너가 없을 때 플레이스홀더 영역 보존용 -->
  <div v-else class="hero hero-placeholder"></div>
</template>

<style scoped>
.hero {
  height: var(--hero-height);
  margin: 0 calc(var(--hero-margin) * -1) calc(var(--spacing-md) + 2rem)
    calc(var(--hero-margin) * -1);
}
.hero :deep(.carousel__viewport) {
  mask-image: linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%);
  -webkit-mask-image: linear-gradient(
    to right,
    transparent 0%,
    black 10%,
    black 90%,
    transparent 100%
  );
}
.carousel__item {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  margin: 0 var(--hero-item-margin);
}
.carousel__bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  filter: var(--blur-md);
  transform: scale(1.1);
  z-index: 0;
}
.carousel__item img {
  position: relative;
  width: 100%;
  height: 100%;
  object-fit: contain;
  z-index: 1;
}
.hero :deep(.carousel__next),
.hero :deep(.carousel__prev) {
  margin: 0 var(--hero-nav-margin);
}

.hero :deep(.carousel__pagination) {
  position: absolute;
  bottom: calc(var(--spacing-md) * -1 - 0.25rem);
  left: 50%;
  transform: translateX(-50%);
}
</style>
