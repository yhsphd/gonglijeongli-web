import { api } from "./client";

export interface SiteConfig {
  id: number;
  showAboutTab: boolean;
  showNewsTab: boolean;
  showEventsTab: boolean;
  showWorksTab: boolean;
  showGalleryTab: boolean;
  showAboutBox: boolean;
  showNewsBox: boolean;
  showEventsBox: boolean;
  showWorksBox: boolean;
  showGalleryBox: boolean;
}

export const configApi = {
  getConfig: () => api<SiteConfig>("/config"),
  updateConfig: (config: Partial<SiteConfig>) =>
    api<SiteConfig>("/config", {
      method: "PUT",
      body: JSON.stringify(config),
    }),
};
