<script setup lang="ts">
import { useEditor, EditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Placeholder from "@tiptap/extension-placeholder";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import FileHandler from "@tiptap/extension-file-handler";
import { NodeSelection } from "@tiptap/pm/state";
import { common, createLowlight } from "lowlight";
import { watch, onBeforeUnmount, ref } from "vue";
import { uploadFile } from "@/api/client";

const props = defineProps<{
  modelValue: object;
  placeholder?: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: object];
}>();

const lowlight = createLowlight(common);

type InternalImageDragState = {
  from: number;
  to: number;
  nodeJSON: Record<string, unknown>;
};

const internalImageDragState = ref<InternalImageDragState | null>(null);

const editor = useEditor({
  content: props.modelValue,
  editorProps: {
    handleDOMEvents: {
      dragstart: (view, event) => {
        const target = event.target as HTMLElement | null;

        if (target?.closest("[data-node='image'], [data-resize-container], img.editor-image")) {
          const imageNodeElement = target.closest("[data-node='image']") as HTMLElement | null;
          const imagePos = imageNodeElement ? view.posAtDOM(imageNodeElement, 0) : null;

          if (imagePos != null) {
            const maybeImageNode = view.state.doc.nodeAt(imagePos);

            if (maybeImageNode?.type.name === "image") {
              view.dispatch(view.state.tr.setSelection(NodeSelection.create(view.state.doc, imagePos)));

              internalImageDragState.value = {
                from: imagePos,
                to: imagePos + maybeImageNode.nodeSize,
                nodeJSON: maybeImageNode.toJSON(),
              };
            }
          }

          event.dataTransfer?.setData("application/x-editor-image-drag", "1");

          if (event.dataTransfer) {
            event.dataTransfer.effectAllowed = "move";
            event.dataTransfer.dropEffect = "move";
          }

          return false;
        }

        return false;
      },
      drop: (view, event) => {
        const isInternalImageDrag =
          event.dataTransfer?.types.includes("application/x-editor-image-drag") ?? false;

        if (!isInternalImageDrag || !internalImageDragState.value) {
          return false;
        }

        event.preventDefault();

        const currentEditor = editor.value;
        const dropPos = view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos;

        if (!currentEditor || dropPos == null) {
          internalImageDragState.value = null;
          return true;
        }

        const { from, to, nodeJSON } = internalImageDragState.value;

        // Dropping inside the source range should be a no-op to avoid jitter and accidental duplicate paths.
        if (dropPos >= from && dropPos <= to) {
          internalImageDragState.value = null;
          return true;
        }

        // If the original source node no longer matches, abort safely.
        const sourceNodeNow = currentEditor.state.doc.nodeAt(from);
        if (!sourceNodeNow || sourceNodeNow.type.name !== "image") {
          internalImageDragState.value = null;
          return true;
        }

        const nodeSize = to - from;
        const rawDropPos = dropPos > from ? Math.max(from, dropPos - nodeSize) : dropPos;
        const adjustedDropPos = Math.max(0, Math.min(rawDropPos, currentEditor.state.doc.content.size));
        const imageNode = currentEditor.state.schema.nodeFromJSON(nodeJSON);

        const tr = currentEditor.state.tr
          .delete(from, to)
          .insert(adjustedDropPos, imageNode);

        tr.setSelection(NodeSelection.create(tr.doc, adjustedDropPos)).scrollIntoView();

        view.dispatch(tr);
        internalImageDragState.value = null;

        return true;
      },
      dragover: (_view, event) => {
        const isInternalImageDrag =
          event.dataTransfer?.types.includes("application/x-editor-image-drag") ?? false;

        if (!isInternalImageDrag) {
          return false;
        }

        event.preventDefault();

        if (event.dataTransfer) {
          event.dataTransfer.dropEffect = "move";
        }

        return true;
      },
      dragend: () => {
        internalImageDragState.value = null;
        return false;
      },
    },
  },
  extensions: [
    StarterKit.configure({
      codeBlock: false, // CodeBlockLowlight로 대체
    }),
    Underline,
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: "editor-link",
      },
    }),
    Image.configure({
      inline: true,
      HTMLAttributes: {
        class: "editor-image",
        draggable: "true",
      },
      resize: {
        enabled: true,
        directions: ["bottom-right"],
        minWidth: 80,
        minHeight: 50,
        alwaysPreserveAspectRatio: true,
      },
    }),
    TextAlign.configure({
      types: ["heading", "paragraph"],
    }),
    TextStyle,
    Color,
    Placeholder.configure({
      placeholder: props.placeholder || "내용을 입력하세요...",
    }),
    Table.configure({
      resizable: true,
    }),
    TableRow,
    TableCell,
    TableHeader,
    CodeBlockLowlight.configure({
      lowlight,
    }),
    FileHandler.configure({
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
      onDrop: async (currentEditor, files, _pos) => {
        for (const file of files) {
          try {
            const { url } = await uploadFile(file);
            currentEditor.chain().insertContentAt(_pos, {
              type: "image",
              attrs: { src: url },
            }).focus().run();
          } catch (error) {
            console.error("이미지 드롭 업로드 실패:", error);
            alert("이미지 업로드에 실패했습니다.");
          }
        }
      },
      onPaste: async (currentEditor, files) => {
        for (const file of files) {
          try {
            const { url } = await uploadFile(file);
            currentEditor.chain().focus().setImage({ src: url }).run();
          } catch (error) {
            console.error("이미지 붙여넣기 업로드 실패:", error);
            alert("이미지 업로드에 실패했습니다.");
          }
        }
      },
    }),
  ],
  onUpdate: () => {
    emit("update:modelValue", editor.value?.getJSON() || {});
  },
});

