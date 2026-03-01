/**
 * API 클라이언트 유틸리티
 *
 * fetch API를 래핑하여 백엔드 API 호출을 간편하게 합니다.
 * - baseURL 자동 설정
 * - credentials: "include"로 세션 쿠키 자동 포함
 * - JSON 응답 자동 파싱
 * - 에러 핸들링
 */

// 개발 시: Vite 프록시가 /api/* → http://localhost:3000/api/* 로 전달
// 프로덕션: 같은 도메인에서 서빙하거나 VITE_API_BASE 환경변수로 설정
const API_BASE = import.meta.env.VITE_API_BASE || "/api";

interface ApiOptions extends RequestInit {
  params?: Record<string, string | number>;
}

/**
 * API 요청 함수
 *
 * 사용 예:
 *   const data = await api<{ items: Event[], total: number }>("/events", { params: { page: 1, limit: 10 } });
 *   await api("/events", { method: "POST", body: JSON.stringify(newEvent) });
 */
export async function api<T = unknown>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { params, ...fetchOptions } = options;

  // 쿼리 파라미터 처리
  let url = `${API_BASE}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      searchParams.set(key, String(value));
    }
    url += `?${searchParams.toString()}`;
  }

  const response = await fetch(url, {
    ...fetchOptions,
    credentials: "include", // 세션 쿠키 포함
    headers: {
      "Content-Type": "application/json",
      ...fetchOptions.headers,
    },
  });

  // 204 No Content (DELETE 응답)
  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(response.status, data.message || "API 요청에 실패했습니다.");
  }

  return data as T;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}
