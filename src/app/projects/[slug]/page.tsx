import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SocialIconRenderer } from "@/lib/social-icons";
import { getPublishedProject } from "@/lib/data";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await getPublishedProject(slug);
  if (!project) return { title: "Not Found" };

  return {
    title: project.seoTitle || project.title,
    description: project.seoDescription || project.excerpt,
    openGraph: {
      title: project.seoTitle || project.title,
      description: project.seoDescription || project.excerpt,
      images: project.thumbnail ? [{ url: project.thumbnail }] : undefined,
    },
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const project = await getPublishedProject(slug);
  if (!project) notFound();

  return (
    <main className="min-h-screen px-6 py-28 md:py-36">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/projects"
          className="text-xs tracking-widest uppercase text-malamaya hover:text-maiba-red transition-colors"
        >
          ← Projects
        </Link>

        <header className="mt-8 mb-10">
          <h1 className="font-display text-4xl md:text-6xl text-foreground">
            {project.title}
          </h1>
          {project.excerpt && (
            <p className="mt-5 font-accent italic text-lg text-malamaya-light leading-relaxed">
              {project.excerpt}
            </p>
          )}
        </header>

        {project.thumbnail && (
          <div className="relative aspect-[16/10] mb-10 overflow-hidden rounded-sm border border-malamaya-border/25 bg-malamaya-border/10">
            <Image
              src={project.thumbnail}
              alt={project.title}
              fill
              sizes="(min-width: 768px) 768px, 100vw"
              className="object-cover"
              unoptimized={project.thumbnail.startsWith("http")}
              priority
            />
          </div>
        )}

        {project.bodyHtml.trim() && (
          <div
            className="site-rich-text text-malamaya-light text-base md:text-lg leading-relaxed mb-12"
            dangerouslySetInnerHTML={{ __html: project.bodyHtml }}
          />
        )}

        {project.links.length > 0 && (
          <section className="pt-10 border-t border-malamaya-border/20">
            <p className="text-malamaya text-xs tracking-widest uppercase mb-5">
              Links
            </p>
            <div className="flex flex-wrap gap-4 sm:gap-5">
              {project.links.map((link, i) => (
                <a
                  key={`${link.label}-${i}`}
                  href={link.href}
                  aria-label={link.label}
                  target={
                    link.href.startsWith("mailto:") || link.href.startsWith("tel:")
                      ? undefined
                      : "_blank"
                  }
                  rel={
                    link.href.startsWith("mailto:") || link.href.startsWith("tel:")
                      ? undefined
                      : "noopener noreferrer"
                  }
                  className="group flex items-center gap-2 text-maiba-red text-sm transition-all duration-300 hover:text-white focus-visible:text-white hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.85)] focus-visible:drop-shadow-[0_0_10px_rgba(255,255,255,0.85)]"
                >
                  <SocialIconRenderer
                    iconId={link.iconId || ""}
                    customIconUrl={link.icon}
                    size={16}
                  />
                  {link.showLabel !== false && link.label}
                </a>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
