<script setup lang="ts">
import { ref, watchEffect } from "vue";
import { useConfigStore } from "@/stores/config";

const configStore = useConfigStore();
const isSaving = ref(false);

const featureStates = ref({
  About: "FULL",
  News: "FULL",
  Events: "FULL",
  Works: "FULL",
  Gallery: "FULL",
});

const featuresList = [
  { key: "About", label: "소개 (About)" },
  { key: "News", label: "소식 (News)" },
  { key: "Events", label: "행사 (Events)" },
  { key: "Works", label: "작품 (Works)" },
  { key: "Gallery", label: "갤러리 (Gallery)" },
];

const mapConfigToState = (tab: boolean, box: boolean) => {
  if (tab && box) return "FULL";
  if (tab && !box) return "TAB";
  return "HIDDEN";
};

watchEffect(() => {
  if (configStore.config) {
    featureStates.value.About = mapConfigToState(
      configStore.config.showAboutTab,
      configStore.config.showAboutBox
    );
    featureStates.value.News = mapConfigToState(
      configStore.config.showNewsTab,
      configStore.config.showNewsBox
    );
    featureStates.value.Events = mapConfigToState(
      configStore.config.showEventsTab,
      configStore.config.showEventsBox
    );
    featureStates.value.Works = mapConfigToState(
      configStore.config.showWorksTab,
      configStore.config.showWorksBox
    );
    featureStates.value.Gallery = mapConfigToState(
      configStore.config.showGalleryTab,
      configStore.config.showGalleryBox
    );
  }
});

const handleSave = async () => {
  isSaving.value = true;
  try {
    const payload = {
      showAboutTab: featureStates.value.About !== "HIDDEN",
      showAboutBox: featureStates.value.About === "FULL",
      showNewsTab: featureStates.value.News !== "HIDDEN",
      showNewsBox: featureStates.value.News === "FULL",
      showEventsTab: featureStates.value.Events !== "HIDDEN",
      showEventsBox: featureStates.value.Events === "FULL",
      showWorksTab: featureStates.value.Works !== "HIDDEN",
      showWorksBox: featureStates.value.Works === "FULL",
      showGalleryTab: featureStates.value.Gallery !== "HIDDEN",
      showGalleryBox: featureStates.value.Gallery === "FULL",
    };
    await configStore.updateConfig(payload);
  } finally {
    isSaving.value = false;
  }
};
</script>

<template>
  <div class="master-toggle-features-view">
    <el-card shadow="never" v-loading="configStore.isLoading">
      <template #header>
        <div class="card-header">
          <span>사이트 기능 켜기/끄기</span>
        </div>
      </template>
      <el-table :data="featuresList" border style="width: 100%" class="features-table">
        <el-table-column prop="label" label="메뉴명" width="200" />
        <el-table-column label="표시 설정">
          <template #default="{ row }">
            <el-radio-group v-model="featureStates[row.key as keyof typeof featureStates]">
              <el-radio-button value="FULL">홈 화면 + 메뉴 표시</el-radio-button>
              <el-radio-button value="TAB">메뉴만 표시 (홈 화면 숨김)</el-radio-button>
              <el-radio-button value="HIDDEN">모두 숨김</el-radio-button>
            </el-radio-group>
          </template>
        </el-table-column>
      </el-table>

      <div class="form-actions">
        <el-button type="primary" :loading="isSaving" @click="handleSave">설정 저장</el-button>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.master-toggle-features-view {
  width: 100%;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #eee;
}
</style>
