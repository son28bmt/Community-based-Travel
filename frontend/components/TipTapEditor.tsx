"use client";

import React, { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Image as ImageIcon,
  Link as LinkIcon,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Upload,
} from "lucide-react";

const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        renderHTML: (attributes) => {
          if (!attributes.width) return {};
          return { width: attributes.width };
        },
      },
      style: {
        default: null,
        renderHTML: (attributes) => {
          if (!attributes.style) return {};
          return { style: attributes.style };
        },
      },
    };
  },
});

interface TipTapEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const ToolButton = ({
  onClick,
  icon: Icon,
  title,
  isActive = false,
}: {
  onClick: () => void;
  icon: any;
  title: string;
  isActive?: boolean;
}) => (
  <button
    onClick={onClick}
    className={`p-2 rounded transition-colors ${
      isActive ? "bg-blue-200 text-blue-700" : "hover:bg-gray-200"
    }`}
    title={title}
    type="button"
  >
    <Icon size={18} />
  </button>
);

export default function TipTapEditor({
  value,
  onChange,
  placeholder,
}: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Link.configure({
        openOnClick: false,
      }),
      CustomImage.configure({
        inline: true,
        allowBase64: true,
      }),
    ],
    editorProps: {
      attributes: {
        class: "prose max-w-none focus:outline-none min-h-[16rem] p-6",
        "data-placeholder": placeholder || "Viết nội dung...",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    content: value,
  });

  // Sync content updates from parent
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  const insertImage = () => {
    const url = prompt("Nhập URL hình ảnh:");
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const uploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editor) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        editor.chain().focus().setImage({ src: base64 }).run();
      };
      reader.readAsDataURL(file);
    }
  };

  const setLink = () => {
    const url = prompt("Nhập URL liên kết:");
    if (url && editor) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  if (!editor) return null;

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="border-b bg-gray-50 p-2 overflow-x-auto">
        <div className="flex flex-wrap gap-1 min-w-max">
          {/* Text Formatting */}
          <div className="flex border-r pr-2">
            <ToolButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              icon={Bold}
              title="Đậm"
              isActive={editor.isActive("bold")}
            />
            <ToolButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              icon={Italic}
              title="Nghiêng"
              isActive={editor.isActive("italic")}
            />
            <ToolButton
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              icon={UnderlineIcon}
              title="Gạch chân"
              isActive={editor.isActive("underline")}
            />
          </div>

          {/* Headings */}
          <div className="flex border-r pr-2">
            <ToolButton
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 1 }).run()
              }
              icon={Heading1}
              title="Tiêu đề 1"
              isActive={editor.isActive("heading", { level: 1 })}
            />
            <ToolButton
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run()
              }
              icon={Heading2}
              title="Tiêu đề 2"
              isActive={editor.isActive("heading", { level: 2 })}
            />
          </div>

          {/* Alignment */}
          <div className="flex border-r pr-2">
            <ToolButton
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
              icon={AlignLeft}
              title="Căn trái"
              isActive={editor.isActive({ textAlign: "left" })}
            />
            <ToolButton
              onClick={() =>
                editor.chain().focus().setTextAlign("center").run()
              }
              icon={AlignCenter}
              title="Căn giữa"
              isActive={editor.isActive({ textAlign: "center" })}
            />
            <ToolButton
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
              icon={AlignRight}
              title="Căn phải"
              isActive={editor.isActive({ textAlign: "right" })}
            />
          </div>

          {/* Lists */}
          <div className="flex border-r pr-2">
            <ToolButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              icon={List}
              title="Danh sách"
              isActive={editor.isActive("bulletList")}
            />
            <ToolButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              icon={ListOrdered}
              title="Danh sách số"
              isActive={editor.isActive("orderedList")}
            />
          </div>

          {/* Media */}
          <div className="flex border-r pr-2 items-center">
            <ToolButton
              onClick={insertImage}
              icon={ImageIcon}
              title="Thêm ảnh từ URL"
            />
            <label
              className="p-2 hover:bg-gray-200 rounded transition-colors cursor-pointer flex items-center justify-center"
              title="Upload ảnh"
            >
              <Upload size={18} />
              <input
                type="file"
                accept="image/*"
                onChange={uploadImage}
                className="hidden"
              />
            </label>
            <ToolButton
              onClick={setLink}
              icon={LinkIcon}
              title="Thêm liên kết"
              isActive={editor.isActive("link")}
            />
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="relative">
        <EditorContent editor={editor} />
      </div>

      <style jsx global>{`
        .ProseMirror {
          outline: none;
        }
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #adb5bd;
          pointer-events: none;
          height: 0;
        }
        .ProseMirror img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          cursor: pointer;
          transition: transform 0.2s;
        }
        .ProseMirror img:hover {
          transform: scale(1.02);
        }
        .ProseMirror img.ProseMirror-selectednode {
          outline: 3px solid #3b82f6;
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
}
