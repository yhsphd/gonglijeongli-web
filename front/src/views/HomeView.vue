<script setup lang="ts">
import ListBox from "@/components/home/ListBox.vue";
import PostEntry from "@/components/home/PostEntry.vue";
import ThumbEntry from "@/components/home/ThumbEntry.vue";
import HeroCarousel from "@/components/home/HeroCarousel.vue";
import GalleryCarousel from "@/components/home/GalleryCarousel.vue";
</script>

<template>
  <div class="master-home-view">
    <!-- Hero Section -->
    <HeroCarousel />

    <!-- Content Section -->
    <div class="list-boxes">
      <!-- NEWS -->
      <ListBox title="News">
        <PostEntry v-for="(value, i) in 5" :key="i"></PostEntry>
      </ListBox>

      <!-- EVENTS -->
      <ListBox title="Events">
        <div class="events-grid">
          <ThumbEntry v-for="(value, i) in 5" :key="i"></ThumbEntry>
        </div>
      </ListBox>

      <!-- GALLERY -->
      <ListBox title="Gallery" class="gallery-box">
        <GalleryCarousel />
      </ListBox>

      <!-- WORKS -->
      <ListBox title="Works">
        <div class="works-grid">
          <ThumbEntry v-for="(value, i) in 5" :key="i"></ThumbEntry>
        </div>
      </ListBox>

      <!-- TWITTER -->
      <ListBox title="Twitter" class="twitter">
        <!-- TODO: Replace with backend API -->
        <div class="twitter-wrapper">
          <iframe class="twitter-embed" src="https://nitter.net/gonglijeongli"></iframe>
        </div>
      </ListBox>
    </div>
  </div>
</template>

<style scoped>
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

.events-grid,
.works-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(7rem, 1fr));
  gap: var(--spacing-md);
  padding-bottom: var(--spacing-md);
}

.gallery-box {
  grid-column: 1 / -1;
}
</style>
