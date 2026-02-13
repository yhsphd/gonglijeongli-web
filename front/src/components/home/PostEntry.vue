<script lang="ts"></script>

<template>
  <div class="master-post-entry">
    <div class="content">
      <div class="thumb-wrapper">
        <img class="thumb" src="/assets/hijiri.png" />
      </div>
      <div class="text-content">
        <p class="title">[행사 공지] 미래세기로의 초대장 부스 안내</p>
        <p class="date">2026.02.10.</p>
        <p class="text">
          안녕하세요 동방프로젝트 서클 공리와정리입니다. 2026.01.26에 개최되는 미래세기로의
          초대장에서 부스로 찾아뵙게 되었습니다!
        </p>
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
