import { createRouter, createWebHistory } from "vue-router";
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import AdminLayout from "@/layouts/AdminLayout.vue";
import { useAuthStore } from "@/stores/auth";
import { useConfigStore } from "@/stores/config";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      component: DefaultLayout,
      children: [
        {
          path: "",
          name: "home",
          component: () => import("@/views/HomeView.vue"),
        },
        {
          path: "about",
          name: "about",
          component: () => import("@/views/AboutView.vue"),
          meta: { configKey: "showAboutTab" },
        },
        {
          path: "news",
          name: "news",
          component: () => import("@/views/NewsView.vue"),
          meta: { configKey: "showNewsTab" },
        },
        {
          path: "news/write",
          name: "news-write",
          component: () => import("@/views/news/WriteView.vue"),
          meta: { requiresAdmin: true },
        },
        {
          path: "news/:id",
          name: "news-detail",
          component: () => import("@/views/news/DetailView.vue"),
          meta: { configKey: "showNewsTab" },
        },
        {
          path: "events",
          name: "events",
          component: () => import("@/views/EventsView.vue"),
          meta: { configKey: "showEventsTab" },
        },
        {
          path: "works",
          name: "works",
          component: () => import("@/views/WorksView.vue"),
          meta: { configKey: "showWorksTab" },
        },
        {
          path: "gallery",
          name: "gallery",
          component: () => import("@/views/GalleryView.vue"),
          meta: { configKey: "showGalleryTab" },
        },
      ],
    },
    {
      path: "/admin",
      component: AdminLayout,
      meta: { requiresAdmin: true },
      children: [
        {
          path: "",
          name: "admin",
          component: () => import("@/views/admin/DashboardView.vue"),
          meta: { requiresAdmin: true, title: "대시보드" },
        },
        {
          path: "banners",
          name: "admin-banners",
          component: () => import("@/views/admin/BannersEditView.vue"),
          meta: { requiresAdmin: true, title: "홈 배너 관리" },
        },
        {
          path: "config",
          name: "admin-config",
          component: () => import("@/views/admin/ToggleFeaturesView.vue"),
          meta: { requiresAdmin: true, title: "사이트 기능 켜기/끄기" },
        },
      ],
    },
  ],
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  const configStore = useConfigStore();

  if (!authStore.isInitialized) {
    // 앱 초기화 전이면 세션 확인을 기다립니다.
    await authStore.checkAuth();
  }

  if (to.meta.requiresAdmin) {
    if (!authStore.isAdmin) {
      alert("관리자 권한이 필요합니다.");
      return next({ name: "home" });
    }
  }

  // 메뉴 숨김 설정 확인 (관리자는 무시)
  if (to.meta.configKey && !authStore.isAdmin) {
    if (!configStore.isLoaded) {
      await configStore.fetchConfig();
    }
    const key = to.meta.configKey as keyof typeof configStore.config;
    const isFeatureEnabled = configStore.config && configStore.config[key];

    if (!isFeatureEnabled) {
      return next({ name: "home" });
    }
  }

  next();
});

export default router;
