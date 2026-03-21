<script setup lang="ts">
import { useEditor, EditorContent } from "@tiptap/vue-3";
import { watch, onBeforeUnmount, ref } from "vue";
import ImageUploadDialog from "./ImageUploadDialog.vue";
import { useImageDragDrop } from "@/composables/useImageDragDrop";
import { getEditorExtensions } from "@/composables/useEditorExtensions";

const props = defineProps<{
  modelValue: object;
  placeholder?: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: object];
}>();

// Composables 사용
const { dragHandlers } = useImageDragDrop();
const extensions = getEditorExtensions(props.placeholder);

// 이미지 다이얼로그 상태
const imageDialogOpen = ref(false);

const editor = useEditor({
  content: props.modelValue,
  editorProps: {
    handleDOMEvents: {
      dragstart: dragHandlers.dragstart,
      drop: (view, event) => {
        return dragHandlers.drop(view, event, editor.value || null);
      },
      dragover: dragHandlers.dragover,
      dragend: dragHandlers.dragend,
    },
  },
  extensions,
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

const addImage = () => {
  imageDialogOpen.value = true;
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

    <!-- 이미지 삽입 다이얼로그 (분리된 컴포넌트) -->
    <ImageUploadDialog v-model="imageDialogOpen" :editor="editor" />
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

.editor-content
  :deep(.tiptap [data-node="image"].ProseMirror-selectednode [data-resize-wrapper]::before) {
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
</style>
