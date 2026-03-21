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
import { common, createLowlight } from "lowlight";
import { uploadFile } from "@/api/client";

/**
 * Tiptap 에디터의 모든 extension을 설정하는 함수
 *
 * 포함 기능:
 * - 기본 텍스트 포매팅 (bold, italic, underline, strike)
 * - 제목 (h1, h2, h3)
 * - 리스트 및 인용
 * - 링크 삽입
 * - 이미지 삽입 및 리사이징
 * - 테이블
 * - 코드 블록 (문법 하이라이팅)
 * - 파일 업로드 (드래그-드롭, 붙여넣기)
 */
export function getEditorExtensions(placeholderText?: string) {
  const lowlight = createLowlight(common);

  return [
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
      placeholder: placeholderText || "내용을 입력하세요...",
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
            currentEditor
              .chain()
              .insertContentAt(_pos, {
                type: "image",
                attrs: { src: url },
              })
              .focus()
              .run();
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
  ];
}
