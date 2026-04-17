import { api } from "./client";

export interface BannerItem {
  id: number;
  imageUrl: string;
  linkUrl: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BannerFormData {
  imageUrl: string;
  linkUrl?: string | null;
  displayOrder?: number;
  isActive?: boolean;
}

/** 배너 목록 조회 */
export function fetchBanners(activeOnly = false) {
  return api<BannerItem[]>("/banners", {
    params: activeOnly ? { activeOnly: "true" } : undefined,
  });
}

/** 배너 생성 (관리자) */
export function createBanner(data: BannerFormData) {
  return api<BannerItem>("/banners", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/** 배너 수정 (관리자) */
export function updateBanner(id: number, data: Partial<BannerFormData>) {
  return api<BannerItem>(`/banners/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/** 배너 삭제 (관리자) */
export function deleteBanner(id: number) {
  return api<void>(`/banners/${id}`, {
    method: "DELETE",
  });
}
