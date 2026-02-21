import { createApp } from "vue";
import { createPinia } from "pinia";

// FontAwesome
import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faPen, faTrash, faXmark } from "@fortawesome/free-solid-svg-icons";

import App from "./App.vue";
import router from "./router";

import "./assets/styles/main.css";

// FontAwesome 아이콘 등록
library.add(faPen, faTrash, faXmark);

const app = createApp(App);

app.component("FontAwesomeIcon", FontAwesomeIcon);
app.use(createPinia());
app.use(router);

app.mount("#app");
