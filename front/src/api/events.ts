/**
 * Events API 서비스
 *
 * EventsView에서 사용하는 행사 관련 API 호출 함수들.
 * api() 유틸을 통해 백엔드와 통신합니다.
 */

import { api } from "./client";

// swagger.yaml의 EventItem 스키마와 일치
export interface EventItem {
  id: number;
  title: string;
  date: string;
  location: string;
  thumb?: string | null;
  link?: string | null;
  status: "upcoming" | "ongoing" | "ended";
}

// 행사 생성/수정 시 사용하는 폼 데이터 타입 (id 제외)
export interface EventFormData {
  title: string;
  date: string;
  location: string;
  thumb: string;
  link: string;
  status: "upcoming" | "ongoing" | "ended";
}

// 페이지네이션 응답 타입
interface PaginatedResponse<T> {
  items: T[];
  total: number;
}

/** 행사 목록 조회 (페이지네이션) */
export function fetchEvents(page = 1, limit = 9) {
  return api<PaginatedResponse<EventItem>>("/events", {
    params: { page, limit },
  });
}

/** 행사 생성 (관리자) */
export function createEvent(data: EventFormData) {
  return api<EventItem>("/events", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/** 행사 수정 (관리자) */
export function updateEvent(id: number, data: Partial<EventFormData>) {
  return api<EventItem>(`/events/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/** 행사 삭제 (관리자) */
export function deleteEvent(id: number) {
  return api<void>(`/events/${id}`, {
    method: "DELETE",
  });
}
