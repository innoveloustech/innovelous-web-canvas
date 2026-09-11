"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import QuillEditor from "@/components/admin/QuillEditor";
import { useLenis } from "@/lib/lenis-provider";
import type { Blog } from "@/lib/types/blog";

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/&/g, "-and-") // Replace & with 'and'
    .replace(/[^\w-]+/g, "") // Remove all non-word chars
    .replace(/--+/g, "-"); // Replace multiple - with single -
}

export default function BlogsTab() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [activeBlog, setActiveBlog] = useState<Blog | null>(null);
  const [modalMode, setModalMode] = useState<"CREATE" | "UPDATE" | "DELETE" | null>(null);

  const lenis = useLenis();

  // Form states
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [isPublished, setIsPublished] = useState(false);
  const [publishedAt, setPublishedAt] = useState<string>("");

  const [processing, setProcessing] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const modalWrapperRef = useRef<HTMLDivElement>(null);
  const modalBoxRef = useRef<HTMLDivElement>(null);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, [searchQuery]);

  useEffect(() => {
    if (modalMode) {
      lenis?.stop();
      document.body.style.overflow = "hidden";
    } else {
      lenis?.start();
      document.body.style.overflow = "";
    }

    return () => {
      lenis?.start();
      document.body.style.overflow = "";
    };
  }, [modalMode, lenis]);

  const syncBlogsData = async () => {
    const { data, error } = await supabase
      .from("blogs")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setBlogs(data);
    if (error) console.error("Database sync error for blogs:", error.message);
  };

  useEffect(() => {
    void syncBlogsData();
  }, []);

  useGSAP(
    () => {
      if (modalMode && modalWrapperRef.current && modalBoxRef.current) {
        gsap.fromTo(modalWrapperRef.current, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: "power2.out" });
        gsap.fromTo(modalBoxRef.current, { scale: 0.95, y: 15 }, { scale: 1, y: 0, duration: 0.3, ease: "back.out(1.1)" });
      }
    },
    { dependencies: [modalMode] }
  );

  const dismissModalContext = () => {
    if (modalWrapperRef.current && modalBoxRef.current) {
      const tl = gsap.timeline({
        onComplete: () => {
          setModalMode(null);
          setActiveBlog(null);
          clearFormFields();
        },
      });
      tl.to(modalBoxRef.current, { scale: 0.95, y: 10, opacity: 0, duration: 0.2, ease: "power2.in" }).to(
        modalWrapperRef.current,
        { opacity: 0, duration: 0.15 },
        "-=0.1"
      );
    } else {
      setModalMode(null);
    }
  };

  const clearFormFields = () => {
    setTitle("");
    setSlug("");
    setIsSlugManuallyEdited(false);
    setContent("");
    setExcerpt("");
    setMetaTitle("");
    setMetaDescription("");
    setCoverImageUrl("");
    setCoverFile(null);
    setIsPublished(false);
    setPublishedAt("");
  };

  const openFormModal = (mode: "CREATE" | "UPDATE" | "DELETE", blog?: Blog) => {
    if (blog) {
      setActiveBlog(blog);
      setTitle(blog.title || "");
      setSlug(blog.slug || "");
      setIsSlugManuallyEdited(true);
      setContent(blog.content || "");
      setExcerpt(blog.excerpt || "");
      setMetaTitle(blog.meta_title || "");
      setMetaDescription(blog.meta_description || "");
      setCoverImageUrl(blog.cover_image || "");
      setIsPublished(!!blog.published_at);
      setPublishedAt(blog.published_at ? new Date(blog.published_at).toISOString().slice(0, 16) : "");
    } else {
      clearFormFields();
    }
    setModalMode(mode);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!isSlugManuallyEdited) {
      setSlug(slugify(val));
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSlugManuallyEdited(true);
    setSlug(slugify(e.target.value));
  };

  const handleCoverUpload = async (file: File) => {
    setUploadingCover(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const fileName = `cover-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${ext}`;
      const filePath = `blogs/${fileName}`;

      const { error: uploadError } = await supabase.storage.from("site-assets").upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("site-assets").getPublicUrl(filePath);

      setCoverImageUrl(publicUrl);
      setCoverFile(null);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to upload cover image.");
    } finally {
      setUploadingCover(false);
    }
  };

  const handleFormSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim()) {
      alert("Title and Slug are required.");
      return;
    }

    setProcessing(true);
    try {
      let resolvedCoverUrl = coverImageUrl;

      if (coverFile) {
        const ext = coverFile.name.split(".").pop()?.toLowerCase() || "jpg";
        const fileName = `cover-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${ext}`;
        const filePath = `blogs/${fileName}`;

        const { error: uploadError } = await supabase.storage.from("site-assets").upload(filePath, coverFile, {
          cacheControl: "3600",
          upsert: false,
        });

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("site-assets").getPublicUrl(filePath);
        resolvedCoverUrl = publicUrl;
      }

      let finalPublishedAt: string | null = null;
      if (isPublished) {
        finalPublishedAt = publishedAt ? new Date(publishedAt).toISOString() : new Date().toISOString();
      }

      const blogData = {
        title: title.trim(),
        slug: slug.trim(),
        content: content || "",
        excerpt: excerpt.trim() || null,
        meta_title: metaTitle.trim() || null,
        meta_description: metaDescription.trim() || null,
        cover_image: resolvedCoverUrl || null,
        published_at: finalPublishedAt,
        updated_at: new Date().toISOString(),
      };

      if (modalMode === "CREATE") {
        const { error: insErr } = await supabase.from("blogs").insert([blogData]);
        if (insErr) throw insErr;
      } else if (modalMode === "UPDATE" && activeBlog) {
        const { error: updErr } = await supabase.from("blogs").update(blogData).eq("id", activeBlog.id);
        if (updErr) throw updErr;
      }

      await syncBlogsData();
      dismissModalContext();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "An error occurred while saving the blog post.");
    } finally {
      setProcessing(false);
    }
  };

  const extractStoragePathsFromBlog = (blog: Blog): string[] => {
    const paths: string[] = [];
    const extractPathFromUrl = (urlStr: string) => {
      try {
        if (urlStr.includes("/site-assets/")) {
          const path = urlStr.split("/site-assets/")[1]?.split("?")[0];
          if (path) paths.push(decodeURIComponent(path));
        }
      } catch (err) {
        console.warn("Could not parse image URL for deletion:", err);
      }
    };

    if (blog.cover_image) {
      extractPathFromUrl(blog.cover_image);
    }

    if (blog.content) {
      const imgRegex = /<img[^>]+src=["']([^"']+)["']/g;
      let match;
      while ((match = imgRegex.exec(blog.content)) !== null) {
        if (match[1]) {
          extractPathFromUrl(match[1]);
        }
      }
    }

    return Array.from(new Set(paths));
  };

  const handleDeletionCall = async () => {
    if (!activeBlog) return;
    setProcessing(true);
    try {
      // 1. Delete associated storage files (cover + inline content images)
      const storagePaths = extractStoragePathsFromBlog(activeBlog);
      if (storagePaths.length > 0) {
        const { error: storageDelErr } = await supabase.storage
          .from("site-assets")
          .remove(storagePaths);
        if (storageDelErr) {
          console.warn("Could not remove some files from storage:", storageDelErr.message);
        }
      }

      // 2. Delete blog row from database
      const { error: delErr } = await supabase.from("blogs").delete().eq("id", activeBlog.id);
      if (delErr) throw delErr;

      await syncBlogsData();
      dismissModalContext();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete blog post.");
    } finally {
      setProcessing(false);
    }
  };

  const filteredBlogs = useMemo(() => {
    if (!debouncedSearch.trim()) return blogs;
    const q = debouncedSearch.toLowerCase();
    return blogs.filter((b) => {
      return (
        b.title?.toLowerCase().includes(q) ||
        b.slug?.toLowerCase().includes(q) ||
        b.excerpt?.toLowerCase().includes(q) ||
        b.meta_title?.toLowerCase().includes(q)
      );
    });
  }, [blogs, debouncedSearch]);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/10 pb-8 mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">Manage Blogs</h1>
          <p className="text-neutral-500 text-xs mt-1 font-light">
            Create, edit, and optimize SEO metadata for blog posts.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/blogs"
            target="_blank"
            className="px-5 py-3 border border-white/10 hover:bg-white/5 text-neutral-400 hover:text-white text-xs uppercase tracking-wider rounded-xl transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            View Live Blogs
          </Link>
          <button
            onClick={() => openFormModal("CREATE")}
            className="px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium text-xs uppercase tracking-wider rounded-xl transition-colors"
          >
            Create Blog Post
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-8">
        <div className="relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search blogs by title, slug, excerpt, or meta keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-4 pl-12 bg-black border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500 transition-colors placeholder:text-neutral-600"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Blog Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBlogs.map((blog) => (
          <div
            key={blog.id}
            className="group border border-white/10 bg-white/[0.01] rounded-2xl p-6 flex flex-col justify-between hover:bg-white/[0.03] transition-colors min-h-[280px]"
          >
            <div>
              <div className="flex justify-between items-start gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[9px] font-mono tracking-widest uppercase px-2.5 py-0.5 border rounded-full ${
                      blog.published_at
                        ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10"
                        : "border-amber-500/40 text-amber-400 bg-amber-500/10"
                    }`}
                  >
                    {blog.published_at ? "Published" : "Draft"}
                  </span>
                </div>
                {blog.cover_image && (
                  <div className="w-14 h-14 rounded-lg border border-white/10 overflow-hidden bg-black flex-shrink-0">
                    <img src={blog.cover_image} alt={blog.title} className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <h3 className="text-lg font-medium tracking-tight mb-2 group-hover:text-purple-400 transition-colors">
                {blog.title}
              </h3>
              <p className="text-neutral-500 text-xs leading-relaxed line-clamp-2 font-light mb-3">
                {blog.excerpt || "No excerpt specified."}
              </p>

              <div className="space-y-1">
                <div className="text-[10px] font-mono text-purple-400/80 truncate">
                  /blogs/{blog.slug}
                </div>
                {blog.published_at && (
                  <div className="text-[10px] font-mono text-neutral-500">
                    Published: {new Date(blog.published_at).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2 border-t border-white/5 pt-4 mt-6">
              <Link
                href={`/blogs/${blog.slug}`}
                target="_blank"
                className="px-3 py-2 text-center text-xs border border-white/10 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
                title="Preview Post"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </Link>
              <button
                onClick={() => openFormModal("UPDATE", blog)}
                className="flex-1 py-2 text-center text-xs border border-white/10 rounded-lg text-neutral-300 hover:bg-white/5 transition-colors"
              >
                Edit Post
              </button>
              <button
                onClick={() => openFormModal("DELETE", blog)}
                className="px-3 py-2 text-center text-xs border border-red-500/20 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredBlogs.length === 0 && (
        <div className="flex items-center justify-center py-20 border border-dashed border-white/5 rounded-3xl">
          <p className="font-mono text-xs uppercase tracking-widest text-neutral-600">
            {debouncedSearch ? "No blog posts match your search." : "No Blog Posts Found. Click 'Create Blog Post' to begin."}
          </p>
        </div>
      )}

      {/* Modal */}
      {modalMode && (
        <div
          ref={modalWrapperRef}
          data-lenis-prevent
          className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto overscroll-contain no-scrollbar"
          onClick={dismissModalContext}
        >
          <div
            ref={modalBoxRef}
            data-lenis-prevent
            className="w-full max-w-4xl max-h-[90vh] overflow-y-auto overscroll-contain bg-[#0f0f11] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative my-8 no-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={dismissModalContext}
              className="absolute top-6 right-6 w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white transition-colors z-10"
            >
              &times;
            </button>

            {modalMode === "DELETE" ? (
              <div>
                <h3 className="text-2xl font-light tracking-tight text-white mb-2">Delete Blog Post</h3>
                <p className="text-neutral-400 text-sm font-light leading-relaxed mb-6">
                  Are you sure you want to permanently delete <span className="text-white font-medium">{activeBlog?.title}</span>? This action cannot be undone.
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={dismissModalContext}
                    className="px-4 py-2.5 text-xs uppercase tracking-wider font-medium text-neutral-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeletionCall}
                    disabled={processing}
                    className="px-5 py-2.5 text-xs uppercase tracking-wider font-semibold bg-red-600 hover:bg-red-700 text-white rounded-xl disabled:bg-neutral-800 transition-colors"
                  >
                    {processing ? "Deleting..." : "Confirm Delete"}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-2xl font-light tracking-tight text-white mb-6">
                  {modalMode === "CREATE" ? "Create New Blog Post" : "Edit Blog Post & SEO"}
                </h3>

                <form onSubmit={handleFormSubmission} className="space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-4 bg-white/[0.02] border border-white/5 p-5 rounded-2xl">
                    <h4 className="text-xs uppercase tracking-widest font-mono text-purple-400">1. Core Content</h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-neutral-400 font-mono mb-1">
                          Article Title *
                        </label>
                        <input
                          type="text"
                          value={title}
                          onChange={handleTitleChange}
                          required
                          placeholder="e.g. The Future of Distributed AI Systems"
                          className="w-full p-3 bg-black border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-neutral-400 font-mono mb-1">
                          URL Slug * (Auto-slugified)
                        </label>
                        <input
                          type="text"
                          value={slug}
                          onChange={handleSlugChange}
                          required
                          placeholder="the-future-of-distributed-ai-systems"
                          className="w-full p-3 bg-black border border-white/10 rounded-xl text-xs font-mono text-purple-300 focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-neutral-400 font-mono mb-1">
                        Short Excerpt / Summary
                      </label>
                      <textarea
                        value={excerpt}
                        onChange={(e) => setExcerpt(e.target.value)}
                        placeholder="Brief 1-2 sentence overview for cards and meta fallbacks..."
                        className="w-full p-3 bg-black border border-white/10 rounded-xl text-xs text-white min-h-[70px] resize-none focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-neutral-400 font-mono mb-1">
                        Article Body (Rich Text + Drag/Drop Image Uploads)
                      </label>
                      <QuillEditor
                        value={content}
                        onChange={setContent}
                        storageBucket="site-assets"
                        storagePathPrefix="blogs"
                      />
                    </div>
                  </div>

                  {/* Media & Publishing */}
                  <div className="space-y-4 bg-white/[0.02] border border-white/5 p-5 rounded-2xl">
                    <h4 className="text-xs uppercase tracking-widest font-mono text-purple-400">2. Cover Asset & Publishing</h4>

                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-neutral-400 font-mono mb-1">
                        Cover Image Asset (Upload to Supabase site-assets CDN)
                      </label>
                      <div className="flex flex-col sm:flex-row gap-4 items-start">
                        <div className="flex-1 w-full">
                          <input
                            type="text"
                            value={coverImageUrl}
                            onChange={(e) => setCoverImageUrl(e.target.value)}
                            placeholder="https://... or choose a file below to auto-upload"
                            className="w-full p-3 bg-black border border-white/10 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                          />
                          <div className="mt-2 p-3 border border-dashed border-white/10 rounded-xl text-center relative hover:border-white/20 transition-colors">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  const file = e.target.files[0];
                                  setCoverFile(file);
                                  handleCoverUpload(file);
                                }
                              }}
                              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            />
                            <p className="text-[11px] text-neutral-400 font-light">
                              {uploadingCover
                                ? "Uploading cover image to site-assets..."
                                : coverFile
                                ? `Selected: ${coverFile.name}`
                                : "Click or drop cover image to upload to CDN"}
                            </p>
                          </div>
                        </div>

                        {coverImageUrl && (
                          <div className="w-24 h-24 rounded-xl border border-white/10 overflow-hidden bg-black flex-shrink-0 relative group">
                            <img src={coverImageUrl} alt="Cover Preview" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setCoverImageUrl("")}
                              className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center text-red-400 text-xs transition-opacity"
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-neutral-400 font-mono mb-1">
                          Publication Status
                        </label>
                        <div className="flex items-center gap-3 h-10">
                          <button
                            type="button"
                            onClick={() => {
                              const next = !isPublished;
                              setIsPublished(next);
                              if (next && !publishedAt) {
                                setPublishedAt(new Date().toISOString().slice(0, 16));
                              }
                            }}
                            className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                              isPublished ? "bg-emerald-600" : "bg-neutral-700"
                            }`}
                          >
                            <span
                              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-300 ${
                                isPublished ? "translate-x-6" : "translate-x-0"
                              }`}
                            />
                          </button>
                          <span className="text-xs text-neutral-300 font-mono">
                            {isPublished ? "Published (Visible on SSG routes)" : "Draft (Hidden from public)"}
                          </span>
                        </div>
                      </div>

                      {isPublished && (
                        <div>
                          <label className="block text-[10px] uppercase tracking-wider text-neutral-400 font-mono mb-1">
                            Published Date & Time
                          </label>
                          <input
                            type="datetime-local"
                            value={publishedAt}
                            onChange={(e) => setPublishedAt(e.target.value)}
                            className="w-full p-3 bg-black border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* SEO & Meta Tags */}
                  <div className="space-y-4 bg-white/[0.02] border border-white/5 p-5 rounded-2xl">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs uppercase tracking-widest font-mono text-purple-400">
                        3. Custom SEO & Social Metadata
                      </h4>
                      <span className="text-[10px] font-mono text-neutral-500">
                        Falls back to Title / Excerpt if left empty
                      </span>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="text-[10px] uppercase tracking-wider text-neutral-400 font-mono">
                          Meta Title Tag (SEO)
                        </label>
                        <span className="text-[10px] font-mono text-neutral-500">
                          {metaTitle.length || title.length} / 60 chars
                        </span>
                      </div>
                      <input
                        type="text"
                        value={metaTitle}
                        onChange={(e) => setMetaTitle(e.target.value)}
                        placeholder={title || "Custom browser title for Google snippet..."}
                        className="w-full p-3 bg-black border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="text-[10px] uppercase tracking-wider text-neutral-400 font-mono">
                          Meta Description Tag (SEO & OpenGraph)
                        </label>
                        <span className="text-[10px] font-mono text-neutral-500">
                          {metaDescription.length || excerpt.length} / 160 chars
                        </span>
                      </div>
                      <textarea
                        value={metaDescription}
                        onChange={(e) => setMetaDescription(e.target.value)}
                        placeholder={excerpt || "Custom search engine snippet description..."}
                        className="w-full p-3 bg-black border border-white/10 rounded-xl text-xs text-white min-h-[60px] resize-none focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    {/* Google Search Snippet Preview */}
                    <div className="border border-white/5 bg-black/60 p-4 rounded-xl mt-3">
                      <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest block mb-2">
                        Google Search Preview
                      </span>
                      <div className="text-blue-400 text-sm font-medium hover:underline truncate">
                        {metaTitle || title || "Untitled Blog Post"} | Innovelous
                      </div>
                      <div className="text-emerald-500 text-xs font-mono truncate">
                        https://innovelous.com/blogs/{slug || "post-slug"}
                      </div>
                      <div className="text-neutral-400 text-xs mt-1 line-clamp-2">
                        {metaDescription || excerpt || "No description provided for this article."}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 justify-end pt-4 border-t border-white/5">
                    <button
                      type="button"
                      onClick={dismissModalContext}
                      className="px-4 py-2.5 text-xs uppercase tracking-wider font-medium text-neutral-400 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={processing || uploadingCover}
                      className="px-6 py-2.5 text-xs uppercase tracking-wider font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-xl disabled:bg-neutral-800 transition-colors"
                    >
                      {processing ? "Saving Post..." : modalMode === "CREATE" ? "Publish / Save Post" : "Save Changes"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
