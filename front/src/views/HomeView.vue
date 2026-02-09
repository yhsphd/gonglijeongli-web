<script setup lang="ts"></script>

<template>
  <div class="master-home-view">
    <h1>홈</h1>
    <p>웹사이트에 오신 것을 환영합니다.</p>
    <p v-for="(value, i) in 100" :key="i">Test {{ value }}</p>
  </div>
</template>

<style scoped></style>
