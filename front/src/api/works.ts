/**
 * Works API 서비스
 */

import { api } from "./client";

export interface WorkItem {
  id: number;
  title: string;
  description?: string;
  date: string;
  thumb?: string;
  link?: string;
  tags: string[];
}

export interface WorkFormData {
  title: string;
  description: string;
  date: string;
  thumb: string;
  link: string;
  tags: string[];
}

interface PaginatedResponse<T> {
  items: T[];
  total: number;
}

/** 작품 목록 조회 API */
export function fetchWorks(page = 1, limit = 9) {
  return api<PaginatedResponse<WorkItem>>("/works", {
    params: { page, limit },
  });
}

/** 작품 생성 (관리자) */
export function createWork(data: WorkFormData) {
  return api<WorkItem>("/works", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/** 작품 수정 (관리자) */
export function updateWork(id: number, data: Partial<WorkFormData>) {
  return api<WorkItem>(`/works/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/** 작품 삭제 (관리자) */
export function deleteWork(id: number) {
  return api<void>(`/works/${id}`, {
    method: "DELETE",
  });
}
