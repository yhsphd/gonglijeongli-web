import { createApp } from "vue";
import { createPinia } from "pinia";

// FontAwesome
import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import {
  faPen,
  faTrash,
  faXmark,
  faChevronLeft,
  faChevronRight,
  faPalette,
  faImage,
} from "@fortawesome/free-solid-svg-icons";
import { faXTwitter } from "@fortawesome/free-brands-svg-icons";

import App from "./App.vue";
import router from "./router";

import "./assets/styles/main.css";

// FontAwesome 아이콘 등록
library.add(faPen, faTrash, faXmark, faChevronLeft, faChevronRight, faPalette, faImage, faXTwitter);

const app = createApp(App);

app.component("FontAwesomeIcon", FontAwesomeIcon);
app.use(createPinia());
app.use(router);

app.mount("#app");

// 개발 서버인 경우 페이지 제목에 접두어 추가
if (import.meta.env.DEV) {
  document.title = `[DEV] ${document.title}`;
}
