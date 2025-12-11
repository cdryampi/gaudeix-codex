import * as React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { Button } from "./button";
import {
  Bold,
  Italic,
  Strikethrough,
  UnderlineIcon,
  Code,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link2,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Escribe algo...",
  className,
  disabled = false,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-md",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content: value,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[200px] px-3 py-2",
          className
        ),
      },
    },
  });

  // Sync external value when it changes after mount (e.g., editing existing content)
  React.useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const next = value || "";
    if (current !== next) {
      editor.commands.setContent(next, false);
    }
  }, [editor, value]);

  if (!editor) {
    return null;
  }

  const addLink = () => {
    const url = window.prompt("URL:");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const addImage = () => {
    const url = window.prompt("URL de la imagen:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  return (
    <div className="border rounded-md overflow-hidden bg-background">
      {/* Toolbar */}
      <div className="border-b bg-muted/50 p-2 flex flex-wrap gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn("h-8 w-8 p-0", editor.isActive("bold") && "bg-accent")}
          disabled={disabled}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn(
            "h-8 w-8 p-0",
            editor.isActive("italic") && "bg-accent"
          )}
          disabled={disabled}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={cn(
            "h-8 w-8 p-0",
            editor.isActive("underline") && "bg-accent"
          )}
          disabled={disabled}
        >
          <UnderlineIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={cn(
            "h-8 w-8 p-0",
            editor.isActive("strike") && "bg-accent"
          )}
          disabled={disabled}
        >
          <Strikethrough className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={cn("h-8 w-8 p-0", editor.isActive("code") && "bg-accent")}
          disabled={disabled}
        >
          <Code className="h-4 w-4" />
        </Button>

        <div className="w-px h-8 bg-border mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn(
            "h-8 w-8 p-0",
            editor.isActive("bulletList") && "bg-accent"
          )}
          disabled={disabled}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn(
            "h-8 w-8 p-0",
            editor.isActive("orderedList") && "bg-accent"
          )}
          disabled={disabled}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={cn(
            "h-8 w-8 p-0",
            editor.isActive("blockquote") && "bg-accent"
          )}
          disabled={disabled}
        >
          <Quote className="h-4 w-4" />
        </Button>

        <div className="w-px h-8 bg-border mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={cn(
            "h-8 w-8 p-0",
            editor.isActive({ textAlign: "left" }) && "bg-accent"
          )}
          disabled={disabled}
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={cn(
            "h-8 w-8 p-0",
            editor.isActive({ textAlign: "center" }) && "bg-accent"
          )}
          disabled={disabled}
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={cn(
            "h-8 w-8 p-0",
            editor.isActive({ textAlign: "right" }) && "bg-accent"
          )}
          disabled={disabled}
        >
          <AlignRight className="h-4 w-4" />
        </Button>

        <div className="w-px h-8 bg-border mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={addLink}
          className={cn("h-8 w-8 p-0", editor.isActive("link") && "bg-accent")}
          disabled={disabled}
        >
          <Link2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={addImage}
          className="h-8 w-8 p-0"
          disabled={disabled}
        >
          <ImageIcon className="h-4 w-4" />
        </Button>

        <div className="w-px h-8 bg-border mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          className="h-8 w-8 p-0"
          disabled={!editor.can().undo() || disabled}
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          className="h-8 w-8 p-0"
          disabled={!editor.can().redo() || disabled}
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  );
}
