import { getProjects } from "@/lib/projects";
import ProjectsClient from "@/components/projects/ProjectsClient";

export const revalidate = 60;

export default async function ProjectsPage() {
  const { projects, mainCategories } = await getProjects();
  return <ProjectsClient initialProjects={projects} initialMainCategories={mainCategories} />;
}