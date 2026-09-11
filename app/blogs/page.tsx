import type { Metadata } from "next";
import { getPublishedBlogs } from "@/lib/blogs";
import BlogsClient from "@/components/blogs/BlogsClient";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const canonicalUrl = "https://innovelous.com/blogs";
  const title = "Engineering Insights & Perspectives | Innovelous";
  const description =
    "Explore in-depth articles, case studies, and engineering paradigms on full-stack web architecture, hardware design, and distributed systems from Innovelous.";

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "website",
      siteName: "Innovelous",
      images: [
        {
          url: "https://innovelous.com/og-image.jpg",
          width: 1200,
          height: 630,
          alt: "Innovelous Engineering Insights",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://innovelous.com/og-image.jpg"],
    },
  };
}

export default async function BlogsPage() {
  const blogs = await getPublishedBlogs();
  return <BlogsClient initialBlogs={blogs} />;
}
