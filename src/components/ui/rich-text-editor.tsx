"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  useEditor,
  EditorContent,
  NodeViewWrapper,
  ReactNodeViewRenderer,
  type NodeViewProps,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import UnderlineExtension from "@tiptap/extension-underline";
import LinkExtension from "@tiptap/extension-link";
import ImageExtension from "@tiptap/extension-image";
import { mergeAttributes } from "@tiptap/core";
import {
  Bold,
  Italic,
  ListOrdered,
  List,
  Heading2,
  Heading3,
  Link as LinkIcon,
  Underline as UnderlineIcon,
  Image as ImageIcon,
  Upload,
  Loader2,
  Type,
  Minus,
  Plus,
  Maximize2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { optimizeSupabaseImageUrl } from "@/lib/sanitizeHtml";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  uploadBucket?: string;
  imageWidth?: number;
  imageQuality?: number;
}

const EMPTY_EDITOR_HTML = "<p></p>";
const IMAGE_MIN_WIDTH = 220;
const IMAGE_MAX_WIDTH = 1400;
const IMAGE_DEFAULT_WIDTH = 920;
const IMAGE_WIDTH_STEP = 80;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const parseWidthAttribute = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return clamp(Math.round(value), IMAGE_MIN_WIDTH, IMAGE_MAX_WIDTH);
  }

  if (typeof value === "string") {
    const numeric = Number.parseInt(value.replace(/px$/i, "").trim(), 10);
    if (Number.isFinite(numeric)) {
      return clamp(numeric, IMAGE_MIN_WIDTH, IMAGE_MAX_WIDTH);
    }
  }

  return null;
};

const sanitizeFileName = (fileName: string) => {
  const withoutExtension = fileName.replace(/\.[^/.]+$/, "");
  const normalized = withoutExtension
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);

  return normalized || "forum-image";
};

const resolveDefaultImageWidth = (url: string): Promise<number> =>
  new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(IMAGE_DEFAULT_WIDTH);
      return;
    }

    const image = new window.Image();
    image.onload = () => {
      const naturalWidth = image.naturalWidth || IMAGE_DEFAULT_WIDTH;
      resolve(clamp(naturalWidth, IMAGE_MIN_WIDTH, Math.min(IMAGE_MAX_WIDTH, naturalWidth)));
    };
    image.onerror = () => resolve(IMAGE_DEFAULT_WIDTH);
    image.src = url;
  });

