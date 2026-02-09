<script setup lang="ts">
import { RouterLink } from "vue-router";

const menus = [
  { label: ["소개", "About"], to: "/about" },
  { label: ["소식", "News"], to: "/news" },
  { label: ["행사", "Events"], to: "/events" },
  { label: ["작품", "Works"], to: "/works" },
  { label: ["갤러리", "Gallery"], to: "/gallery" },
];
</script>

<template>
  <div class="master-app-header">
    <div class="contents">
      <RouterLink class="logo-container" to="/">
        <img src="/assets/logo.svg" />
        <img src="/assets/logo.svg" />
      </RouterLink>
      <div class="flex-grow"></div>
      <RouterLink class="nav" v-for="(menu, i) in menus" :key="i" :to="menu.to">
        <p>{{ menu.label[0] }}</p>
        <p>{{ menu.label[1] }}</p>
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>
.master-app-header {
  position: fixed;
  width: 100%;
  height: 96px;

  display: flex;
  justify-content: center;

  background: rgba(255, 255, 255, 0.7);
  border-width: 1px 0px;
  border-style: solid;
  border-color: rgba(0, 0, 0, 0.3);
  box-shadow: 0px 4px 30px 4px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(2.5px);
}
.contents {
  width: 1000px;
  display: flex;
  align-items: center;
  padding: 0px 36px;
}

.logo-container {
  position: relative;
  height: 54px;
}
.logo-container > img {
  position: absolute;
  height: 54px;
}
.logo-container > img:nth-child(2) {
  opacity: 0.5;
  filter: blur(2px);
}

.nav {
  width: 96px;
  text-align: center;

  font-style: normal;
  text-decoration: none;
  color: black;
}
.nav > p:nth-child(1) {
  font-size: 24px;
}
.nav > p:nth-child(2) {
  font-size: 12px;
}
</style>
