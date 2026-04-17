import { createRouter, createWebHistory } from "vue-router";
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import AdminLayout from "@/layouts/AdminLayout.vue";
import { useAuthStore } from "@/stores/auth";

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
        },
        {
          path: "news",
          name: "news",
          component: () => import("@/views/NewsView.vue"),
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
        },
        {
          path: "events",
          name: "events",
          component: () => import("@/views/EventsView.vue"),
        },
        {
          path: "works",
          name: "works",
          component: () => import("@/views/WorksView.vue"),
        },
        {
          path: "gallery",
          name: "gallery",
          component: () => import("@/views/GalleryView.vue"),
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
          component: () => import("@/views/admin/AdminView.vue"),
          meta: { requiresAdmin: true, title: "대시보드" },
        },
        {
          path: "banners",
          name: "admin-banners",
          component: () => import("@/views/admin/BannersAdminView.vue"),
          meta: { requiresAdmin: true, title: "홈 배너 관리" },
        },
      ],
    },
  ],
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAdmin) {
    if (!authStore.isInitialized) {
      // 앱 초기화 전이면 세션 확인을 기다립니다.
      await authStore.checkAuth();
    }

    if (!authStore.isAdmin) {
      alert("관리자 권한이 필요합니다.");
      return next({ name: "home" });
    }
  }

  next();
});

export default router;
