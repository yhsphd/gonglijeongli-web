/**
 * Auth API 서비스
 *
 * 로그인/로그아웃/세션 확인 API 호출 함수들.
 */

import { api } from "./client";

export interface AuthStatus {
  isAdmin: boolean;
  username?: string;
}

/** 로그인 */
export function login(username: string, password: string) {
  return api<{ message: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

/** 로그아웃 */
export function logout() {
  return api<{ message: string }>("/auth/logout", {
    method: "POST",
  });
}

/** 현재 세션 상태 확인 */
export function getAuthStatus() {
  return api<AuthStatus>("/auth/me");
}