watch(
  () => props.modelValue,
  (value) => {
    const isSame = JSON.stringify(editor.value?.getJSON()) === JSON.stringify(value);
    if (!isSame && editor.value) {
      editor.value.commands.setContent(value, { emitUpdate: false });
    }
  }
);

onBeforeUnmount(() => {
  editor.value?.destroy();
});

// 툴바 액션들
const setLink = () => {
  const previousUrl = editor.value?.getAttributes("link").href;
  const url = window.prompt("링크 URL을 입력하세요:", previousUrl);

  if (url === null) return;

  if (url === "") {
    editor.value?.chain().focus().extendMarkRange("link").unsetLink().run();
    return;
  }

  editor.value?.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
};

// ── 이미지 삽입 다이얼로그 상태 ──
const imageDialogOpen = ref(false);
const imageDialogTab = ref<"upload" | "url">("upload");
const imageUrlInput = ref("");
const imageFileInput = ref<HTMLInputElement | null>(null);
const isImageUploading = ref(false);
const imageUploadError = ref("");

const openImageDialog = () => {
  imageDialogOpen.value = true;
  imageDialogTab.value = "upload";
  imageUrlInput.value = "";
  imageUploadError.value = "";
};

const closeImageDialog = () => {
  imageDialogOpen.value = false;
};

const insertImageUrl = (url: string) => {
  if (!url.trim()) return;
  editor.value?.chain().focus().setImage({ src: url.trim() }).run();
  closeImageDialog();
};

const handleImageFileChange = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  isImageUploading.value = true;
  imageUploadError.value = "";

  try {
    const { url } = await uploadFile(file);
    insertImageUrl(url);
  } catch (error) {
    imageUploadError.value =
      error instanceof Error ? error.message : "업로드에 실패했습니다.";
  } finally {
    isImageUploading.value = false;
    input.value = "";
  }
};

// 기존 addImage는 다이얼로그를 열도록 대체
const addImage = () => {
  openImageDialog();
};

const setColor = (event: Event) => {
  const color = (event.target as HTMLInputElement).value;
  editor.value?.chain().focus().setColor(color).run();
};

const insertTable = () => {
  editor.value?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
};
</script>

