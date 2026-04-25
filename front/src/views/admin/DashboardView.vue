<script setup lang="ts">
// 현재는 샘플 레이아웃만 구현합니다.
// 실제 데이터 연동은 추후 각 관리 기능 구현 시 추가하세요.
</script>

<template>
  <div class="master-dashboard-view">
    <el-row :gutter="16">
      <el-col :span="8">
        <el-card shadow="never" class="stat-card">
          <template #header>
            <span>📰 소식 (News)</span>
          </template>
          <div class="stat-value">—</div>
          <div class="stat-label">총 게시물</div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="never" class="stat-card">
          <template #header>
            <span>🗓 행사 (Events)</span>
          </template>
          <div class="stat-value">—</div>
          <div class="stat-label">총 행사</div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="never" class="stat-card">
          <template #header>
            <span>🖼 작품 (Works)</span>
          </template>
          <div class="stat-value">—</div>
          <div class="stat-label">총 작품</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" style="margin-top: 16px">
      <el-col :span="24">
        <el-card shadow="never">
          <template #header>
            <span>⚡ 빠른 메뉴</span>
          </template>
          <el-empty description="관리 기능이 추가되면 여기에 표시됩니다." :image-size="80" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.master-dashboard-view {
  max-width: 1200px;
}

.stat-card .stat-value {
  font-size: 36px;
  font-weight: 700;
  color: #303133;
  line-height: 1;
  margin-bottom: 6px;
}
.stat-card .stat-label {
  font-size: 13px;
  color: #909399;
}
</style>
