<script setup lang="ts">
import { ref } from "vue";
import { Carousel, Slide } from "vue3-carousel";
import "vue3-carousel/carousel.css";

const currentSlide = ref(0);
const slideTo = (index: number) => (currentSlide.value = index);

const gallerySrcRoot = "/assets/gallery/";
const galleryList = [
  { src: "gal1.jpg", to: "#" },
  { src: "gal2.jpg", to: "#" },
  { src: "gal3.jpg", to: "#" },
  { src: "gal4.jpg", to: "#" },
];

const galleryConfig = {
  itemsToShow: 1,
  wrapAround: true,
  slideEffect: "fade" as const,
  mouseDrag: false,
  touchDrag: false,
};

const thumbnailsConfig = {
  itemsToShow: 6,
  wrapAround: true,
  gap: 10,
};
</script>

<template>
  <div class="gallery-carousel">
    <Carousel class="gallery" v-bind="galleryConfig" v-model="currentSlide">
      <Slide v-for="(item, i) in galleryList" :key="i">
        <img class="gallery-image" :src="gallerySrcRoot + item.src" />
      </Slide>
    </Carousel>

    <Carousel class="thumbnails" v-bind="thumbnailsConfig" v-model="currentSlide">
      <Slide v-for="(item, i) in galleryList" :key="i">
        <template #default="{ currentIndex, isActive }">
          <div :class="['thumbnail', { 'is-active': isActive }]" @click="slideTo(currentIndex)">
            <img :src="gallerySrcRoot + item.src" />
          </div>
        </template>
      </Slide>
    </Carousel>
  </div>
</template>

<style scoped>
.gallery {
  /* --vc-nav-background: rgba(255, 255, 255, 0.7); */
  /* --vc-nav-border-radius: 100%; */
  height: 400px;
}

.gallery-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: var(--radius-sm);
  filter: var(--shadow-sm);
}

.thumbnails {
  margin-top: var(--spacing-sm);
}

.thumbnail {
  height: 80px;
  width: 100%;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.3s ease-in-out;
  background-color: var(--color-bg-muted, rgba(0, 0, 0, 0.05));
  border: 1px solid var(--color-border, rgba(0, 0, 0, 0.1));
  border-radius: var(--radius-xs, 4px);
}

.thumbnail.is-active,
.thumbnail:hover {
  opacity: 1;
  border-color: var(--color-primary, #3b82f6);
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
</style>
