/**
 * 인증 상태 Pinia 스토어
 *
 * 앱 전체에서 관리자 로그인 상태를 공유합니다.
 * - 앱 시작 시 checkAuth()로 세션 확인
 * - 로그인/로그아웃 시 상태 자동 업데이트
 */

import { ref } from "vue";
import { defineStore } from "pinia";
import { getAuthStatus, login as apiLogin, logout as apiLogout } from "@/api/auth";

export const useAuthStore = defineStore("auth", () => {
  const isAdmin = ref(false);
  const username = ref<string | undefined>();
  const isLoading = ref(false);
  const isInitialized = ref(false);

  /** 서버에 현재 세션 상태를 확인 */
  async function checkAuth() {
    try {
      const status = await getAuthStatus();
      isAdmin.value = status.isAdmin;
      username.value = status.username;
    } catch {
      isAdmin.value = false;
      username.value = undefined;
    } finally {
      isInitialized.value = true;
    }
  }

  /** 로그인 */
  async function login(user: string, password: string) {
    isLoading.value = true;
    try {
      await apiLogin(user, password);
      await checkAuth(); // 로그인 후 상태 갱신
    } finally {
      isLoading.value = false;
    }
  }

  /** 로그아웃 */
  async function logout() {
    await apiLogout();
    isAdmin.value = false;
    username.value = undefined;
  }

  return { isAdmin, username, isLoading, isInitialized, checkAuth, login, logout };
});
