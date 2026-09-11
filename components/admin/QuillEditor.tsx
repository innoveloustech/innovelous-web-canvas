"use client";
import React, { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import "quill/dist/quill.snow.css";

type Props = {
  value: string;
  onChange: (html: string) => void;
  storageBucket?: string;
  storagePathPrefix?: string;
};

type QuillInstance = {
  root: { innerHTML: string; addEventListener: (event: string, listener: EventListenerOrEventListenerObject) => void; removeEventListener: (event: string, listener: EventListenerOrEventListenerObject) => void };
  clipboard: { dangerouslyPasteHTML: (html: string) => void };
  on: (event: string, handler: () => void) => void;
  getSelection: (focus?: boolean) => { index: number; length: number } | null;
  setSelection: (index: number, length: number) => void;
  insertEmbed: (index: number, type: string, value: string) => void;
  getModule: (name: string) => { addHandler: (action: string, handler: () => void) => void };
};

export default function QuillEditor({
  value,
  onChange,
  storageBucket = "site-assets",
  storagePathPrefix = "blogs",
}: Props) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const quillRef = useRef<QuillInstance | null>(null);

  const uploadFileToSupabase = async (file: File): Promise<string | null> => {
    try {
      const ext = file.name ? file.name.split(".").pop() : "png";
      const cleanExt = ext?.toLowerCase() || "png";
      const fileName = `inline-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${cleanExt}`;
      const filePath = storagePathPrefix ? `${storagePathPrefix}/${fileName}` : fileName;

      const { error: uploadError } = await supabase.storage
        .from(storageBucket)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Quill image upload error:", uploadError);
        alert(`Failed to upload image: ${uploadError.message}`);
        return null;
      }

      const { data } = supabase.storage.from(storageBucket).getPublicUrl(filePath);
      return data.publicUrl;
    } catch (err: unknown) {
      console.error("Exception during image upload:", err);
      alert(err instanceof Error ? err.message : "Error uploading image");
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;
    let handlePaste: ((e: ClipboardEvent) => void) | null = null;
    let handleDrop: ((e: DragEvent) => void) | null = null;

    (async () => {
      const Quill = (await import("quill")).default;
      if (!mounted) return;
      if (editorRef.current && !quillRef.current) {
        const quill = new Quill(editorRef.current, {
          theme: "snow",
          modules: {
            toolbar: [
              ["bold", "italic", "underline", "strike"],
              [{ header: [1, 2, 3, false] }],
              [{ list: "ordered" }, { list: "bullet" }],
              ["blockquote", "code-block"],
              ["link", "image"],
              ["clean"],
            ],
          },
        }) as unknown as QuillInstance;

        quillRef.current = quill;

        // Custom toolbar image handler
        const toolbar = quill.getModule("toolbar");
        toolbar.addHandler("image", () => {
          const input = document.createElement("input");
          input.setAttribute("type", "file");
          input.setAttribute("accept", "image/*");
          input.click();

          input.onchange = async () => {
            if (input.files && input.files[0]) {
              const file = input.files[0];
              const range = quill.getSelection(true);
              const url = await uploadFileToSupabase(file);
              if (url && range) {
                quill.insertEmbed(range.index, "image", url);
                quill.setSelection(range.index + 1, 0);
              }
            }
          };
        });

        // Drag & Drop and Paste Handler for inline images
        const rootElement = quill.root as unknown as HTMLElement;

        handlePaste = async (e: ClipboardEvent) => {
          const items = e.clipboardData?.items;
          if (!items) return;

          for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf("image") !== -1) {
              const file = items[i].getAsFile();
              if (file) {
                e.preventDefault();
                const range = quill.getSelection(true);
                const url = await uploadFileToSupabase(file);
                if (url && range) {
                  quill.insertEmbed(range.index, "image", url);
                  quill.setSelection(range.index + 1, 0);
                }
              }
            }
          }
        };

        handleDrop = async (e: DragEvent) => {
          const files = e.dataTransfer?.files;
          if (files && files.length > 0) {
            const file = files[0];
            if (file.type.startsWith("image/")) {
              e.preventDefault();
              const range = quill.getSelection(true);
              const url = await uploadFileToSupabase(file);
              if (url && range) {
                quill.insertEmbed(range.index, "image", url);
                quill.setSelection(range.index + 1, 0);
              }
            }
          }
        };

        rootElement.addEventListener("paste", handlePaste as EventListener);
        rootElement.addEventListener("drop", handleDrop as EventListener);

        quill.clipboard.dangerouslyPasteHTML(value || "");
        quill.on("text-change", () => {
          onChange(quill.root.innerHTML);
        });
      }
    })();

    return () => {
      mounted = false;
      if (quillRef.current && editorRef.current) {
        const rootElement = quillRef.current.root as unknown as HTMLElement;
        if (handlePaste) rootElement.removeEventListener("paste", handlePaste as EventListener);
        if (handleDrop) rootElement.removeEventListener("drop", handleDrop as EventListener);
        quillRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (quillRef.current && value !== quillRef.current.root.innerHTML) {
      const selection = quillRef.current.getSelection();
      quillRef.current.clipboard.dangerouslyPasteHTML(value || "");
      if (selection) quillRef.current.setSelection(selection.index, selection.length);
    }
  }, [value]);

  return (
    <div className="bg-black border border-white/10 rounded-xl overflow-hidden">
      <div ref={editorRef} className="min-h-[260px] text-zinc-300 p-4 bg-white/2" />
    </div>
  );
}

