"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { useRef } from "react";

const COLOR_SWATCHES = [
  { label: "Charcoal", value: "#2C2B27" },
  { label: "Blush", value: "#E8C8BE" },
  { label: "Sage", value: "#8FA68A" },
  { label: "Rust", value: "#B5651D" },
];

function ToolbarButton({
  onClick,
  active,
  children,
  title,
}: {
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="text-[11px] tracking-widest uppercase px-2.5 py-1.5 transition-colors"
      style={{
        color: active ? "#2C2B27" : "rgba(44,43,39,0.5)",
        backgroundColor: active ? "#E8C8BE" : "transparent",
      }}
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({
  content,
  onChange,
  adminPassword,
}: {
  content: string;
  onChange: (html: string) => void;
  adminPassword: string;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      Link.configure({ openOnClick: false, autolink: true }),
      Image.configure({ HTMLAttributes: { style: "max-width: 100%; height: auto;" } }),
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "journal-editor-content",
      },
    },
  });

  async function uploadFile(file: File) {
    if (!editor) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload-image", {
        method: "POST",
        headers: { "x-admin-password": adminPassword },
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        editor.chain().focus().setImage({ src: data.url }).run();
      }
    } catch {
      // Non-fatal — user can retry
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    e.target.value = "";
  }

  async function insertImageFromUrl() {
    const url = window.prompt("Paste an image or GIF URL:");
    if (!url || !editor) return;
    try {
      const res = await fetch("/api/upload-image", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-password": adminPassword },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        editor.chain().focus().setImage({ src: data.url }).run();
      } else {
        // Fall back to hotlinking directly if re-hosting fails
        editor.chain().focus().setImage({ src: url }).run();
      }
    } catch {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }

  function setLink() {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL:", previousUrl ?? "");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  if (!editor) return null;

  return (
    <div style={{ border: "1px solid #C8BFB0" }}>
      {/* Toolbar */}
      <div
        className="flex flex-wrap items-center gap-1 px-2 py-2"
        style={{ borderBottom: "1px solid #EDE8DC", background: "#F7F4EE" }}
      >
        <ToolbarButton title="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
          B
        </ToolbarButton>
        <ToolbarButton title="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
          i
        </ToolbarButton>
        <ToolbarButton title="Underline" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          U
        </ToolbarButton>

        <span className="w-px h-4 mx-1" style={{ background: "#C8BFB0" }} />

        <ToolbarButton title="Heading 2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          H2
        </ToolbarButton>
        <ToolbarButton title="Heading 3" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          H3
        </ToolbarButton>

        <span className="w-px h-4 mx-1" style={{ background: "#C8BFB0" }} />

        <ToolbarButton title="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          List
        </ToolbarButton>
        <ToolbarButton title="Numbered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          1,2,3
        </ToolbarButton>
        <ToolbarButton title="Quote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          Quote
        </ToolbarButton>
        <ToolbarButton title="Link" active={editor.isActive("link")} onClick={setLink}>
          Link
        </ToolbarButton>

        <span className="w-px h-4 mx-1" style={{ background: "#C8BFB0" }} />

        {COLOR_SWATCHES.map((c) => (
          <button
            key={c.value}
            type="button"
            title={c.label}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().setColor(c.value).run()}
            className="w-5 h-5 rounded-full"
            style={{ backgroundColor: c.value, border: "1px solid rgba(0,0,0,0.15)" }}
          />
        ))}
        <label
          className="w-5 h-5 rounded-full relative overflow-hidden cursor-pointer"
          style={{ border: "1px solid rgba(0,0,0,0.15)", background: "conic-gradient(red, yellow, lime, cyan, blue, magenta, red)" }}
          title="Custom color"
        >
          <input
            type="color"
            onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </label>
        <ToolbarButton title="Clear color" onClick={() => editor.chain().focus().unsetColor().run()}>
          ✕
        </ToolbarButton>

        <span className="w-px h-4 mx-1" style={{ background: "#C8BFB0" }} />

        <ToolbarButton title="Insert image or gif" onClick={() => fileInputRef.current?.click()}>
          Upload image
        </ToolbarButton>
        <ToolbarButton title="Insert image/gif from URL" onClick={insertImageFromUrl}>
          Image URL
        </ToolbarButton>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Editable content */}
      <div className="px-4 py-4 bg-cream">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
