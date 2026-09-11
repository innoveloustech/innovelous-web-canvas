"use client";
import React, { useRef, useMemo, useState } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Navbar from "@/components/navbar";
import Cursor from "@/components/MouseFollower";
import CanvasBackground from "@/components/canvas-background";
import ContactSection from "@/components/ContactSection";
import WhatsAppButton from "@/components/whatsapp-button";
import type { Blog } from "@/lib/types/blog";

export default function BlogsClient({ initialBlogs }: { initialBlogs: Blog[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const blogs = useMemo(() => initialBlogs ?? [], [initialBlogs]);

  const filteredBlogs = useMemo(() => {
    if (!searchQuery.trim()) return blogs;
    const q = searchQuery.toLowerCase();
    return blogs.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        (b.excerpt && b.excerpt.toLowerCase().includes(q))
    );
  }, [blogs, searchQuery]);

  useGSAP(
    () => {
      if (blogs.length > 0) {
        gsap.fromTo(
          ".blog-card",
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.08,
            ease: "power3.out",
            overwrite: "auto",
          }
        );
      }
    },
    { scope: containerRef, dependencies: [blogs] }
  );

  return (
    <>
      <WhatsAppButton phoneNumber="+92 334 9251936" />
      <Cursor />
      <CanvasBackground />
      <Navbar />

      <main
        ref={containerRef}
        className="relative min-h-screen bg-[#0a0a0a] text-white pt-32 pb-20 px-6 md:px-16 overflow-hidden"
      >
        <div className="max-w-7xl mx-auto mb-16">
          <header className="max-w-3xl">
            <span className="text-xs font-mono tracking-widest uppercase text-purple-400 mb-3 block">
              Insights & Articles
            </span>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.95] mb-6">
              Engineering <br />
              <span className="text-neutral-500">Perspectives.</span>
            </h1>
            <p className="text-neutral-400 text-lg font-light leading-relaxed">
              Deep dives, architectural analyses, and engineering paradigms from the Innovelous technology team.
            </p>
          </header>
        </div>

        {/* Search */}
        <div className="max-w-7xl mx-auto mb-12">
          <div className="relative max-w-md">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-3.5 pl-11 bg-black/60 border border-white/10 rounded-2xl text-sm text-white focus:outline-none focus:border-purple-500 transition-colors placeholder:text-neutral-600 backdrop-blur-sm"
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

        {/* Blog Post List */}
        {filteredBlogs.length === 0 ? (
          <div className="max-w-7xl mx-auto flex items-center justify-center py-20 border border-dashed border-white/5 rounded-3xl">
            <p className="font-mono text-xs uppercase tracking-widest text-neutral-600">
              {searchQuery ? "No articles match your query." : "No Articles Published Yet."}
            </p>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBlogs.map((blog) => (
              <article
                key={blog.id}
                className="blog-card group flex flex-col justify-between bg-white/[0.02] border border-white/10 rounded-3xl overflow-hidden hover:border-purple-500/40 hover:bg-white/[0.04] transition-all duration-300"
              >
                <div>
                  <Link href={`/blogs/${blog.slug}`} className="block relative h-56 w-full overflow-hidden bg-neutral-900">
                    {blog.cover_image ? (
                      <img
                        src={blog.cover_image}
                        alt={blog.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900/20 to-neutral-900 text-neutral-600 font-mono text-xs uppercase tracking-widest">
                        Innovelous Tech
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  </Link>

                  <div className="p-6 md:p-8">
                    <header>
                      <div className="flex items-center gap-3 mb-4">
                        {blog.published_at && (
                          <time
                            dateTime={blog.published_at}
                            className="text-[11px] font-mono text-neutral-500 uppercase tracking-widest"
                          >
                            {new Date(blog.published_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </time>
                        )}
                        <span className="text-neutral-700">•</span>
                        <span className="text-[11px] font-mono text-purple-400 uppercase tracking-widest">
                          Article
                        </span>
                      </div>

                      <h2 className="text-2xl font-bold tracking-tight text-white mb-3 group-hover:text-purple-400 transition-colors line-clamp-2">
                        <Link href={`/blogs/${blog.slug}`}>{blog.title}</Link>
                      </h2>
                    </header>

                    {blog.excerpt && (
                      <p className="text-neutral-400 text-sm font-light leading-relaxed line-clamp-3 mb-6">
                        {blog.excerpt}
                      </p>
                    )}
                  </div>
                </div>

                <footer className="px-6 md:px-8 pb-6 md:pb-8 pt-0">
                  <Link
                    href={`/blogs/${blog.slug}`}
                    className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-purple-400 group-hover:text-purple-300 transition-colors"
                  >
                    Read Full Post
                    <svg
                      className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </footer>
              </article>
            ))}
          </div>
        )}
      </main>

      <ContactSection showCapabilities={false} />
    </>
  );
}
