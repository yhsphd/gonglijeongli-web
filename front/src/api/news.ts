/**
 * News API 서비스
 */

import { api } from "./client";

export interface NewsItem {
  id: number;
  title: string;
  content: string;
  thumbnail?: string | null;
  date: string;
  views: number;
  likes: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface NewsListItem {
  id: number;
  title: string;
  thumbnail?: string | null;
  date: string;
  views: number;
  likes: number;
}

export interface NewsFormData {
  title: string;
  content: object | string;
  date: string;
  likes?: number;
}

interface PaginatedResponse<T> {
  items: T[];
  total: number;
}

/** 뉴스/공지사항 목록 조회 (페이지네이션) */
export function fetchNewsList(page = 1, limit = 10) {
  return api<PaginatedResponse<NewsListItem>>("/news", {
    params: { page, limit },
  });
}

/** 뉴스 상세 조회 */
export function fetchNewsDetail(id: number) {
  return api<NewsItem>(`/news/${id}`);
}

/** 뉴스 작성 (관리자) */
export function createNews(data: NewsFormData) {
  return api<NewsItem>("/news", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/** 뉴스 수정 (관리자) */
export function updateNews(id: number, data: Partial<NewsFormData>) {
  return api<NewsItem>(`/news/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/** 뉴스 삭제 (관리자) */
export function deleteNews(id: number) {
  return api<void>(`/news/${id}`, {
    method: "DELETE",
  });
}
