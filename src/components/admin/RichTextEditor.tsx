"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import ImageExt from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Image,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  Minus,
} from "lucide-react";

interface Props {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ content, onChange, placeholder }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-maiba-red underline" },
      }),
      ImageExt.configure({
        HTMLAttributes: { class: "rounded-sm max-w-full" },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Placeholder.configure({
        placeholder: placeholder || "Start writing...",
      }),
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "min-h-[200px] sm:min-h-[300px] px-3 sm:px-4 py-3 text-foreground text-sm leading-7 focus:outline-none prose-headings:font-display prose-headings:text-foreground prose-p:text-malamaya-light prose-a:text-maiba-red prose-strong:text-foreground prose-blockquote:border-malamaya-border prose-blockquote:text-malamaya-light prose-code:text-maiba-red prose-code:bg-malamaya-border/20 prose-code:px-1 prose-code:rounded-sm prose-hr:border-malamaya-border/30 prose-img:rounded-sm prose-img:border prose-img:border-malamaya-border/20",
      },
    },
  });

  if (!editor) return null;

  const addLink = () => {
    const url = window.prompt("URL:");
    if (!url) return;
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const addImage = () => {
    const url = window.prompt("Image URL:");
    if (!url) return;
    editor.chain().focus().setImage({ src: url }).run();
  };

  return (
    <div className="border border-malamaya-border rounded-sm overflow-hidden">
      <div className="flex flex-wrap gap-0.5 px-2 py-1.5 border-b border-malamaya-border bg-midnight/50">
        <ToolBtn
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          icon={Bold}
          title="Bold"
        />
        <ToolBtn
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          icon={Italic}
          title="Italic"
        />
        <ToolBtn
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
          icon={UnderlineIcon}
          title="Underline"
        />
        <ToolBtn
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive("strike")}
          icon={Strikethrough}
          title="Strikethrough"
        />

        <Separator />

        <ToolBtn
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive("heading", { level: 1 })}
          icon={Heading1}
          title="Heading 1"
        />
        <ToolBtn
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive("heading", { level: 2 })}
          icon={Heading2}
          title="Heading 2"
        />
        <ToolBtn
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive("heading", { level: 3 })}
          icon={Heading3}
          title="Heading 3"
        />

        <Separator />

        <ToolBtn
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          icon={List}
          title="Bullet list"
        />
        <ToolBtn
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          icon={ListOrdered}
          title="Numbered list"
        />
        <ToolBtn
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          icon={Quote}
          title="Blockquote"
        />
        <ToolBtn
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive("codeBlock")}
          icon={Code}
          title="Code block"
        />
        <ToolBtn
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          icon={Minus}
          title="Horizontal rule"
        />

        <Separator />

        <ToolBtn
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          active={editor.isActive({ textAlign: "left" })}
          icon={AlignLeft}
          title="Align left"
        />
        <ToolBtn
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          active={editor.isActive({ textAlign: "center" })}
          icon={AlignCenter}
          title="Align center"
        />
        <ToolBtn
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          active={editor.isActive({ textAlign: "right" })}
          icon={AlignRight}
          title="Align right"
        />

        <Separator />

        <ToolBtn onClick={addLink} active={editor.isActive("link")} icon={LinkIcon} title="Add link" />
        <ToolBtn onClick={addImage} icon={Image} title="Add image" />

        <Separator />

        <ToolBtn
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          icon={Undo}
          title="Undo"
        />
        <ToolBtn
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          icon={Redo}
          title="Redo"
        />
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}

function ToolBtn({
  onClick,
  active,
  disabled,
  icon: Icon,
  title,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`w-7 h-7 flex items-center justify-center rounded-sm transition-colors ${
        active
          ? "bg-maiba-red/20 text-maiba-red"
          : "text-malamaya hover:text-foreground hover:bg-white/[0.04]"
      } disabled:opacity-30 disabled:cursor-not-allowed`}
    >
      <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />
    </button>
  );
}

function Separator() {
  return <div className="w-px h-5 bg-malamaya-border/30 mx-1 self-center" />;
}