const ResizableImageView: React.FC<NodeViewProps> = ({ node, selected, updateAttributes }) => {
  const imageRef = useRef<HTMLImageElement | null>(null);
  const resizeStateRef = useRef<{ startX: number; startWidth: number } | null>(null);
  const persistedWidth = parseWidthAttribute(node.attrs.width);

  useEffect(() => {
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const handleMouseMove = (event: MouseEvent) => {
    const resizeState = resizeStateRef.current;
    if (!resizeState) return;

    const deltaX = event.clientX - resizeState.startX;
    const nextWidth = clamp(Math.round(resizeState.startWidth + deltaX), IMAGE_MIN_WIDTH, IMAGE_MAX_WIDTH);
    updateAttributes({ width: nextWidth });
  };

  const handleMouseUp = () => {
    resizeStateRef.current = null;
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
  };

  const handleResizeStart = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const currentWidth = imageRef.current?.getBoundingClientRect().width || persistedWidth || IMAGE_DEFAULT_WIDTH;
    resizeStateRef.current = {
      startX: event.clientX,
      startWidth: currentWidth,
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <NodeViewWrapper className="my-6" data-drag-handle={false}>
      <div className="flex justify-center" contentEditable={false}>
        <div
          className={cn(
            "group relative inline-flex max-w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-md",
            selected ? "ring-2 ring-orange-500/50 ring-offset-2 ring-offset-white" : ""
          )}
        >
          <img
            ref={imageRef}
            src={node.attrs.src}
            alt={node.attrs.alt || ""}
            title={node.attrs.title || undefined}
            width={persistedWidth || undefined}
            className="max-w-full h-auto object-contain"
            loading={node.attrs.loading || "lazy"}
            decoding="async"
            draggable={false}
          />

          {selected && (
            <>
              <div className="pointer-events-none absolute left-3 top-3 rounded-full bg-slate-900/80 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
                {persistedWidth || Math.round(imageRef.current?.getBoundingClientRect().width || IMAGE_DEFAULT_WIDTH)} px
              </div>
              <button
                type="button"
                onMouseDown={handleResizeStart}
                className="absolute bottom-3 right-3 h-5 w-5 cursor-se-resize rounded-full border border-white bg-orange-500 shadow-lg transition-transform hover:scale-110"
                aria-label="Bildgröße ziehen"
                title="Bild größer oder kleiner ziehen"
              />
            </>
          )}
        </div>
      </div>
    </NodeViewWrapper>
  );
};

const ResizableImageExtension = ImageExtension.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (element) => {
          const widthAttr = element.getAttribute("width");
          const widthFromStyle = element instanceof HTMLElement ? element.style.width : "";
          return parseWidthAttribute(widthAttr || widthFromStyle || null);
        },
        renderHTML: (attributes) => {
          const width = parseWidthAttribute(attributes.width);
          return width ? { width: String(width) } : {};
        },
      },
      loading: {
        default: "lazy",
        parseHTML: (element) => element.getAttribute("loading") || "lazy",
        renderHTML: (attributes) => ({ loading: attributes.loading || "lazy" }),
      },
      class: {
        default: "mx-auto my-6 rounded-xl border border-slate-200 shadow-md max-w-full h-auto",
      },
    };
  },

  renderHTML({ HTMLAttributes }) {
    const width = parseWidthAttribute(HTMLAttributes.width);
    return [
      "img",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        width: width ? String(width) : undefined,
        class:
          HTMLAttributes.class ||
          "mx-auto my-6 rounded-xl border border-slate-200 shadow-md max-w-full h-auto",
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageView);
  },
});

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  className,
  uploadBucket,
  imageWidth = 1280,
  imageQuality = 80,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [, setEditorVersion] = useState(0);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      UnderlineExtension,
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-orange-500 underline underline-offset-4",
          rel: "noopener noreferrer nofollow",
          target: "_blank",
        },
      }),
      ResizableImageExtension.configure({
        inline: false,
        allowBase64: false,
        HTMLAttributes: {
          class: "mx-auto my-6 rounded-xl border border-slate-200 shadow-md max-w-full h-auto",
          loading: "lazy",
        },
      }),
    ],
    content: value || EMPTY_EDITOR_HTML,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose-base max-w-none min-h-[280px] px-4 py-4 focus:outline-none " +
          "prose-headings:tracking-tight prose-headings:text-slate-900 prose-p:text-slate-700 prose-p:leading-relaxed " +
          "prose-a:text-orange-500 prose-a:font-semibold prose-img:mx-auto prose-img:max-w-full prose-img:h-auto",
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;

    const nextValue = value || EMPTY_EDITOR_HTML;
    if (editor.getHTML() !== nextValue) {
      editor.commands.setContent(nextValue, false);
    }
  }, [value, editor]);

  useEffect(() => {
    if (!editor) return;

    const rerender = () => setEditorVersion((current) => current + 1);

    editor.on("update", rerender);
    editor.on("selectionUpdate", rerender);
    editor.on("transaction", rerender);

    return () => {
      editor.off("update", rerender);
      editor.off("selectionUpdate", rerender);
      editor.off("transaction", rerender);
    };
  }, [editor]);

  const currentTextStyle = useMemo(() => {
    if (!editor) return "paragraph";
    if (editor.isActive("heading", { level: 2 })) return "h2";
    if (editor.isActive("heading", { level: 3 })) return "h3";
    return "paragraph";
  }, [editor, editor?.state]);

  const selectedImageWidth = useMemo(() => {
    if (!editor || !editor.isActive("image")) return null;
    return parseWidthAttribute(editor.getAttributes("image").width);
  }, [editor, editor?.state]);

  const handleToggleBold = useCallback(() => editor?.chain().focus().toggleBold().run(), [editor]);
  const handleToggleItalic = useCallback(() => editor?.chain().focus().toggleItalic().run(), [editor]);
  const handleToggleUnderline = useCallback(() => editor?.chain().focus().toggleUnderline().run(), [editor]);
  const handleToggleBulletList = useCallback(() => editor?.chain().focus().toggleBulletList().run(), [editor]);
  const handleToggleOrderedList = useCallback(() => editor?.chain().focus().toggleOrderedList().run(), [editor]);

  const adjustSelectedImageWidth = useCallback(
    (delta: number) => {
      if (!editor || !editor.isActive("image")) return;
      const currentWidth = parseWidthAttribute(editor.getAttributes("image").width) || IMAGE_DEFAULT_WIDTH;
      editor
        .chain()
        .focus()
        .updateAttributes("image", { width: clamp(currentWidth + delta, IMAGE_MIN_WIDTH, IMAGE_MAX_WIDTH) })
        .run();
    },
    [editor]
  );

  const resetSelectedImageWidth = useCallback(() => {
    if (!editor || !editor.isActive("image")) return;
    editor.chain().focus().updateAttributes("image", { width: null }).run();
  }, [editor]);

  const handleTextStyleChange = useCallback(
    (nextValue: string) => {
      if (!editor) return;

      if (nextValue === "h2") {
        editor.chain().focus().setHeading({ level: 2 }).run();
        return;
      }

      if (nextValue === "h3") {
        editor.chain().focus().setHeading({ level: 3 }).run();
        return;
      }

      editor.chain().focus().setParagraph().run();
    },
    [editor]
  );

  const setLink = useCallback(() => {
    if (!editor) return;

    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL eingeben", previousUrl);

    if (url === null) return;

    if (url.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url.trim() })
      .run();
  }, [editor]);

  const insertImage = useCallback(
    async (rawUrl: string, altText?: string) => {
      if (!editor) return;

      const optimizedUrl = optimizeSupabaseImageUrl(rawUrl.trim(), imageWidth, imageQuality);
      const defaultWidth = await resolveDefaultImageWidth(optimizedUrl);

      editor
        .chain()
        .focus()
        .setImage({
          src: optimizedUrl,
          alt: altText,
          width: defaultWidth,
        })
        .run();
    },
    [editor, imageQuality, imageWidth]
  );

  const addImageByUrl = useCallback(async () => {
    const url = window.prompt("Bild-URL eingeben");
    if (!url?.trim()) return;

    await insertImage(url.trim());
  }, [insertImage]);

  const handleUploadButtonClick = useCallback(() => {
    if (!uploadBucket) {
      void addImageByUrl();
      return;
    }

    fileInputRef.current?.click();
  }, [addImageByUrl, uploadBucket]);

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file || !editor || !uploadBucket) return;

      setIsUploading(true);
      try {
        const extension = file.name.split(".").pop()?.toLowerCase() || "webp";
        const fileName = `${sanitizeFileName(file.name)}-${Date.now()}.${extension}`;

        const { error: uploadError } = await supabase.storage.from(uploadBucket).upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from(uploadBucket).getPublicUrl(fileName);
        await insertImage(data.publicUrl, sanitizeFileName(file.name).replace(/-/g, " "));
        toast.success("Bild hochgeladen und eingefügt");
      } catch (error) {
        console.error(error);
        toast.error("Bild-Upload fehlgeschlagen");
      } finally {
        event.target.value = "";
        setIsUploading(false);
      }
    },
    [editor, insertImage, uploadBucket]
  );

  if (!editor) return null;

  const isActive = (type: string, options?: Record<string, unknown>) =>
    editor.isActive(type, options)
      ? "bg-slate-900 text-white hover:bg-slate-800"
      : "text-slate-500 hover:text-slate-900 hover:bg-slate-100";

  return (
    <div className={cn("border rounded-xl bg-white shadow-sm overflow-hidden", className)}>
      <div className="flex flex-wrap items-center gap-2 p-3 border-b bg-slate-50">
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 py-1">
          <Type className="w-4 h-4 text-slate-400" />
          <Select value={currentTextStyle} onValueChange={handleTextStyleChange}>
            <SelectTrigger className="h-8 min-w-[165px] border-0 px-1 shadow-none focus:ring-0">
              <SelectValue placeholder="Textgröße" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="paragraph">Standardtext</SelectItem>
              <SelectItem value="h2">Große Überschrift</SelectItem>
              <SelectItem value="h3">Mittlere Überschrift</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1">
          <Button type="button" size="sm" variant="ghost" className={isActive("bold")} onClick={handleToggleBold}>
            <Bold className="w-4 h-4" />
          </Button>
          <Button type="button" size="sm" variant="ghost" className={isActive("italic")} onClick={handleToggleItalic}>
            <Italic className="w-4 h-4" />
          </Button>
          <Button type="button" size="sm" variant="ghost" className={isActive("underline")} onClick={handleToggleUnderline}>
            <UnderlineIcon className="w-4 h-4" />
          </Button>
        </div>

        <div className="w-px h-7 bg-slate-200" />

        <div className="flex items-center gap-1">
          <Button type="button" size="sm" variant="ghost" className={isActive("heading", { level: 2 })} onClick={() => handleTextStyleChange("h2")}>
            <Heading2 className="w-4 h-4" />
          </Button>
          <Button type="button" size="sm" variant="ghost" className={isActive("heading", { level: 3 })} onClick={() => handleTextStyleChange("h3")}>
            <Heading3 className="w-4 h-4" />
          </Button>
        </div>

        <div className="w-px h-7 bg-slate-200" />

        <div className="flex items-center gap-1">
          <Button type="button" size="sm" variant="ghost" className={isActive("bulletList")} onClick={handleToggleBulletList}>
            <List className="w-4 h-4" />
          </Button>
          <Button type="button" size="sm" variant="ghost" className={isActive("orderedList")} onClick={handleToggleOrderedList}>
            <ListOrdered className="w-4 h-4" />
          </Button>
        </div>

        <div className="w-px h-7 bg-slate-200" />

        <Button type="button" size="sm" variant="ghost" className={isActive("link")} onClick={setLink}>
          <LinkIcon className="w-4 h-4" />
        </Button>

        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="text-slate-500 hover:text-slate-900 hover:bg-slate-100"
          onClick={handleUploadButtonClick}
          disabled={isUploading}
          title={uploadBucket ? "Bild hochladen" : "Bild per URL einfügen"}
        >
          {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : uploadBucket ? <Upload className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
        </Button>

        {!uploadBucket && (
          <Button type="button" size="sm" variant="ghost" className="text-slate-500 hover:text-slate-900 hover:bg-slate-100" onClick={() => void addImageByUrl()}>
            <ImageIcon className="w-4 h-4" />
          </Button>
        )}

        {editor.isActive("image") && (
          <>
            <div className="w-px h-7 bg-slate-200" />
            <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                onClick={() => adjustSelectedImageWidth(-IMAGE_WIDTH_STEP)}
                title="Bild schmaler machen"
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="min-w-[68px] text-center text-xs font-bold text-slate-500">
                {selectedImageWidth ? `${selectedImageWidth}px` : "Auto"}
              </span>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                onClick={() => adjustSelectedImageWidth(IMAGE_WIDTH_STEP)}
                title="Bild breiter machen"
              >
                <Plus className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                onClick={resetSelectedImageWidth}
                title="Bild auf automatische Breite zurücksetzen"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
            </div>
          </>
        )}
      </div>

      <EditorContent editor={editor} />

      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
    </div>
  );
};

export default RichTextEditor;
