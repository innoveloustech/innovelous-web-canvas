"use client";
import React, { useEffect, useRef } from "react";
import "quill/dist/quill.snow.css";

type Props = {
  value: string;
  onChange: (html: string) => void;
};

export default function QuillEditor({ value, onChange }: Props) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const quillRef = useRef<any>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const Quill = (await import("quill")).default;
      if (!mounted) return;
      if (editorRef.current && !quillRef.current) {
        quillRef.current = new Quill(editorRef.current, {
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
        });

        quillRef.current.clipboard.dangerouslyPasteHTML(value || "");
        quillRef.current.on("text-change", () => {
          onChange(quillRef.current.root.innerHTML);
        });
      }
    })();

    return () => {
      mounted = false;
      if (quillRef.current) {
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
      <div ref={editorRef} className="min-h-[200px] text-zinc-300 p-4 bg-white/2" />
    </div>
  );
}
