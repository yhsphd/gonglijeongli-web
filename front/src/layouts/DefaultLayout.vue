<script setup lang="ts">
import AppHeader from "@/components/common/AppHeader.vue";
import AppFooter from "@/components/common/AppFooter.vue";
import { ref, onMounted, onUnmounted } from "vue";

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
    <img class="bg-image-sub" src="/assets/bg_resized.jpg" />
    <img ref="bgImageRef" class="bg-image" :style="bgImageStyle" src="/assets/bg_resized.jpg" />
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
  top: 24px;
  z-index: 999999;
}

.main {
  width: 1000px;
  margin: 0 auto;
  flex: 1;

  display: flex;
  flex-direction: column;

  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0px 0px 8px rgba(0, 0, 0, 0.25);
}
.content {
  padding: 154px 32px 32px;
  flex-grow: 1;
}

.bg-dimmer {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.7);
  z-index: -1;
}
.bg-image {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  z-index: -2;
  box-shadow: 0 0 4px 2px rgba(0, 0, 0, 0.25);
}
.bg-image-sub {
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 100vw;
  z-index: -3;
  filter: blur(20px);
}
</style>
