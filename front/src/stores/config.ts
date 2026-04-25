import { defineStore } from "pinia";
import { ref } from "vue";
import { configApi, type SiteConfig } from "@/api/config";
import { ElMessage } from "element-plus";

export const useConfigStore = defineStore("config", () => {
  const config = ref<SiteConfig>({
    id: 1,
    showAboutTab: true,
    showNewsTab: true,
    showEventsTab: true,
    showWorksTab: true,
    showGalleryTab: true,
    showAboutBox: true,
    showNewsBox: true,
    showEventsBox: true,
    showWorksBox: true,
    showGalleryBox: true,
  });

  const isLoaded = ref(false);
  const isLoading = ref(false);

  const fetchConfig = async () => {
    isLoading.value = true;
    try {
      const data = await configApi.getConfig();
      config.value = data;
      isLoaded.value = true;
    } catch (error) {
      console.error("Failed to load site config:", error);
      ElMessage.error("사이트 설정을 불러오는데 실패했습니다.");
    } finally {
      isLoading.value = false;
    }
  };

  const updateConfig = async (newConfig: Partial<SiteConfig>) => {
    try {
      const data = await configApi.updateConfig(newConfig);
      config.value = data;
      ElMessage.success("사이트 설정이 업데이트 되었습니다.");
    } catch (error) {
      console.error("Failed to update site config:", error);
      ElMessage.error("사이트 설정 업데이트에 실패했습니다.");
      throw error;
    }
  };

  return {
    config,
    isLoaded,
    isLoading,
    fetchConfig,
    updateConfig,
  };
});