<template>
  <div class="tiptap-editor" v-if="editor">
    <!-- Toolbar -->
    <div class="editor-toolbar">
      <!-- Text formatting -->
      <div class="toolbar-group">
        <button
          type="button"
          class="toolbar-btn"
          :class="{ active: editor.isActive('bold') }"
          @click="editor.chain().focus().toggleBold().run()"
          title="굵게"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          class="toolbar-btn"
          :class="{ active: editor.isActive('italic') }"
          @click="editor.chain().focus().toggleItalic().run()"
          title="기울임"
        >
          <em>I</em>
        </button>
        <button
          type="button"
          class="toolbar-btn"
          :class="{ active: editor.isActive('underline') }"
          @click="editor.chain().focus().toggleUnderline().run()"
          title="밑줄"
        >
          <u>U</u>
        </button>
        <button
          type="button"
          class="toolbar-btn"
          :class="{ active: editor.isActive('strike') }"
          @click="editor.chain().focus().toggleStrike().run()"
          title="취소선"
        >
          <s>S</s>
        </button>
      </div>

      <!-- Headings -->
      <div class="toolbar-group">
        <button
          type="button"
          class="toolbar-btn"
          :class="{ active: editor.isActive('heading', { level: 1 }) }"
          @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
          title="제목 1"
        >
          H1
        </button>
        <button
          type="button"
          class="toolbar-btn"
          :class="{ active: editor.isActive('heading', { level: 2 }) }"
          @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
          title="제목 2"
        >
          H2
        </button>
        <button
          type="button"
          class="toolbar-btn"
          :class="{ active: editor.isActive('heading', { level: 3 }) }"
          @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
          title="제목 3"
        >
          H3
        </button>
      </div>

      <!-- Lists -->
      <div class="toolbar-group">
        <button
          type="button"
          class="toolbar-btn"
          :class="{ active: editor.isActive('bulletList') }"
          @click="editor.chain().focus().toggleBulletList().run()"
          title="글머리 기호"
        >
          •
        </button>
        <button
          type="button"
          class="toolbar-btn"
          :class="{ active: editor.isActive('orderedList') }"
          @click="editor.chain().focus().toggleOrderedList().run()"
          title="번호 목록"
        >
          1.
        </button>
        <button
          type="button"
          class="toolbar-btn"
          :class="{ active: editor.isActive('blockquote') }"
          @click="editor.chain().focus().toggleBlockquote().run()"
          title="인용"
        >
          "
        </button>
        <button
          type="button"
          class="toolbar-btn"
          :class="{ active: editor.isActive('codeBlock') }"
          @click="editor.chain().focus().toggleCodeBlock().run()"
          title="코드 블록"
        >
          &lt;/&gt;
        </button>
      </div>

      <!-- Alignment -->
      <div class="toolbar-group">
        <button
          type="button"
          class="toolbar-btn"
          :class="{ active: editor.isActive({ textAlign: 'left' }) }"
          @click="editor.chain().focus().setTextAlign('left').run()"
          title="왼쪽 정렬"
        >
          ≡←
        </button>
        <button
          type="button"
          class="toolbar-btn"
          :class="{ active: editor.isActive({ textAlign: 'center' }) }"
          @click="editor.chain().focus().setTextAlign('center').run()"
          title="가운데 정렬"
        >
          ≡
        </button>
        <button
          type="button"
          class="toolbar-btn"
          :class="{ active: editor.isActive({ textAlign: 'right' }) }"
          @click="editor.chain().focus().setTextAlign('right').run()"
          title="오른쪽 정렬"
        >
          →≡
        </button>
      </div>

      <!-- Insert -->
      <div class="toolbar-group">
        <button
          type="button"
          class="toolbar-btn"
          :class="{ active: editor.isActive('link') }"
          @click="setLink"
          title="링크"
        >
          🔗
        </button>
        <button type="button" class="toolbar-btn" @click="addImage" title="이미지">🖼️</button>
        <button type="button" class="toolbar-btn" @click="insertTable" title="표">📊</button>
      </div>

      <!-- Color -->
      <div class="toolbar-group">
        <input
          type="color"
          class="color-picker"
          @input="setColor"
          :value="editor.getAttributes('textStyle').color || '#333333'"
          title="글자 색상"
        />
      </div>

      <!-- Table controls (when table is active) -->
      <div class="toolbar-group" v-if="editor.isActive('table')">
        <button
          type="button"
          class="toolbar-btn"
          @click="editor.chain().focus().addColumnBefore().run()"
          title="왼쪽에 열 추가"
        >
          +←
        </button>
        <button
          type="button"
          class="toolbar-btn"
          @click="editor.chain().focus().addColumnAfter().run()"
          title="오른쪽에 열 추가"
        >
          +→
        </button>
        <button
          type="button"
          class="toolbar-btn"
          @click="editor.chain().focus().deleteColumn().run()"
          title="열 삭제"
        >
          -|
        </button>
        <button
          type="button"
          class="toolbar-btn"
          @click="editor.chain().focus().addRowBefore().run()"
          title="위에 행 추가"
        >
          +↑
        </button>
        <button
          type="button"
          class="toolbar-btn"
          @click="editor.chain().focus().addRowAfter().run()"
          title="아래에 행 추가"
        >
          +↓
        </button>
        <button
          type="button"
          class="toolbar-btn"
          @click="editor.chain().focus().deleteRow().run()"
          title="행 삭제"
        >
          -─
        </button>
        <button
          type="button"
          class="toolbar-btn btn-danger"
          @click="editor.chain().focus().deleteTable().run()"
          title="표 삭제"
        >
          ×
        </button>
      </div>
    </div>

    <!-- Editor Content -->
    <EditorContent :editor="editor" class="editor-content" />

    <!-- 이미지 삽입 다이얼로그 -->
    <Teleport to="body">
      <div v-if="imageDialogOpen" class="img-dialog-overlay" @click.self="closeImageDialog">
        <div class="img-dialog">
          <div class="img-dialog-header">
            <span>이미지 삽입</span>
            <button type="button" class="img-dialog-close" @click="closeImageDialog">✕</button>
          </div>

          <!-- 탭 -->
          <div class="img-dialog-tabs">
            <button
              type="button"
              class="img-tab-btn"
              :class="{ active: imageDialogTab === 'upload' }"
              @click="imageDialogTab = 'upload'; imageUploadError = ''"
            >파일 업로드</button>
            <button
              type="button"
              class="img-tab-btn"
              :class="{ active: imageDialogTab === 'url' }"
              @click="imageDialogTab = 'url'; imageUploadError = ''"
            >URL 입력</button>
          </div>

          <!-- 파일 업로드 탭 -->
          <div v-if="imageDialogTab === 'upload'" class="img-dialog-body">
            <input
              ref="imageFileInput"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              class="img-file-input"
              @change="handleImageFileChange"
            />
            <button
              type="button"
              class="img-btn-select"
              :disabled="isImageUploading"
              @click="imageFileInput?.click()"
            >
              <span v-if="isImageUploading" class="img-spinner" />
              {{ isImageUploading ? '업로드 중...' : '파일 선택' }}
            </button>
            <span class="img-hint">JPG, PNG, WEBP, GIF (최대 5MB)</span>
          </div>

          <!-- URL 입력 탭 -->
          <div v-if="imageDialogTab === 'url'" class="img-dialog-body">
            <div class="img-url-row">
              <input
                v-model="imageUrlInput"
                type="text"
                class="img-url-input"
                placeholder="https://example.com/image.jpg"
                @keydown.enter.prevent="insertImageUrl(imageUrlInput)"
              />
              <button type="button" class="img-btn-apply" @click="insertImageUrl(imageUrlInput)">
                삽입
              </button>
            </div>
          </div>

          <!-- 에러 -->
          <p v-if="imageUploadError" class="img-error">{{ imageUploadError }}</p>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.tiptap-editor {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.editor-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm);
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg-subtle);
}

