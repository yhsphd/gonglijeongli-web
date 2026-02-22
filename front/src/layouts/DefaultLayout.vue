<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import AppHeader from "@/components/common/AppHeader.vue";
import AppFooter from "@/components/common/AppFooter.vue";

const bgImageOffset = 10;
const bgImageRef = ref<HTMLImageElement | null>(null);
const bgImageStyle = ref<{ top?: string; height?: string }>({
  top: "0",
  height: 100 + bgImageOffset + "vh",
});

const handleScroll = () => {
  const scrollY = window.scrollY;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

  if (!bgImageRef.value || maxScroll <= 0) return;

  const offset = (scrollY / maxScroll) * -bgImageOffset + "vh";
  bgImageStyle.value.top = offset;
};

onMounted(() => {
  window.addEventListener("scroll", handleScroll);
  // 이미지 로드 후 초기 계산
  if (bgImageRef.value) {
    bgImageRef.value.addEventListener("load", handleScroll);
  }
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});
</script>

<template>
  <div class="master-default-layout">
    <AppHeader class="header" />
    <div class="main">
      <div class="content">
        <RouterView />
      </div>
      <AppFooter />
    </div>
    <div class="bg-dimmer"></div>
    <img class="bg-image-sub" src="@/assets/img/bg_resized.jpg" />
    <img
      ref="bgImageRef"
      class="bg-image"
      :style="bgImageStyle"
      src="@/assets/img/bg_resized.jpg"
    />
  </div>
</template>

<style scoped>
.master-default-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  position: fixed;
  top: var(--layout-header-top);
  z-index: var(--z-header);
}

.main {
  width: var(--layout-content-width);
  margin: 0 auto;
  flex: 1;

  display: flex;
  flex-direction: column;

  background: var(--color-bg-overlay-light);
  box-shadow: var(--shadow-sm);
}
.content {
  padding: 10rem var(--spacing-2xl) var(--spacing-2xl);
  flex-grow: 1;
}

.bg-dimmer {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--color-bg-overlay);
  z-index: calc(var(--z-background) + 2);
}
.bg-image {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  z-index: calc(var(--z-background) + 1);
  box-shadow: 0 0 4px 2px rgba(0, 0, 0, 0.25);
}
.bg-image-sub {
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 100vw;
  z-index: var(--z-background);
  filter: var(--blur-md);
}
</style>
