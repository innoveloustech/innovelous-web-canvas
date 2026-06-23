import { getSolutionData } from "@/lib/solutions-data";
import SolutionClientWrapper from "@/components/solutions/SolutionClientWrapper";

// 1. Tell Next.js explicitly what static slug paths exist at build time for Cloudflare export
export async function generateStaticParams() {
  return [
    { slug: "hardware" },
    { slug: "software" },
  ];
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

// 2. Pure clean static Server Component acting as the entry point route
export default async function SolutionPage({ params }: PageProps) {
  const { slug } = await params;
  const data = getSolutionData(slug);

  if (!data) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0a0a0a] text-white">
        <p className="font-mono text-neutral-500">Solution not found.</p>
      </div>
    );
  }

  return <SolutionClientWrapper data={data} />;
}