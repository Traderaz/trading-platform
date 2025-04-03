"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
}

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    editorProps: {
      attributes: {
        class: "prose prose-invert max-w-none bg-card border border-zinc-700/50 rounded-lg px-4 py-2 text-text min-h-[150px] focus:outline-none focus:ring-2 focus:ring-primary/50",
      },
    },
  });

  useEffect(() => {
    if (editor) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  useEffect(() => {
    if (editor) {
      editor.on("update", () => {
        onChange(editor.getHTML());
      });
    }
  }, [editor, onChange]);

  return (
    <div className="rich-text-editor">
      <div className="flex gap-2 mb-2">
        <button
          onClick={() => editor?.chain().focus().toggleBold().run()}
          className={`p-2 rounded ${editor?.isActive("bold") ? "bg-primary/20" : "hover:bg-card-hover"}`}
        >
          Bold
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          className={`p-2 rounded ${editor?.isActive("italic") ? "bg-primary/20" : "hover:bg-card-hover"}`}
        >
          Italic
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded ${editor?.isActive("bulletList") ? "bg-primary/20" : "hover:bg-card-hover"}`}
        >
          Bullet List
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded ${editor?.isActive("orderedList") ? "bg-primary/20" : "hover:bg-card-hover"}`}
        >
          Numbered List
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
} 