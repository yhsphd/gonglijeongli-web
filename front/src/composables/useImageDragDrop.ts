import { ref } from "vue";
import { NodeSelection } from "@tiptap/pm/state";
import type { Editor } from "@tiptap/vue-3";
import type { EditorView } from "@tiptap/pm/view";

/** 이미지 드래그 상태 */
export type InternalImageDragState = {
  from: number;
  to: number;
  nodeJSON: Record<string, unknown>;
};

/**
 * Tiptap 에디터의 이미지 드래그-드롭 기능을 관리하는 composable
 *
 * 지원 기능:
 * - 이미지 드래그 시작/끝 감지
 * - 드래그 위치 계산 및 검증
 * - 이미지 노드 이동
 */
export function useImageDragDrop() {
  const internalImageDragState = ref<InternalImageDragState | null>(null);

  const dragHandlers = {
    dragstart: (view: EditorView, event: DragEvent) => {
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

    drop: (view: EditorView, event: DragEvent, editor: Editor | null) => {
      const isInternalImageDrag =
        event.dataTransfer?.types.includes("application/x-editor-image-drag") ?? false;

      if (!isInternalImageDrag || !internalImageDragState.value) {
        return false;
      }

      event.preventDefault();

      const dropPos = view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos;

      if (!editor || dropPos == null) {
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
      const sourceNodeNow = editor.state.doc.nodeAt(from);
      if (!sourceNodeNow || sourceNodeNow.type.name !== "image") {
        internalImageDragState.value = null;
        return true;
      }

      const nodeSize = to - from;
      const rawDropPos = dropPos > from ? Math.max(from, dropPos - nodeSize) : dropPos;
      const adjustedDropPos = Math.max(0, Math.min(rawDropPos, editor.state.doc.content.size));
      const imageNode = editor.state.schema.nodeFromJSON(nodeJSON);

      const tr = editor.state.tr
        .delete(from, to)
        .insert(adjustedDropPos, imageNode);

      tr.setSelection(NodeSelection.create(tr.doc, adjustedDropPos)).scrollIntoView();

      view.dispatch(tr);
      internalImageDragState.value = null;

      return true;
    },

    dragover: (_view: EditorView, event: DragEvent) => {
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
  };

  return {
    dragHandlers,
    internalImageDragState,
  };
}
