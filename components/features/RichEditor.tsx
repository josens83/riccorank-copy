'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { useCallback } from 'react';

interface RichEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  editable?: boolean;
  minHeight?: string;
}

/**
 * Rich Text Editor Component
 * 
 * Features:
 * - Bold, Italic, Strike, Code
 * - Headings (H1-H6)
 * - Lists (Ordered, Unordered)
 * - Links, Images
 * - Blockquotes
 */
export function RichEditor({
  content,
  onChange,
  placeholder = '내용을 입력하세요...',
  editable = true,
  minHeight = '300px',
}: RichEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 underline',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded',
        },
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const setLink = useCallback(() => {
    if (!editor) return;

    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL을 입력하세요:', previousUrl);

    if (url === null) return;

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const addImage = useCallback(() => {
    if (!editor) return;

    const url = window.prompt('이미지 URL을 입력하세요:');

    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      {editable && (
        <div className="flex flex-wrap gap-1 p-2 border-b bg-gray-50">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? 'bg-gray-300 px-3 py-1 rounded' : 'px-3 py-1 rounded hover:bg-gray-200'}
            type="button"
          >
            <strong>B</strong>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? 'bg-gray-300 px-3 py-1 rounded' : 'px-3 py-1 rounded hover:bg-gray-200'}
            type="button"
          >
            <em>I</em>
          </button>
          <button
            onClick={setLink}
            className="px-3 py-1 rounded hover:bg-gray-200"
            type="button"
          >
            Link
          </button>
          <button
            onClick={addImage}
            className="px-3 py-1 rounded hover:bg-gray-200"
            type="button"
          >
            Image
          </button>
        </div>
      )}

      <EditorContent
        editor={editor}
        className="prose max-w-none p-4"
        style={{ minHeight }}
      />
    </div>
  );
}
