<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import AdminModal from "@/components/common/AdminModal.vue";
import FormInput from "@/components/common/FormInput.vue";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { faCodeBranch } from "@fortawesome/free-solid-svg-icons";

const authStore = useAuthStore();
const router = useRouter();

// 빌드 정보
const commitHash = __COMMIT_HASH__;
const buildTime = __BUILD_TIME__;
const isDev = import.meta.env.DEV;

// 로그인 모달
const showLoginModal = ref(false);
const loginError = ref("");
const loginForm = ref({ username: "", password: "" });

const openLoginModal = () => {
  loginForm.value = { username: "", password: "" };
  loginError.value = "";
  showLoginModal.value = true;
};

const handleLogin = async () => {
  loginError.value = "";
  try {
    await authStore.login(loginForm.value.username, loginForm.value.password);
    showLoginModal.value = false;
  } catch {
    loginError.value = "아이디 또는 비밀번호가 올바르지 않습니다.";
  }
};

const handleLogout = async () => {
  await authStore.logout();
};
</script>

<template>
  <div class="footer">
    <div class="footer-content">
      <p>&copy; 2026 공리와정리. All rights reserved.</p>
      <div class="footer-meta">
        <a
          href="https://github.com/yhsphd/gonglijeongli-web"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FontAwesomeIcon :icon="faGithub" />
        </a>
        <span class="divider">|</span>
        <span class="version-info">
          <FontAwesomeIcon :icon="faCodeBranch" />
          <template v-if="isDev"> Development Server</template>
          <template v-else> {{ commitHash }} ({{ buildTime }})</template>
        </span>
      </div>
    </div>
    <button v-if="!authStore.isAdmin" class="btn-admin" @click="openLoginModal">관리자</button>
    <div v-else class="btn-admin-group">
      <button class="btn-admin btn-admin--enter" @click="router.push({ name: 'admin' })">
        관리자 페이지
      </button>
      <button class="btn-admin btn-admin--active" @click="handleLogout">
        로그아웃 ({{ authStore.username }})
      </button>
    </div>

    <!-- 로그인 모달 -->
    <AdminModal
      :open="showLoginModal"
      title="관리자 로그인"
      submit-label="로그인"
      :is-submitting="authStore.isLoading"
      @close="showLoginModal = false"
      @submit="handleLogin"
    >
      <FormInput v-model="loginForm.username" label="아이디" placeholder="관리자 아이디" required />
      <FormInput
        v-model="loginForm.password"
        label="비밀번호"
        type="password"
        placeholder="비밀번호"
        required
      />
      <p v-if="loginError" class="login-error">{{ loginError }}</p>
    </AdminModal>
  </div>
</template>

<style scoped>
.footer {
  position: relative;
  text-align: center;
  padding: var(--spacing-lg);
  background-color: var(--color-bg-secondary);
  color: var(--color-text-muted);
}

.footer-content p {
  margin: 0 0 var(--spacing-xs) 0;
}

.footer-meta {
  font-size: var(--font-size-xs);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  color: var(--color-text-muted);
}

.footer-meta a {
  color: inherit;
  text-decoration: none;
  transition: color 0.2s;
}

.footer-meta a:hover {
  color: var(--color-primary);
}

.divider {
  opacity: 0.5;
}

.btn-admin-group {
  position: absolute;
  right: var(--spacing-md);
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  gap: var(--spacing-xs);
}

.btn-admin {
  position: absolute;
  right: var(--spacing-md);
  top: 50%;
  transform: translateY(-50%);
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid var(--color-border);
  background: transparent;
  color: var(--color-text-muted);
  font-family: var(--font-family-base);
  font-size: var(--font-size-xs);
  cursor: pointer;
  transition: all 0.2s;
}

.btn-admin-group .btn-admin {
  position: static;
  transform: none;
}

.btn-admin:hover {
  color: var(--color-text-primary);
  border-color: var(--color-text-primary);
}

.btn-admin--enter {
  color: var(--color-primary, #409eff);
  border-color: var(--color-primary, #409eff);
}

.btn-admin--enter:hover {
  color: var(--color-primary, #409eff);
  border-color: var(--color-primary, #409eff);
  opacity: 0.8;
}

.btn-admin--active {
  color: var(--color-text-secondary);
  border-color: var(--color-text-secondary);
}

.login-error {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--color-danger);
}

@media (max-width: 768px) {
  .footer {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-md);
  }

  .btn-admin-group {
    position: static;
    transform: none;
    margin-top: var(--spacing-sm);
  }

  .btn-admin {
    position: static;
    transform: none;
    margin-top: var(--spacing-sm);
  }
}
</style>
