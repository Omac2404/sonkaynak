"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";

function Btn({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`grid h-8 min-w-8 place-items-center rounded-md px-2 text-sm font-bold transition ${
        active ? "bg-sk-red text-white" : "text-neutral-600 hover:bg-neutral-100"
      }`}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const setLink = () => {
    const prev = editor.getAttributes("link").href ?? "";
    const url = window.prompt("Bağlantı URL'si:", prev);
    if (url === null) return;
    if (url === "") editor.chain().focus().unsetLink().run();
    else editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };
  const addImage = () => {
    const url = window.prompt("Görsel URL'si:");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-neutral-200 bg-neutral-50 px-2 py-1.5">
      <Btn title="Kalın" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
        <b>B</b>
      </Btn>
      <Btn title="İtalik" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <i>I</i>
      </Btn>
      <span className="mx-1 h-5 w-px bg-neutral-200" />
      <Btn title="Başlık 2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
        H2
      </Btn>
      <Btn title="Başlık 3" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
        H3
      </Btn>
      <span className="mx-1 h-5 w-px bg-neutral-200" />
      <Btn title="Madde listesi" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        •
      </Btn>
      <Btn title="Numaralı liste" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        1.
      </Btn>
      <Btn title="Alıntı" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        ❝
      </Btn>
      <Btn title="Ayraç" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
        ―
      </Btn>
      <span className="mx-1 h-5 w-px bg-neutral-200" />
      <Btn title="Bağlantı" active={editor.isActive("link")} onClick={setLink}>
        🔗
      </Btn>
      <Btn title="Görsel" onClick={addImage}>
        🖼
      </Btn>
      <span className="mx-1 h-5 w-px bg-neutral-200" />
      <Btn title="Geri al" onClick={() => editor.chain().focus().undo().run()}>
        ↶
      </Btn>
      <Btn title="İleri al" onClick={() => editor.chain().focus().redo().run()}>
        ↷
      </Btn>
    </div>
  );
}

export function RichEditor({ value, onChange }: { value: string; onChange: (html: string) => void }) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Link.configure({ openOnClick: false, autolink: true }),
      Image,
      Placeholder.configure({ placeholder: "Haber metnini buraya yazın…" }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: { attributes: { class: "sk-prose focus:outline-none" } },
  });

  if (!editor) {
    return <div className="h-72 animate-pulse rounded-xl border border-neutral-200 bg-neutral-50" />;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white focus-within:border-sk-red focus-within:ring-4 focus-within:ring-sk-red/10">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} className="min-h-[320px] px-5 py-4" />
    </div>
  );
}
