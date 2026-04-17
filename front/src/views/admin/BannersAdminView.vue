<script setup lang="ts">
import { ref, onMounted, nextTick } from "vue";
import Sortable from "sortablejs";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  fetchBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  type BannerItem,
} from "@/api/banners";
import ImageUpload from "@/components/common/ImageUpload.vue";
import { faGripLines } from "@fortawesome/free-solid-svg-icons";

const banners = ref<BannerItem[]>([]);
const isLoading = ref(false);
const isSavingOrder = ref(false);

const dialogVisible = ref(false);
const isEditing = ref(false);
const editingId = ref<number | null>(null);

const formData = ref({
  imageUrl: "",
  linkUrl: "",
  displayOrder: 0,
  isActive: true,
});

onMounted(async () => {
  await loadBanners();
  nextTick(() => {
    initSortable();
  });
});

const initSortable = () => {
  const tbody = document.querySelector(".el-table__body-wrapper tbody");
  if (!tbody) return;

  Sortable.create(tbody as HTMLElement, {
    handle: ".drag-handle:not(.is-disabled)",
    animation: 150,
    onEnd: async ({ newIndex, oldIndex }) => {
      if (newIndex === oldIndex || newIndex === undefined || oldIndex === undefined) return;

      const targetRow = banners.value.splice(oldIndex, 1)[0];
      if (!targetRow) return;
      banners.value.splice(newIndex, 0, targetRow);

      banners.value.forEach((b, i) => {
        b.displayOrder = (i + 1) * 10;
      });

      isSavingOrder.value = true;
      try {
        await Promise.all(
          banners.value.map((b) => updateBanner(b.id, { displayOrder: b.displayOrder }))
        );
        ElMessage.success("순서가 저장되었습니다.");
      } catch (error) {
        ElMessage.error("순서 저장에 실패했습니다.");
        if (error instanceof Error) {
          console.error(error.message);
        } else {
          console.error(error);
        }
        await loadBanners(); // revert
      } finally {
        isSavingOrder.value = false;
      }
    },
  });
};

const loadBanners = async () => {
  isLoading.value = true;
  try {
    banners.value = await fetchBanners();
  } catch (error) {
    ElMessage.error("배너 목록을 불러오지 못했습니다.");
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(error);
    }
  } finally {
    isLoading.value = false;
  }
};

const handleAdd = () => {
  isEditing.value = false;
  editingId.value = null;
  formData.value = {
    imageUrl: "",
    linkUrl: "",
    displayOrder: banners.value.length * 10,
    isActive: true,
  };
  dialogVisible.value = true;
};

const handleEdit = (row: BannerItem) => {
  isEditing.value = true;
  editingId.value = row.id;
  formData.value = {
    imageUrl: row.imageUrl,
    linkUrl: row.linkUrl || "",
    displayOrder: row.displayOrder,
    isActive: row.isActive,
  };
  dialogVisible.value = true;
};

const handleDelete = async (row: BannerItem) => {
  try {
    await ElMessageBox.confirm("이 배너를 삭제하시겠습니까?", "삭제 경고", {
      type: "warning",
      confirmButtonText: "삭제",
      cancelButtonText: "취소",
    });

    await deleteBanner(row.id);
    ElMessage.success("삭제되었습니다.");
    await loadBanners();
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("삭제 중 오류가 발생했습니다.");
    }
  }
};

const handleToggleActive = async (row: BannerItem) => {
  try {
    await updateBanner(row.id, { isActive: row.isActive });
    ElMessage.success("상태가 변경되었습니다.");
  } catch (error) {
    row.isActive = !row.isActive; // rollback on error
    ElMessage.error("상태 변경에 실패했습니다.");
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(error);
    }
  }
};

const handleSave = async () => {
  if (!formData.value.imageUrl) {
    ElMessage.warning("이미지를 업로드해주세요.");
    return;
  }

  try {
    if (isEditing.value && editingId.value) {
      await updateBanner(editingId.value, {
        imageUrl: formData.value.imageUrl,
        linkUrl: formData.value.linkUrl || null,
        displayOrder: Number(formData.value.displayOrder),
        isActive: formData.value.isActive,
      });
      ElMessage.success("수정되었습니다.");
    } else {
      await createBanner({
        imageUrl: formData.value.imageUrl,
        linkUrl: formData.value.linkUrl || null,
        displayOrder: Number(formData.value.displayOrder),
        isActive: formData.value.isActive,
      });
      ElMessage.success("등록되었습니다.");
    }
    dialogVisible.value = false;
    await loadBanners();
  } catch (error) {
    ElMessage.error("저장 중 오류가 발생했습니다.");
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(error);
    }
  }
};
</script>

<template>
  <div class="banner-admin">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>메인 배너 (Hero Carousel) 관리</span>
          <el-button type="primary" @click="handleAdd">배너 추가</el-button>
        </div>
      </template>

      <el-table :data="banners" v-loading="isLoading" style="width: 100%" row-key="id">
        <el-table-column label="순서 지정" width="100" align="center" class-name="drag-column">
          <template #default>
            <div
              class="drag-handle"
              :class="{ 'is-disabled': isSavingOrder }"
              title="드래그하여 순서 변경"
            >
              <FontAwesomeIcon :icon="faGripLines" style="font-size: 20px; color: #909399" />
            </div>
          </template>
        </el-table-column>

        <el-table-column label="이미지" width="200">
          <template #default="scope">
            <el-image
              :src="scope.row.imageUrl"
              style="width: 150px; height: 80px; object-fit: cover; border-radius: 4px"
            />
          </template>
        </el-table-column>

        <el-table-column prop="linkUrl" label="연결 링크">
          <template #default="scope">
            {{ scope.row.linkUrl || "-" }}
          </template>
        </el-table-column>

        <el-table-column label="노출 여부" width="100">
          <template #default="scope">
            <el-switch
              v-model="scope.row.isActive"
              inline-prompt
              @change="() => handleToggleActive(scope.row)"
            />
          </template>
        </el-table-column>

        <el-table-column label="관리" width="150" align="right">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.row)">수정</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row)">삭제</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEditing ? '배너 수정' : '배너 추가'" width="500px">
      <el-form label-position="top">
        <el-form-item label="배너 이미지 (필수)">
          <ImageUpload v-model="formData.imageUrl" label="" />
        </el-form-item>

        <el-form-item label="연결 링크 (선택)">
          <el-input v-model="formData.linkUrl" placeholder="https://" />
        </el-form-item>

        <el-form-item label="공개 여부">
          <el-switch v-model="formData.isActive" active-text="메인 화면에 노출" />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">취소</el-button>
          <el-button type="primary" @click="handleSave">저장</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.banner-admin {
  width: 100%;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

:deep(.drag-column) .cell {
  height: 100%;
  padding: 0;
}

.drag-handle {
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: grab;
}

.drag-handle.is-disabled {
  cursor: not-allowed;
  opacity: 0.3;
}
</style>
