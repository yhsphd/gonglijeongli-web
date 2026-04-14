<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const pageTitle = computed(() => String(route.meta.title ?? "관리자"));

const handleLogout = async () => {
  await authStore.logout();
  router.push({ name: "home" });
};
</script>

<template>
  <el-container class="admin-layout">
    <!-- Sidebar -->
    <el-aside width="220px" class="admin-sidebar">
      <div class="sidebar-logo">
        <span class="logo-text">공리와정리</span>
        <span class="logo-sub">관리자</span>
      </div>
      <el-menu
        :default-active="route.name as string"
        router
        active-text-color="#409eff"
        background-color="#1a1d23"
        text-color="#c0c5cf"
        class="sidebar-menu"
      >
        <el-menu-item index="admin">
          <el-icon><i-ep-home-filled /></el-icon>
          <span>대시보드</span>
        </el-menu-item>
        <!-- 새로운 관리 메뉴는 여기에 추가 -->
      </el-menu>
    </el-aside>

    <el-container class="admin-body">
      <!-- Top Header -->
      <el-header class="admin-header">
        <span class="header-title">{{ pageTitle }}</span>
        <div class="header-right">
          <span class="header-user">
            <el-icon><i-ep-user /></el-icon>
            {{ authStore.username }}
          </span>
          <el-divider direction="vertical" />
          <el-button type="danger" plain size="small" @click="handleLogout"> 로그아웃 </el-button>
          <el-button size="small" @click="() => router.push({ name: 'home' })">
            사이트로
          </el-button>
        </div>
      </el-header>

      <!-- Main Content -->
      <el-main class="admin-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.admin-layout {
  height: 100vh;
  overflow: hidden;

  /* 관리자 페이지 전용 타이포그래피 - 기존 main.css와 완전 분리 */
  --el-font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-family-base: var(--el-font-family);
  font-family: var(--el-font-family);
}

/* ── Sidebar ── */
.admin-sidebar {
  background-color: #1a1d23;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 28px 16px 20px;
  border-bottom: 1px solid #2e3340;
  gap: 2px;
}
.logo-text {
  font-size: 16px;
  font-weight: 700;
  color: #e0e4ef;
  letter-spacing: -0.02em;
}
.logo-sub {
  font-size: 11px;
  color: #5a6072;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.sidebar-menu {
  flex: 1;
  border-right: none;
}

/* ── Header ── */
.admin-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  padding: 0 24px;
  height: 56px;
}

.header-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}
.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}
.header-user {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #606266;
}

/* ── Main ── */
.admin-main {
  background: #f5f7fa;
  overflow-y: auto;
  padding: 24px;
}
</style>
