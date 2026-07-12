import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getProjectsPageContent, getPublishedProjects } from "@/lib/data";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getProjectsPageContent();
  return {
    title: page.title || "Projects",
    description: page.subtitle || "Selected works from Maiba Studio.",
  };
}

export default async function ProjectsPage() {
  const [page, projects] = await Promise.all([
    getProjectsPageContent(),
    getPublishedProjects(),
  ]);

  return (
    <main className="min-h-screen px-6 py-28 md:py-36">
      <div className="mx-auto max-w-6xl">
        <header className="mb-14 md:mb-16 max-w-2xl">
          <p className="text-maiba-red text-xs tracking-[0.35em] uppercase mb-4">
            Maiba Studio
          </p>
          <h1 className="font-display text-5xl md:text-6xl text-foreground">
            {page.title}
          </h1>
          {page.subtitle && (
            <p className="mt-5 font-accent italic text-lg text-malamaya-light leading-relaxed">
              {page.subtitle}
            </p>
          )}
        </header>

        {projects.length === 0 ? (
          <p className="text-malamaya text-sm">
            No projects published yet. The archive is gathering.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.slug}`}
                className="group block border border-malamaya-border/25 rounded-sm overflow-hidden bg-white/[0.02] hover:border-maiba-red/40 transition-colors duration-500"
              >
                <div className="relative aspect-[4/3] bg-malamaya-border/20 overflow-hidden">
                  {project.thumbnail ? (
                    <Image
                      src={project.thumbnail}
                      alt={project.title}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                      unoptimized={project.thumbnail.startsWith("http")}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-malamaya-border text-xs tracking-widest uppercase">
                      No image
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h2 className="font-display text-xl text-foreground group-hover:text-maiba-red transition-colors duration-500">
                    {project.title}
                  </h2>
                  {project.excerpt && (
                    <p className="mt-2 text-sm text-malamaya leading-relaxed line-clamp-3">
                      {project.excerpt}
                    </p>
                  )}
                  <span className="inline-block mt-4 text-[10px] tracking-[0.3em] uppercase text-malamaya-border group-hover:text-maiba-red transition-colors">
                    View project →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
