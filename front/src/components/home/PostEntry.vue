<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string;
    date: string;
    text?: string;
    thumb?: string;
  }>(),
  {
    text: "",
    thumb: "",
  }
);
</script>

<template>
  <div class="master-post-entry">
    <div class="content">
      <div class="thumb-wrapper">
        <img v-if="thumb" class="thumb" :src="thumb" :alt="title" />
      </div>
      <div class="text-content">
        <p class="title">{{ title }}</p>
        <p class="date">{{ date }}</p>
        <p v-if="text" class="text">{{ text }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.master-post-entry {
  --entry-height: 5rem;
  height: var(--entry-height);
  border-style: none none solid none;
  border-color: var(--color-border);
  border-width: 1px;
  padding: var(--spacing-sm) 0;
}
.master-post-entry:last-child {
  border-bottom: none;
}
.content {
  display: flex;
  height: 100%;
  gap: var(--entry-gap);
}
.thumb-wrapper {
  flex-shrink: 0;
  width: calc(var(--entry-height) * 4 / 3);
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-subtle);
  border-radius: var(--radius-xs);
  overflow: hidden;
}
.thumb {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
.text-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: var(--spacing-xs);
}
.title {
  margin: 0;
  font-size: var(--font-size-sm);
  line-height: var(--line-height-snug);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.date {
  font-size: var(--font-size-xs);
  line-height: var(--line-height-tight);
  color: var(--color-text-secondary);
}
.text {
  margin: 0;
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  line-height: var(--line-height-snug);
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
