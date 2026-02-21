<script setup lang="ts">
import { useEditor, EditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import { watch, onBeforeUnmount } from "vue";

const props = defineProps<{
  content: object;
}>();

const lowlight = createLowlight(common);

const editor = useEditor({
  content: props.content,
  editable: false,
  extensions: [
    StarterKit.configure({
      codeBlock: false,
    }),
    Underline,
    Link.configure({
      openOnClick: true,
      HTMLAttributes: {
        class: "editor-link",
        target: "_blank",
        rel: "noopener noreferrer",
      },
    }),
    Image.configure({
      HTMLAttributes: {
        class: "editor-image",
      },
    }),
    TextAlign.configure({
      types: ["heading", "paragraph"],
    }),
    TextStyle,
    Color,
    Table.configure({
      resizable: false,
    }),
    TableRow,
    TableCell,
    TableHeader,
    CodeBlockLowlight.configure({
      lowlight,
    }),
  ],
});

watch(
  () => props.content,
  (value) => {
    if (editor.value) {
      editor.value.commands.setContent(value, { emitUpdate: false });
    }
  }
);

onBeforeUnmount(() => {
  editor.value?.destroy();
});
</script>

<template>
  <div class="tiptap-renderer" v-if="editor">
    <EditorContent :editor="editor" class="renderer-content" />
  </div>
</template>

<style scoped>
.tiptap-renderer {
  width: 100%;
}

.renderer-content :deep(.tiptap) {
  outline: none;
}

.renderer-content :deep(.tiptap h1) {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  margin: var(--spacing-md) 0;
}

.renderer-content :deep(.tiptap h2) {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  margin: var(--spacing-md) 0;
}

.renderer-content :deep(.tiptap h3) {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
  margin: var(--spacing-sm) 0;
}

.renderer-content :deep(.tiptap p) {
  margin: var(--spacing-sm) 0;
  line-height: var(--line-height-normal);
}

.renderer-content :deep(.tiptap ul),
.renderer-content :deep(.tiptap ol) {
  padding-left: var(--spacing-xl);
  margin: var(--spacing-sm) 0;
}

.renderer-content :deep(.tiptap blockquote) {
  border-left: 3px solid var(--color-border);
  padding-left: var(--spacing-md);
  margin: var(--spacing-md) 0;
  color: var(--color-text-secondary);
}

.renderer-content :deep(.tiptap pre) {
  background: var(--color-bg-subtle);
  padding: var(--spacing-md);
  border-radius: var(--radius-sm);
  font-family: var(--font-family-mono);
  font-size: var(--font-size-sm);
  overflow-x: auto;
}

.renderer-content :deep(.tiptap code) {
  background: var(--color-bg-subtle);
  padding: 0.1em 0.3em;
  border-radius: var(--radius-xs);
  font-family: var(--font-family-mono);
  font-size: 0.9em;
}

.renderer-content :deep(.tiptap pre code) {
  background: none;
  padding: 0;
}

.renderer-content :deep(.tiptap .editor-link) {
  color: #0066cc;
  text-decoration: underline;
}

.renderer-content :deep(.tiptap .editor-link:hover) {
  color: #004499;
}

.renderer-content :deep(.tiptap .editor-image) {
  max-width: 100%;
  height: auto;
  border-radius: var(--radius-sm);
}

.renderer-content :deep(.tiptap table) {
  border-collapse: collapse;
  width: 100%;
  margin: var(--spacing-md) 0;
}

.renderer-content :deep(.tiptap th),
.renderer-content :deep(.tiptap td) {
  border: 1px solid var(--color-border);
  padding: var(--spacing-sm);
  text-align: left;
}

.renderer-content :deep(.tiptap th) {
  background: var(--color-bg-subtle);
  font-weight: var(--font-weight-bold);
}
</style>
