<script setup lang="ts">
import { Carousel, Slide, Pagination, Navigation } from "vue3-carousel";
import "vue3-carousel/carousel.css";

import ListBox from "@/components/home/ListBox.vue";
import PostEntry from "@/components/home/PostEntry.vue";

const carouselConfig = {
  itemsToShow: 1.25,
  snapAlign: "center" as const,
  wrapAround: true,
  autoplay: 5000,
};

const heroSrcRoot = "/assets/home/carousel/";
const heroList = [
  { src: "bg.jpg", to: "#" },
  { src: "books.jpg", to: "#" },
  { src: "books2.jpg", to: "#" },
  { src: "houraisai3.png", to: "#" },
  { src: "postcards.jpg", to: "#" },
];
</script>

<template>
  <div class="master-home-view">
    <!-- <h1>홈</h1>
    <p>웹사이트에 오신 것을 환영합니다.</p> -->

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

    <div class="list-boxes">
      <ListBox title="News">
        <PostEntry v-for="(value, i) in 5" :key="i"></PostEntry>
      </ListBox>
      <ListBox class="twitter" title="Twitter">
        <!-- TODO: Replace with backend API -->
        <div class="twitter-wrapper">
          <iframe class="twitter-embed" src="https://nitter.net/gonglijeongli"></iframe>
        </div>
      </ListBox>
      <ListBox title="Events"></ListBox>
      <ListBox title="Works"></ListBox>
      <ListBox title="Gallery"></ListBox>
    </div>
  </div>
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

.list-boxes {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(25rem, 1fr));
  gap: var(--spacing-md);
}
.twitter-wrapper {
  width: 100%;
  height: var(--twitter-height);
  overflow: hidden;
}
.twitter-embed {
  width: calc((100% + 0.625rem) / 0.7); /* 스크롤바 너비만큼 추가 + 축소 보정 */
  height: calc((100% + 1.5rem) / 0.7);
  margin-top: calc(-1.5rem / 0.7);
  border: none;
  transform: scale(0.7);
  transform-origin: top left;
}
</style>
