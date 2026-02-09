import { createRouter, createWebHistory } from "vue-router";
import DefaultLayout from "@/layouts/DefaultLayout.vue";

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
  ],
});

export default router;
