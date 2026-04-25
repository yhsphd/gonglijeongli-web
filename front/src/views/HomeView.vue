<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { RouterLink } from "vue-router";
import ListBox from "@/components/home/ListBox.vue";
import PostEntry from "@/components/home/PostEntry.vue";
import ThumbEntry from "@/components/home/ThumbEntry.vue";
import HeroCarousel from "@/components/home/HeroCarousel.vue";
import { fetchNewsList, type NewsListItem } from "@/api/news";
import { fetchEvents, type EventItem } from "@/api/events";
import { fetchWorks, type WorkItem } from "@/api/works";
import { useConfigStore } from "@/stores/config";
import { useAuthStore } from "@/stores/auth";
// import GalleryCarousel from "@/components/home/GalleryCarousel.vue";

const configStore = useConfigStore();
const authStore = useAuthStore();

const NEWS_LIST_LIMIT = 5;
const EVENT_LIST_LIMIT = 6;
const WORKS_LIST_LIMIT = 6;

const newsItems = ref<NewsListItem[]>([]);
const eventItems = ref<EventItem[]>([]);
const workItems = ref<WorkItem[]>([]);

const isLoadingNews = ref(false);
const isLoadingEvents = ref(false);
const isLoadingWorks = ref(false);

const loadHomeData = async () => {
  isLoadingNews.value = true;
  isLoadingEvents.value = true;
  isLoadingWorks.value = true;

  try {
    const promises = [];
    const isAdmin = authStore.isAdmin;

    if (configStore.config?.showNewsBox || isAdmin) {
      promises.push(
        fetchNewsList(1, NEWS_LIST_LIMIT).then((res) => {
          newsItems.value = res.items;
        })
      );
    }

    if (configStore.config?.showEventsBox || isAdmin) {
      promises.push(
        fetchEvents(1, EVENT_LIST_LIMIT).then((res) => {
          eventItems.value = res.items;
        })
      );
    }

    if (configStore.config?.showWorksBox || isAdmin) {
      promises.push(
        fetchWorks(1, WORKS_LIST_LIMIT).then((res) => {
          workItems.value = res.items;
        })
      );
    }

    await Promise.all(promises);
  } catch (error) {
    console.error("홈 데이터 로드 실패:", error);
  } finally {
    isLoadingNews.value = false;
    isLoadingEvents.value = false;
    isLoadingWorks.value = false;
  }
};

watch(
  () => configStore.isLoaded,
  (loaded) => {
    if (loaded) {
      loadHomeData();
    }
  }
);

onMounted(() => {
  if (configStore.isLoaded) {
    loadHomeData();
  }
});
</script>

<template>
  <div class="master-home-view">
    <!-- Hero Section -->
    <HeroCarousel />

    <!-- Content Section -->
    <div class="list-boxes" v-if="configStore.isLoaded">
      <!-- NEWS -->
      <ListBox title="News" v-if="configStore.config?.showNewsBox || authStore.isAdmin">
        <p v-if="isLoadingNews" class="empty-state">불러오는 중...</p>
        <p v-else-if="newsItems.length === 0" class="empty-state">표시할 소식이 없습니다.</p>
        <template v-else>
          <RouterLink
            v-for="item in newsItems"
            :key="item.id"
            class="entry-link"
            :to="{ name: 'news-detail', params: { id: item.id } }"
          >
            <PostEntry
              :title="item.title"
              :date="item.date"
              :thumb="item.thumbnail || undefined"
              :text="`조회수 ${item.views} · 좋아요 ${item.likes}`"
            />
          </RouterLink>
        </template>
      </ListBox>

      <!-- EVENTS -->
      <ListBox title="Events" v-if="configStore.config?.showEventsBox || authStore.isAdmin">
        <p v-if="isLoadingEvents" class="empty-state">불러오는 중...</p>
        <p v-else-if="eventItems.length === 0" class="empty-state">표시할 행사가 없습니다.</p>
        <div v-else class="events-grid">
          <RouterLink
            v-for="item in eventItems"
            :key="item.id"
            class="entry-link"
            :to="{ name: 'events' }"
          >
            <ThumbEntry :title="item.title" :date="item.date" :thumb="item.thumb || undefined" />
          </RouterLink>
        </div>
      </ListBox>

      <!-- GALLERY -->
      <!-- <ListBox title="Gallery" class="gallery-box" v-if="configStore.config?.showGalleryBox || authStore.isAdmin">
        <GalleryCarousel />
      </ListBox> -->

      <!-- WORKS -->
      <ListBox title="Works" v-if="configStore.config?.showWorksBox || authStore.isAdmin">
        <p v-if="isLoadingWorks" class="empty-state">불러오는 중...</p>
        <p v-else-if="workItems.length === 0" class="empty-state">표시할 작품이 없습니다.</p>
        <div v-else class="works-grid">
          <RouterLink
            v-for="item in workItems"
            :key="item.id"
            class="entry-link"
            :to="{ name: 'works' }"
          >
            <ThumbEntry :title="item.title" :date="item.date" :thumb="item.thumb || undefined" />
          </RouterLink>
        </div>
      </ListBox>

      <!-- TWITTER -->
      <ListBox title="Twitter" class="twitter">
        <!-- TODO: Replace with backend API -->
        <div class="twitter-wrapper">
          <iframe class="twitter-embed" src="https://nitter.net/gonglijeongli"></iframe>
        </div>
      </ListBox>
    </div>
  </div>
</template>

<style scoped>
.list-boxes {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(25rem, 1fr));
  gap: var(--spacing-md);
}

.twitter-wrapper {
  width: 100%;
  height: var(--twitter-height);
  overflow: hidden;
}

.twitter-embed {
  width: calc((100% + 0.625rem) / 0.7); /* 스크롤바 너비만큼 추가 + 축소 보정 */
  height: calc((100% + 1.5rem) / 0.7);
  margin-top: calc(-1.5rem / 0.7);
  border: none;
  transform: scale(0.7);
  transform-origin: top left;
}

.events-grid,
.works-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(7rem, 1fr));
  gap: var(--spacing-md);
  padding-bottom: var(--spacing-md);
}

.entry-link {
  color: inherit;
  text-decoration: none;
}

.empty-state {
  margin: 0;
  padding: var(--spacing-sm) 0 var(--spacing-md);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.gallery-box {
  grid-column: 1 / -1;
}

@media (max-width: 768px) {
  .list-boxes {
    grid-template-columns: 1fr;
  }
}
</style>
