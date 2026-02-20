<script setup lang="ts"></script>

<template>
  <div class="master-thumb-entry">
    <div class="thumb-wrapper">
      <img class="thumb" src="/assets/events/illustar10.png" />
    </div>
    <div class="text-content">
      <p class="title">일러스타 페스 10</p>
      <p class="date">2026.02.21.</p>
    </div>
  </div>
</template>

<style scoped>
.master-thumb-entry {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}
.thumb-wrapper {
  aspect-ratio: 1;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-subtle);
  border-radius: var(--radius-sm);
  overflow: hidden;
}
.thumb {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.text-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  text-align: center;
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
  margin: 0;
  font-size: var(--font-size-xs);
  line-height: var(--line-height-tight);
  color: var(--color-text-secondary);
}
</style>