.toolbar-group {
  display: flex;
  gap: 2px;
  padding-right: var(--spacing-sm);
  border-right: 1px solid var(--color-border);
}

.toolbar-group:last-child {
  border-right: none;
}

.toolbar-btn {
  min-width: 2rem;
  height: 2rem;
  padding: 0 var(--spacing-xs);
  border: 1px solid transparent;
  background: transparent;
  color: var(--color-text-primary);
  font-family: var(--font-family-base);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all 0.15s;
  border-radius: var(--radius-xs);
}

.toolbar-btn:hover {
  background: var(--color-bg-overlay);
}

.toolbar-btn.active {
  background: var(--color-text-primary);
  color: var(--color-text-inverse);
}

.toolbar-btn.btn-danger:hover {
  background: var(--color-danger);
  color: var(--color-text-inverse);
}

.color-picker {
  width: 2rem;
  height: 2rem;
  padding: 0;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xs);
  cursor: pointer;
}

.editor-content {
  min-height: 20rem;
  padding: var(--spacing-md);
}

/* Tiptap 내부 스타일 */
.editor-content :deep(.tiptap) {
  outline: none;
  min-height: 18rem;
}

.editor-content :deep(.tiptap p.is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  float: left;
  color: var(--color-text-muted);
  pointer-events: none;
  height: 0;
}

