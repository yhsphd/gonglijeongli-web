<script setup lang="ts">
import { Carousel, Slide, Pagination, Navigation } from "vue3-carousel";
import "vue3-carousel/carousel.css";

const carouselConfig = {
  itemsToShow: 1.25,
  snapAlign: "center" as const,
  wrapAround: true,
  autoplay: 5000,
};

const heroSrcRoot = "/assets/home/hero/";
const heroList = [
  { src: "bg.jpg", to: "#" },
  { src: "books.jpg", to: "#" },
  { src: "books2.jpg", to: "#" },
  { src: "houraisai3.png", to: "#" },
  { src: "postcards.jpg", to: "#" },
];
</script>

<template>
  <Carousel class="hero" v-bind="carouselConfig">
    <Slide v-for="(item, i) in heroList" :key="i">
      <div class="carousel__item">
        <div
          class="carousel__bg"
          :style="{ backgroundImage: `url(${heroSrcRoot + item.src})` }"
        ></div>
        <img :src="heroSrcRoot + item.src" />
      </div>
    </Slide>

    <template #addons>
      <Navigation />
      <Pagination />
    </template>
  </Carousel>
</template>

<style scoped>
.hero {
  height: var(--hero-height);
  margin: 0 calc(var(--hero-margin) * -1) var(--spacing-md) calc(var(--hero-margin) * -1);
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
</style>
