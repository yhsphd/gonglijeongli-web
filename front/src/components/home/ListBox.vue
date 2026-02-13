<script setup lang="ts">
defineProps({
  title: String,
});
</script>

<template>
  <div class="master-list-box">
    <div class="box-top">
      <div></div>
      <h2>{{ title }}</h2>
      <div class="flex-grow"></div>
    </div>
    <div class="content">
      <h2 class="spacer"></h2>
      <!-- <li v-for="(value, i) in 10" :key="i">Test {{ value }}</li> -->
      <slot></slot>
    </div>
  </div>
</template>

<style scoped>
.master-list-box {
  backdrop-filter: var(--blur-sm);
}

.box-top {
  display: flex;
  flex-direction: row;
  height: 1px;
  margin-top: 1em;
}
.box-top > *:nth-child(1),
.box-top > *:nth-child(3) {
  background: var(--color-border);
}
.box-top > *:nth-child(1) {
  width: var(--spacing-lg);
}
.box-top > *:nth-child(2) {
  margin-top: -0.5em;
  padding: 0 var(--spacing-sm);
}

.content {
  border-width: 1px;
  border-color: var(--color-border);
  border-style: none solid solid solid;
  padding: 0 var(--spacing-md);
}
.spacer {
  height: 1em;
}
</style>