.editor-content :deep(.tiptap h1) {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  margin: var(--spacing-md) 0;
}

.editor-content :deep(.tiptap h2) {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  margin: var(--spacing-md) 0;
}

.editor-content :deep(.tiptap h3) {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
  margin: var(--spacing-sm) 0;
}

.editor-content :deep(.tiptap p) {
  margin: var(--spacing-sm) 0;
  line-height: var(--line-height-normal);
}

.editor-content :deep(.tiptap ul),
.editor-content :deep(.tiptap ol) {
  padding-left: var(--spacing-xl);
  margin: var(--spacing-sm) 0;
}

.editor-content :deep(.tiptap blockquote) {
  border-left: 3px solid var(--color-border);
  padding-left: var(--spacing-md);
  margin: var(--spacing-md) 0;
  color: var(--color-text-secondary);
}

.editor-content :deep(.tiptap pre) {
  background: var(--color-bg-subtle);
  padding: var(--spacing-md);
  border-radius: var(--radius-sm);
  font-family: var(--font-family-mono);
  font-size: var(--font-size-sm);
  overflow-x: auto;
}

.editor-content :deep(.tiptap code) {
  background: var(--color-bg-subtle);
  padding: 0.1em 0.3em;
  border-radius: var(--radius-xs);
  font-family: var(--font-family-mono);
  font-size: 0.9em;
}

.editor-content :deep(.tiptap pre code) {
  background: none;
  padding: 0;
}

.editor-content :deep(.tiptap .editor-link) {
  color: #0066cc;
  text-decoration: underline;
}

.editor-content :deep(.tiptap .editor-image) {
  display: block;
  max-width: 100%;
  height: auto;
  border-radius: var(--radius-sm);
}

.editor-content :deep(.tiptap [data-resize-container]) {
  display: inline-flex !important;
  position: relative;
  max-width: 100%;
  margin: var(--spacing-sm) 0;
}

.editor-content :deep(.tiptap [data-resize-wrapper]) {
  display: inline-block !important;
  line-height: 0;
  max-width: 100%;
}

.editor-content :deep(.tiptap [data-resize-handle]) {
  width: 0.75rem;
  height: 0.75rem;
  background: var(--color-text-primary);
  border: 2px solid var(--color-bg-primary);
  border-radius: 2px;
  z-index: 2;
  opacity: 0;
}

.editor-content :deep(.tiptap .ProseMirror-selectednode [data-resize-handle]),
.editor-content :deep(.tiptap [data-resize-state="true"] [data-resize-handle]) {
  opacity: 1;
}

