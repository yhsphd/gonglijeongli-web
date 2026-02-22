<script setup lang="ts">
defineProps<{
  thumb?: string;
  alt?: string;
  hasLink?: boolean;
}>();

const emit = defineEmits<{
  click: [];
}>();

const handleClick = () => {
  emit("click");
};
</script>

<template>
  <article class="content-card" :class="{ 'has-link': hasLink }" @click="handleClick">
    <div class="card-thumb">
      <img v-if="thumb" :src="thumb" :alt="alt || ''" class="thumb-img" />
      <div v-else class="thumb-placeholder" />
      <slot name="overlay" />
    </div>
    <div class="card-content">
      <slot />
    </div>
  </article>
</template>

<style scoped>
.content-card {
  display: flex;
  flex-direction: column;
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  overflow: hidden;
  transition: all 0.3s ease;
}

.content-card.has-link {
  cursor: pointer;
}

.content-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

/* Card Thumbnail */
.card-thumb {
  position: relative;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  background: var(--color-bg-subtle);
}

.thumb-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: transform 0.3s ease;
}

.thumb-placeholder {
  width: 100%;
  height: 100%;
  background: var(--color-bg-subtle);
}

.content-card:hover .thumb-img {
  transform: scale(1.05);
}

/* Card Actions visibility on hover - using :deep() for child component */
.content-card :deep(.card-actions) {
  opacity: 0;
  transition: opacity 0.2s;
}

.content-card:hover :deep(.card-actions) {
  opacity: 1;
}

/* Card Content */
.card-content {
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}
</style>
