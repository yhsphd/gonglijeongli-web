<script setup lang="ts">
import { computed } from "vue";
import { RouterLink, useRoute } from "vue-router";

const route = useRoute();

const menus = [
  { label: ["소개", "About"], to: "/about" },
  { label: ["소식", "News"], to: "/news" },
  { label: ["행사", "Events"], to: "/events" },
  { label: ["작품", "Works"], to: "/works" },
  { label: ["갤러리", "Gallery"], to: "/gallery" },
];

const currentPath = computed(() => route.path);

const isMenuActive = (menuPath: string) => {
  return (
    currentPath.value === menuPath ||
    currentPath.value.startsWith(`${menuPath}/`) ||
    currentPath.value.startsWith(`${menuPath}?`)
  );
};
</script>

<template>
  <div class="master-app-header">
    <div class="contents">
      <RouterLink class="logo-container" to="/">
        <img src="@/assets/img/logo.svg" />
        <img src="@/assets/img/logo.svg" />
      </RouterLink>
      <div class="flex-grow"></div>
      <RouterLink
        class="nav"
        :class="{ 'is-active': isMenuActive(menu.to) }"
        v-for="(menu, i) in menus"
        :key="i"
        :to="menu.to"
      >
        <span class="nav-label">{{ menu.label[0] }}</span>
        <span class="nav-indicator"></span>
        <span class="nav-label-en">{{ menu.label[1] }}</span>
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
  z-index: var(--z-header);
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
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;

  font-style: normal;
  text-decoration: none;
  color: var(--color-text-primary);
  transition: gap 0.2s ease;
  opacity: 0.8;
}

.nav-label {
  font-size: var(--font-size-lg);
  line-height: 1.2;
}

.nav-label-en {
  font-size: var(--font-size-xs);
  line-height: 1.2;
}

/* Indicator - 45도 회전 정사각형 */
.nav-indicator {
  position: relative;
  width: 6px;
  height: 6px;
  transform: rotate(45deg);
  background: var(--color-text-primary);
  opacity: 0;
  transition: opacity 0.2s ease;
}

/* 가로선 (active 상태에서만 표시) */
.nav-indicator::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 1px;
  background: var(--color-text-primary);
  transform: translate(-50%, -50%) rotate(-45deg);
  transition: width 250ms ease-in-out;
}

/* Hover 효과 */
.nav:hover {
  gap: var(--spacing-xs);
  opacity: 1;
}

/* Active 상태 (현재 페이지) */
.nav.router-link-active,
.nav.is-active {
  opacity: 1;
  gap: var(--spacing-xs);
  font-weight: bold;
}

.nav:hover .nav-indicator,
.nav.router-link-active .nav-indicator,
.nav.is-active .nav-indicator {
  opacity: 1;
}
.nav.router-link-active .nav-indicator::after,
.nav.is-active .nav-indicator::after {
  width: 5rem;
}
</style>
