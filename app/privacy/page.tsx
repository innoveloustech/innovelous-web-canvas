export const metadata = {
  title: "Privacy Policy | Innovelous",
  description: "Transparency regarding our data practices and user privacy.",
};

export const revalidate = 60; // revalidate every minute

import Link from "next/link";
import { getSitePage } from "@/lib/site-pages";

// server-side SSG: fetch privacy page at build time (and revalidate)
export default async function PrivacyPolicy() {
  const page = await getSitePage("privacy");
  const content = page?.content ?? "";
  const updated = page?.updated_at ? new Date(page.updated_at).toLocaleDateString() : "—";

  return (
    <main className="min-h-screen bg-black text-white selection:bg-white/20 selection:text-white">
      <div className="max-w-4xl mx-auto px-6 py-24 md:py-32">
        {/* Header */}
        <header className="border-b border-white/10 pb-8 mb-12">
          <Link
            href="/"
            className="text-sm text-zinc-400 hover:text-white transition-colors duration-200 inline-flex items-center gap-2 mb-6 group"
          >
            <span className="group-hover:-translate-x-1 transition-transform duration-200">←</span>
            Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">{page?.title ?? "Privacy Policy"}</h1>
          <p className="text-zinc-400 text-sm">Last Updated: {updated}</p>
        </header>

        {/* Content Sections (rendered from DB) */}
        <div className="space-y-12 text-zinc-300 leading-relaxed">
          <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
        </div>

        {/* Footer info */}
        <footer className="mt-16 pt-8 border-t border-white/5 text-xs text-zinc-500 text-center">
          &copy; {new Date().getFullYear()} Innovelous Tech. Architecture built with absolute privacy by design.
        </footer>

      </div>
    </main>
  );
}