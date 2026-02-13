<script setup lang="ts">
import { Carousel, Slide, Pagination, Navigation } from "vue3-carousel";
import "vue3-carousel/carousel.css";

import ListBox from "@/components/home/ListBox.vue";
import TwitterTimeline from "@/components/home/TwitterTimeline.vue";
import PostEntry from "@/components/home/PostEntry.vue";

const carouselConfig = {
  itemsToShow: 1.25,
  snapAlign: "center" as const,
  wrapAround: true,
  autoplay: 5000,
  gap: 16,
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
  height: 400px;
  margin: 0 -32px 16px -32px;
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
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.3);
}
.carousel__bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  filter: blur(20px);
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
  margin: 0 40px;
}

.list-boxes {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1rem;
}
.twitter-wrapper {
  width: 100%;
  height: 400px;
  overflow: hidden;
}
.twitter-embed {
  width: calc((100% + 10px) / 0.7); /* 스크롤바 너비만큼 추가 + 축소 보정 */
  height: calc((100% + 24px) / 0.7);
  margin-top: calc(-24px / 0.7);
  border: none;
  transform: scale(0.7);
  transform-origin: top left;
}
</style>
