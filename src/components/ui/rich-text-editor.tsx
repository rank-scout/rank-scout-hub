"use client";

import React, { useCallback, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import BoldExtension from '@tiptap/extension-bold';
import ItalicExtension from '@tiptap/extension-italic';
import HeadingExtension from '@tiptap/extension-heading';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import UnderlineExtension from '@tiptap/extension-underline';
import LinkExtension from '@tiptap/extension-link';
import ImageExtension from '@tiptap/extension-image';
import { 
  Bold, Italic, ListOrdered, List, Heading2, Heading3, Link as LinkIcon, Underline as UnderlineIcon, Image as ImageIcon
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, className }) => {
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      BoldExtension,
      ItalicExtension,
      HeadingExtension.configure({ levels: [2, 3] }),
      BulletList,
      OrderedList,
      ListItem,
      UnderlineExtension,
      LinkExtension.configure({ 
        openOnClick: false, 
        HTMLAttributes: { class: 'text-blue-600 underline' } 
      }),
      ImageExtension.configure({ 
        inline: true, 
        allowBase64: true, 
        HTMLAttributes: { class: 'rounded-xl shadow-md my-6 max-w-full h-auto' } 
      }),
    ],
    content: value,
    editorProps: { 
        attributes: { class: 'prose prose-sm max-w-none focus:outline-none min-h-[150px] px-4 py-3' } 
    },
    onUpdate: ({ editor }) => { onChange(editor.getHTML()); },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  const handleToggleBold = useCallback(() => editor?.chain().focus().toggleBold().run(), [editor]);
  const handleToggleItalic = useCallback(() => editor?.chain().focus().toggleItalic().run(), [editor]);
  const handleToggleUnderline = useCallback(() => editor?.chain().focus().toggleUnderline().run(), [editor]);
  const handleToggleBulletList = useCallback(() => editor?.chain().focus().toggleBulletList().run(), [editor]);
  const handleToggleOrderedList = useCallback(() => editor?.chain().focus().toggleOrderedList().run(), [editor]);
  const handleMakeH2 = useCallback(() => editor?.chain().focus().toggleHeading({ level: 2 }).run(), [editor]);
  const handleMakeH3 = useCallback(() => editor?.chain().focus().toggleHeading({ level: 3 }).run(), [editor]);
  
  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL eingeben', previousUrl);
    if (url === null) return;
    if (url === '') { editor.chain().focus().extendMarkRange('link').unsetLink().run(); return; }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const addImage = useCallback(() => {
    if (!editor) return;
    const url = window.prompt('Bild-URL eingeben');
    if (url) editor.chain().focus().setImage({ src: url }).run();
  }, [editor]);

  if (!editor) return null;

  const isActive = (type: string, options?: any) => editor.isActive(type, options) ? "bg-slate-200 text-slate-900" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100";

  return (
    <div className={cn("border rounded-md bg-white shadow-sm overflow-hidden", className)}>
      <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-slate-50">
        <Button type="button" size="sm" variant="ghost" className={isActive('heading', { level: 2 })} onClick={handleMakeH2}><Heading2 className="w-4 h-4" /></Button>
        <Button type="button" size="sm" variant="ghost" className={isActive('heading', { level: 3 })} onClick={handleMakeH3}><Heading3 className="w-4 h-4" /></Button>
        <div className="w-px h-6 bg-slate-300 mx-1" />
        <Button type="button" size="sm" variant="ghost" className={isActive('bold')} onClick={handleToggleBold}><Bold className="w-4 h-4" /></Button>
        <Button type="button" size="sm" variant="ghost" className={isActive('italic')} onClick={handleToggleItalic}><Italic className="w-4 h-4" /></Button>
        <Button type="button" size="sm" variant="ghost" className={isActive('underline')} onClick={handleToggleUnderline}><UnderlineIcon className="w-4 h-4" /></Button>
        <div className="w-px h-6 bg-slate-300 mx-1" />
        <Button type="button" size="sm" variant="ghost" className={isActive('bulletList')} onClick={handleToggleBulletList}><List className="w-4 h-4" /></Button>
        <Button type="button" size="sm" variant="ghost" className={isActive('orderedList')} onClick={handleToggleOrderedList}><ListOrdered className="w-4 h-4" /></Button>
        <div className="w-px h-6 bg-slate-300 mx-1" />
        <Button type="button" size="sm" variant="ghost" className={isActive('link')} onClick={setLink}><LinkIcon className="w-4 h-4" /></Button>
        <Button type="button" size="sm" variant="ghost" className={isActive('image')} onClick={addImage}><ImageIcon className="w-4 h-4" /></Button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
};

export default RichTextEditor;