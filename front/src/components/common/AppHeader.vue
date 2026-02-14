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
        <img src="@/assets/img/logo.svg" />
        <img src="@/assets/img/logo.svg" />
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
  height: var(--layout-header-height);

  display: flex;
  justify-content: center;

  background: var(--color-bg-overlay);
  border-width: 1px 0px;
  border-style: solid;
  border-color: var(--color-border);
  box-shadow: var(--shadow-md);
  backdrop-filter: var(--blur-sm);
}
.contents {
  width: var(--layout-content-width);
  display: flex;
  align-items: center;
  padding: 0 var(--spacing-2-25xl);
}

.logo-container {
  position: relative;
  height: var(--header-logo-height);
}
.logo-container > img {
  position: absolute;
  height: var(--header-logo-height);
}
.logo-container > img:nth-child(2) {
  opacity: 0.5;
  filter: blur(2px);
}

.nav {
  width: var(--header-nav-width);
  text-align: center;

  font-style: normal;
  text-decoration: none;
  color: var(--color-text-primary);
}
.nav > p:nth-child(1) {
  font-size: var(--font-size-lg);
}
.nav > p:nth-child(2) {
  font-size: var(--font-size-xs);
}
</style>
