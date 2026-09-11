import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/navbar";
import Cursor from "@/components/MouseFollower";
import CanvasBackground from "@/components/canvas-background";
import ContactSection from "@/components/ContactSection";
import WhatsAppButton from "@/components/whatsapp-button";
import { getBlogBySlug, getAllBlogSlugs } from "@/lib/blogs";

export async function generateStaticParams() {
  const slugs = await getAllBlogSlugs();
  if (slugs.length === 0) {
    return [{ slug: "__placeholder__" }];
  }
  return slugs.map((slug) => ({ slug }));
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  if (!blog) {
    return {
      title: "Article Not Found | Innovelous",
      description: "The requested article could not be found.",
    };
  }

  const title = blog.meta_title || blog.title;
  const description =
    blog.meta_description || blog.excerpt || `${blog.title} - Read the complete engineering article from Innovelous.`;
  const canonicalUrl = `https://innovelous.com/blogs/${blog.slug}`;
  const ogImage = blog.cover_image || "https://innovelous.com/og-image.jpg";

  return {
    title: `${title} | Innovelous`,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${title} | Innovelous`,
      description,
      url: canonicalUrl,
      type: "article",
      publishedTime: blog.published_at || blog.created_at,
      modifiedTime: blog.updated_at || blog.created_at,
      siteName: "Innovelous",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: blog.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Innovelous`,
      description,
      images: [ogImage],
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  if (!blog) {
    notFound();
  }

  const articleStructuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: blog.title,
    description: blog.meta_description || blog.excerpt || blog.title,
    image: blog.cover_image ? [blog.cover_image] : ["https://innovelous.com/og-image.jpg"],
    datePublished: blog.published_at || blog.created_at,
    dateModified: blog.updated_at || blog.created_at,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://innovelous.com/blogs/${blog.slug}`,
    },
    author: {
      "@type": "Organization",
      name: "Innovelous",
      url: "https://innovelous.com",
    },
    publisher: {
      "@type": "Organization",
      name: "Innovelous",
      logo: {
        "@type": "ImageObject",
        url: "https://innovelous.com/logo.png",
      },
    },
  };

  return (
    <>
      {/* JSON-LD Structured Data for Rich Snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleStructuredData) }}
      />

      <WhatsAppButton phoneNumber="+92 334 9251936" />
      <Cursor />
      <CanvasBackground />
      <Navbar />

      <main className="relative min-h-screen bg-[#0a0a0a] text-white pt-32 pb-20 px-6 md:px-16 overflow-hidden">
        <article className="max-w-4xl mx-auto">
          {/* Breadcrumb & Meta header */}
          <header className="mb-12">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-neutral-500 mb-6">
              <Link href="/" className="hover:text-white transition-colors">
                Home
              </Link>
              <span>/</span>
              <Link href="/blogs" className="hover:text-white transition-colors">
                Blogs
              </Link>
              <span>/</span>
              <span className="text-purple-400 truncate max-w-xs">{blog.slug}</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.1] text-white mb-6">
              {blog.title}
            </h1>

            {blog.published_at && (
              <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 border-y border-white/10 py-4">
                <span className="text-neutral-600">Published:</span>
                <time dateTime={blog.published_at} className="text-neutral-300">
                  {new Date(blog.published_at).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </time>
              </div>
            )}

            {blog.excerpt && (
              <p className="text-lg md:text-xl text-neutral-300 font-light leading-relaxed mt-6 border-l-2 border-purple-500 pl-4">
                {blog.excerpt}
              </p>
            )}
          </header>

          {/* Cover image */}
          {blog.cover_image && (
            <div className="relative w-full h-[300px] md:h-[480px] rounded-3xl overflow-hidden border border-white/10 mb-12 bg-neutral-900 shadow-2xl">
              <img
                src={blog.cover_image}
                alt={blog.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Article HTML Content */}
          <div
            className="blog-content prose prose-invert prose-purple max-w-none text-neutral-300 leading-relaxed font-light space-y-6 [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:text-white [&_h1]:mt-8 [&_h1]:mb-4 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-white [&_h2]:mt-8 [&_h2]:mb-4 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-white [&_h3]:mt-6 [&_h3]:mb-3 [&_p]:leading-relaxed [&_p]:text-neutral-300 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-2 [&_blockquote]:border-l-4 [&_blockquote]:border-purple-500 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-neutral-400 [&_code]:bg-white/10 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-purple-300 [&_pre]:bg-black [&_pre]:p-4 [&_pre]:rounded-xl [&_pre]:border [&_pre]:border-white/10 [&_pre]:overflow-x-auto [&_img]:rounded-2xl [&_img]:border [&_img]:border-white/10 [&_img]:my-6 [&_a]:text-purple-400 [&_a]:underline hover:[&_a]:text-purple-300"
            dangerouslySetInnerHTML={{ __html: blog.content || "<p>No content provided for this post.</p>" }}
          />

          {/* Footer Back navigation */}
          <footer className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <Link
              href="/blogs"
              className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-purple-400 hover:text-purple-300 transition-colors"
            >
              <svg className="w-4 h-4 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
              Back to all insights
            </Link>

            <span className="text-xs font-mono text-neutral-600">
              © {new Date().getFullYear()} Innovelous Tech
            </span>
          </footer>
        </article>
      </main>

      <ContactSection showCapabilities={false} />
    </>
  );
}
