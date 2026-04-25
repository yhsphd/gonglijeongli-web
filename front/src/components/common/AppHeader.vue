<script setup lang="ts">
import { ref, computed } from "vue";
import { RouterLink, useRoute } from "vue-router";
import { useConfigStore } from "@/stores/config";
import { useAuthStore } from "@/stores/auth";

const route = useRoute();
const configStore = useConfigStore();
const authStore = useAuthStore();
const isMobileMenuOpen = ref(false);

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

const menus = computed(() => {
  const allMenus = [];
  const isAdmin = authStore.isAdmin;
  if (configStore.config?.showAboutTab || isAdmin)
    allMenus.push({ label: ["소개", "About"], to: "/about" });
  if (configStore.config?.showNewsTab || isAdmin)
    allMenus.push({ label: ["소식", "News"], to: "/news" });
  if (configStore.config?.showEventsTab || isAdmin)
    allMenus.push({ label: ["행사", "Events"], to: "/events" });
  if (configStore.config?.showWorksTab || isAdmin)
    allMenus.push({ label: ["작품", "Works"], to: "/works" });
  if (configStore.config?.showGalleryTab || isAdmin)
    allMenus.push({ label: ["갤러리", "Gallery"], to: "/gallery" });
  return allMenus;
});

const currentPath = computed(() => route.path);

const isMenuActive = (menuPath: string) => {
  return (
    currentPath.value === menuPath ||
    currentPath.value.startsWith(`${menuPath}/`) ||
    currentPath.value.startsWith(`${menuPath}?`)
  );
};

// 모바일 드롭다운 버튼에 표시될 현재 메뉴 이름
const currentMenuLabel = computed(() => {
  const activeMenu = menus.value.find((m) => isMenuActive(m.to));
  return activeMenu ? activeMenu.label[0] : "홈";
});
</script>

<template>
  <div class="master-app-header">
    <div class="contents">
      <RouterLink class="logo-container" to="/">
        <img src="@/assets/img/logo.svg" />
        <img src="@/assets/img/logo.svg" />
      </RouterLink>
      <div class="flex-grow"></div>

      <!-- Desktop Nav -->
      <div class="desktop-nav">
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

      <!-- Mobile Nav Toggle & Dropdown -->
      <div class="mobile-dropdown-container">
        <!-- Overlay -->
        <div
          v-if="isMobileMenuOpen"
          class="mobile-dropdown-overlay"
          @click="isMobileMenuOpen = false"
        ></div>

        <button class="mobile-menu-toggle" @click="toggleMobileMenu">
          <span class="current-label">{{ currentMenuLabel }}</span>
          <span class="caret-icon" :class="{ rotate: isMobileMenuOpen }">▼</span>
        </button>

        <Transition name="dropdown">
          <div class="mobile-dropdown" v-show="isMobileMenuOpen" @click="isMobileMenuOpen = false">
            <RouterLink
              class="mobile-nav-item"
              :class="{ 'is-active': isMenuActive(menu.to) }"
              v-for="(menu, i) in menus"
              :key="i"
              :to="menu.to"
            >
              <span>{{ menu.label[0] }}</span>
              <span class="en">{{ menu.label[1] }}</span>
            </RouterLink>
          </div>
        </Transition>
      </div>
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
  width: 100%;
  max-width: var(--layout-content-width);
  display: flex;
  align-items: center;
  padding: 0 var(--spacing-2-25xl);
}

.logo-container {
  position: relative;
  height: var(--header-logo-height);
}
.logo-container > img:nth-child(1) {
  position: static;
  height: var(--header-logo-height);
  display: block;
}
.logo-container > img:nth-child(2) {
  position: absolute;
  top: 0;
  left: 0;
  height: var(--header-logo-height);
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

.nav-indicator {
  position: relative;
  width: 6px;
  height: 6px;
  transform: rotate(45deg);
  background: var(--color-text-primary);
  opacity: 0;
  transition: opacity 0.2s ease;
}

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

.nav:hover {
  gap: var(--spacing-xs);
  opacity: 1;
}

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

.desktop-nav {
  display: flex;
  align-items: center;
}

.mobile-dropdown-container {
  display: none;
  position: relative;
}

.mobile-dropdown-overlay {
  position: fixed;
  inset: 0;
  z-index: 990;
}

.mobile-menu-toggle {
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
  font-family: inherit;
  font-weight: var(--font-weight-bold);
  cursor: pointer;
  padding: var(--spacing-sm) var(--spacing-lg);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  position: relative;
  justify-content: right;
}

.caret-icon {
  font-size: 0.6em;
  transition: transform 0.2s ease;
  transform-origin: 50% 45%;
}
.caret-icon.rotate {
  transform: rotate(180deg);
}

.mobile-dropdown {
  position: absolute;
  top: calc(100% + var(--spacing-xs));
  right: 0;
  width: max-content;
  min-width: 12rem;
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-md);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 1000;
}

.mobile-nav-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-lg);
  color: var(--color-text-primary);
  text-decoration: none;
  font-size: var(--font-size-base);
  border-bottom: 1px solid var(--color-border);
}
.mobile-nav-item:last-child {
  border-bottom: none;
}
.mobile-nav-item:hover,
.mobile-nav-item.is-active {
  background: var(--color-bg-subtle);
  font-weight: var(--font-weight-bold);
}
.mobile-nav-item .en {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-0.5rem);
}

@media (max-width: 1040px) {
  .contents {
    padding: 0 var(--spacing-md);
  }
}

@media (max-width: 800px) {
  .nav {
    width: auto;
    padding: 0 var(--spacing-sm);
  }
  .nav-label {
    font-size: var(--font-size-base);
  }
  .nav.router-link-active .nav-indicator::after,
  .nav.is-active .nav-indicator::after {
    width: 2rem;
  }
}

@media (max-width: 500px) {
  .desktop-nav {
    display: none;
  }
  .mobile-dropdown-container {
    display: block;
  }
}
</style>
