import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Unlink,
  Undo,
  Redo,
  Heading1,
  Heading2,
} from "lucide-react";
import { useEffect } from "react";
const MenuButton = ({
  onClick,
  isActive = false,
  disabled = false,
  children,
  title,
}) =>
  _jsx("button", {
    type: "button",
    onClick: onClick,
    disabled: disabled,
    title: title,
    className: `p-2 rounded-md transition-colors ${
      isActive
        ? "bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300"
        : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
    } disabled:opacity-50 disabled:cursor-not-allowed`,
    children: children,
  });
export const RichTextEditor = ({ value, onChange, placeholder, className }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary-600 underline cursor-pointer",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Placeholder.configure({
        placeholder: placeholder || "Escribe aquí...",
      }),
      CharacterCount,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: `prose dark:prose-invert max-w-none min-h-[200px] p-4 focus:outline-none focus:ring-0 ${className || ""}`,
      },
    },
  });
  // Sync value if changed from outside
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);
  if (!editor) {
    return null;
  }
  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL:", previousUrl);
    if (url === null) {
      return;
    }
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };
  return _jsxs("div", {
    className:
      "rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 overflow-hidden ring-offset-white focus-within:ring-2 focus-within:ring-primary-500/20 transition-all",
    children: [
      _jsxs("div", {
        className:
          "flex flex-wrap items-center gap-1 border-b border-gray-100 bg-gray-50/50 p-1 dark:border-gray-700 dark:bg-gray-900/50",
        children: [
          _jsxs("div", {
            className:
              "flex items-center gap-1 border-r border-gray-200 px-1 dark:border-gray-700",
            children: [
              _jsx(MenuButton, {
                onClick: () =>
                  editor.chain().focus().toggleHeading({ level: 1 }).run(),
                isActive: editor.isActive("heading", { level: 1 }),
                title: "T\u00EDtulo 1",
                children: _jsx(Heading1, { className: "h-4 w-4" }),
              }),
              _jsx(MenuButton, {
                onClick: () =>
                  editor.chain().focus().toggleHeading({ level: 2 }).run(),
                isActive: editor.isActive("heading", { level: 2 }),
                title: "T\u00EDtulo 2",
                children: _jsx(Heading2, { className: "h-4 w-4" }),
              }),
            ],
          }),
          _jsxs("div", {
            className:
              "flex items-center gap-1 border-r border-gray-200 px-1 dark:border-gray-700",
            children: [
              _jsx(MenuButton, {
                onClick: () => editor.chain().focus().toggleBold().run(),
                isActive: editor.isActive("bold"),
                title: "Negrita",
                children: _jsx(Bold, { className: "h-4 w-4" }),
              }),
              _jsx(MenuButton, {
                onClick: () => editor.chain().focus().toggleItalic().run(),
                isActive: editor.isActive("italic"),
                title: "Cursiva",
                children: _jsx(Italic, { className: "h-4 w-4" }),
              }),
              _jsx(MenuButton, {
                onClick: () => editor.chain().focus().toggleUnderline().run(),
                isActive: editor.isActive("underline"),
                title: "Subrayado",
                children: _jsx(UnderlineIcon, { className: "h-4 w-4" }),
              }),
            ],
          }),
          _jsxs("div", {
            className:
              "flex items-center gap-1 border-r border-gray-200 px-1 dark:border-gray-700",
            children: [
              _jsx(MenuButton, {
                onClick: () =>
                  editor.chain().focus().setTextAlign("left").run(),
                isActive: editor.isActive({ textAlign: "left" }),
                title: "Alinear izquierda",
                children: _jsx(AlignLeft, { className: "h-4 w-4" }),
              }),
              _jsx(MenuButton, {
                onClick: () =>
                  editor.chain().focus().setTextAlign("center").run(),
                isActive: editor.isActive({ textAlign: "center" }),
                title: "Centrar",
                children: _jsx(AlignCenter, { className: "h-4 w-4" }),
              }),
              _jsx(MenuButton, {
                onClick: () =>
                  editor.chain().focus().setTextAlign("right").run(),
                isActive: editor.isActive({ textAlign: "right" }),
                title: "Alinear derecha",
                children: _jsx(AlignRight, { className: "h-4 w-4" }),
              }),
            ],
          }),
          _jsxs("div", {
            className:
              "flex items-center gap-1 border-r border-gray-200 px-1 dark:border-gray-700",
            children: [
              _jsx(MenuButton, {
                onClick: () => editor.chain().focus().toggleBulletList().run(),
                isActive: editor.isActive("bulletList"),
                title: "Lista vi\u00F1etas",
                children: _jsx(List, { className: "h-4 w-4" }),
              }),
              _jsx(MenuButton, {
                onClick: () => editor.chain().focus().toggleOrderedList().run(),
                isActive: editor.isActive("orderedList"),
                title: "Lista numerada",
                children: _jsx(ListOrdered, { className: "h-4 w-4" }),
              }),
            ],
          }),
          _jsxs("div", {
            className:
              "flex items-center gap-1 border-r border-gray-200 px-1 dark:border-gray-700",
            children: [
              _jsx(MenuButton, {
                onClick: setLink,
                isActive: editor.isActive("link"),
                title: "Insertar enlace",
                children: _jsx(LinkIcon, { className: "h-4 w-4" }),
              }),
              _jsx(MenuButton, {
                onClick: () => editor.chain().focus().unsetLink().run(),
                disabled: !editor.isActive("link"),
                title: "Quitar enlace",
                children: _jsx(Unlink, { className: "h-4 w-4" }),
              }),
            ],
          }),
          _jsxs("div", {
            className: "flex items-center gap-1 px-1 ml-auto",
            children: [
              _jsx(MenuButton, {
                onClick: () => editor.chain().focus().undo().run(),
                disabled: !editor.can().undo(),
                title: "Deshacer",
                children: _jsx(Undo, { className: "h-4 w-4" }),
              }),
              _jsx(MenuButton, {
                onClick: () => editor.chain().focus().redo().run(),
                disabled: !editor.can().redo(),
                title: "Rehacer",
                children: _jsx(Redo, { className: "h-4 w-4" }),
              }),
            ],
          }),
        ],
      }),
      _jsx(EditorContent, { editor: editor, placeholder: placeholder }),
      _jsxs("div", {
        className:
          "flex items-center justify-between border-t border-gray-100 bg-gray-50/30 px-4 py-1.5 dark:border-gray-700 dark:bg-gray-900/30",
        children: [
          _jsx("span", {
            className:
              "text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider",
            children: "Editor Visual",
          }),
          _jsxs("span", {
            className:
              "text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider",
            children: [
              editor.storage.characterCount?.characters?.() || 0,
              " Caracteres",
            ],
          }),
        ],
      }),
    ],
  });
};
