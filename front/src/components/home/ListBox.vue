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
  backdrop-filter: blur(2.5px);
}

.box-top {
  display: flex;
  flex-direction: row;
  height: 1px;
  margin-top: 1em;
}
.box-top > *:nth-child(1),
.box-top > *:nth-child(3) {
  background: rgba(0, 0, 0, 0.3);
}
.box-top > *:nth-child(1) {
  width: 20px;
}
.box-top > *:nth-child(2) {
  margin-top: -0.5em;
  padding: 0 8px;
}

.content {
  /* border: 1px solid rgba(0, 0, 0, 0.3); */
  border-width: 1px;
  border-color: rgba(0, 0, 0, 0.3);
  border-style: none solid solid solid;
  padding: 0 16px;
  /* background: rgba(0, 0, 0, 0.005); */
  /* box-shadow: inset -4px -4px 4px rgba(0, 0, 0, 0.1); */
}
.spacer {
  height: 1em;
}
</style>
