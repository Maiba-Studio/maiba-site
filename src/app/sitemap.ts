import type { MetadataRoute } from "next";
import {
  getPublishedEntries,
  getPublishedMembers,
  getPublishedProjects,
} from "@/lib/data";

const baseUrl = "https://maiba.studio";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [entries, members, projects] = await Promise.all([
    getPublishedEntries(),
    getPublishedMembers(),
    getPublishedProjects(),
  ]);
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/about",
    "/archive",
    "/contact",
    "/ritual",
    "/projects",
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: now,
  }));

  const fieldNotes: MetadataRoute.Sitemap = entries.map((entry) => ({
    url: `${baseUrl}/field-notes/${entry.slug || entry.id}`,
    lastModified: new Date(entry.updatedAt || entry.createdAt || entry.date),
  }));

  const memberPages: MetadataRoute.Sitemap = members
    .filter((m) => !m.noindex)
    .map((member) => ({
      url:
        member.slug === "el"
          ? `${baseUrl}/el`
          : `${baseUrl}/members/${member.slug}`,
      lastModified: new Date(member.updatedAt || member.createdAt),
    }));

  const projectPages: MetadataRoute.Sitemap = projects.map((project) => ({
    url: `${baseUrl}/projects/${project.slug}`,
    lastModified: new Date(project.updatedAt || project.createdAt),
  }));

  return [...staticRoutes, ...fieldNotes, ...memberPages, ...projectPages];
}
