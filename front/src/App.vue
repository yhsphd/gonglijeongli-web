<script setup lang="ts">
import { onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useConfigStore } from "@/stores/config";

const authStore = useAuthStore();
const configStore = useConfigStore();

// 앱 시작 시 세션 상태 및 설정 확인
onMounted(() => {
  authStore.checkAuth();
  configStore.fetchConfig();
});
</script>

<template>
  <RouterView />
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body,
#app {
  min-height: 100%;
}
</style>
