import { getSolutions, getSolutionBySlug } from "@/lib/solutions";
import SolutionClientWrapper from "@/components/solutions/SolutionClientWrapper";

// Ensure the page is entirely static
export const dynamic = 'force-static';

export async function generateStaticParams() {
  const solutions = await getSolutions();
  return solutions.map((sol) => ({
    slug: sol.slug,
  }));
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function SolutionPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getSolutionBySlug(slug);

  if (!data) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0a0a0a] text-white">
        <p className="font-mono text-neutral-500">Solution not found.</p>
      </div>
    );
  }

  return <SolutionClientWrapper data={data} />;
}