.editor-content :deep(.tiptap [data-resize-handle="bottom-right"]) {
  right: -0.375rem !important;
  bottom: -0.375rem !important;
  cursor: nwse-resize;
}

.editor-content :deep(.tiptap [data-node="image"].ProseMirror-selectednode [data-resize-wrapper]) {
  outline: 2px dashed var(--color-text-primary);
  outline-offset: 2px;
  /* border-radius: var(--radius-xs); */
}

.editor-content :deep(.tiptap [data-node="image"].ProseMirror-selectednode [data-resize-wrapper]::before) {
  content: "";
  position: absolute;
  inset: -2px;
  /* border: 1px solid color-mix(in srgb, var(--color-text-primary) 35%, transparent); */
  /* border: 1px solid color-mix(in srgb, var(--color-text-primary) 35%, transparent); */
  border-radius: var(--radius-xs);
  pointer-events: none;
}

.editor-content :deep(.tiptap table) {
  border-collapse: collapse;
  width: 100%;
  margin: var(--spacing-md) 0;
}

.editor-content :deep(.tiptap th),
.editor-content :deep(.tiptap td) {
  border: 1px solid var(--color-border);
  padding: var(--spacing-sm);
  text-align: left;
}

.editor-content :deep(.tiptap th) {
  background: var(--color-bg-subtle);
  font-weight: var(--font-weight-bold);
}

.editor-content :deep(.tiptap .selectedCell) {
  background: rgba(0, 100, 200, 0.1);
}
/* 이미지 삽입 다이얼로그 */
.img-dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.img-dialog {
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  padding: var(--spacing-md);
  width: 420px;
  max-width: 90vw;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.img-dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.img-dialog-close {
  border: none;
  background: none;
  color: var(--color-text-muted);
  font-size: var(--font-size-base);
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.img-dialog-close:hover {
  color: var(--color-text-primary);
}

.img-dialog-tabs {
  display: flex;
  border-bottom: 1px solid var(--color-border);
}

.img-tab-btn {
  padding: var(--spacing-xs) var(--spacing-sm);
  border: none;
  border-bottom: 2px solid transparent;
  background: none;
  color: var(--color-text-muted);
  font-family: var(--font-family-base);
  font-size: var(--font-size-xs);
  cursor: pointer;
  margin-bottom: -1px;
  transition: all 0.15s;
}

.img-tab-btn.active {
  color: var(--color-text-primary);
  border-bottom-color: var(--color-text-primary);
  font-weight: var(--font-weight-bold);
}

.img-dialog-body {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding-top: var(--spacing-xs);
}

.img-file-input {
  display: none;
}

.img-btn-select {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-border);
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  font-family: var(--font-family-base);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.img-btn-select:hover:not(:disabled) {
  border-color: var(--color-text-primary);
}

.img-btn-select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.img-hint {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.img-url-row {
  display: flex;
  gap: var(--spacing-xs);
  width: 100%;
}

.img-url-input {
  flex: 1;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-border);
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  font-family: var(--font-family-base);
  font-size: var(--font-size-sm);
  min-width: 0;
}

.img-url-input:focus {
  outline: none;
  border-color: var(--color-text-primary);
}

.img-url-input::placeholder {
  color: var(--color-text-muted);
}

.img-btn-apply {
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-text-primary);
  background: var(--color-text-primary);
  color: var(--color-text-inverse);
  font-family: var(--font-family-base);
  font-size: var(--font-size-sm);
  cursor: pointer;
  white-space: nowrap;
}

.img-btn-apply:hover {
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
}

.img-spinner {
  display: inline-block;
  width: 0.75rem;
  height: 0.75rem;
  border: 2px solid var(--color-border);
  border-top-color: var(--color-text-primary);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.img-error {
  margin: 0;
  font-size: var(--font-size-xs);
  color: var(--color-danger);
}
</style>
