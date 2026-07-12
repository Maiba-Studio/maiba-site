import type { MetadataRoute } from "next";
import { getPublishedEntries, getPublishedMembers } from "@/lib/data";

const baseUrl = "https://maiba.studio";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [entries, members] = await Promise.all([
    getPublishedEntries(),
    getPublishedMembers(),
  ]);
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/about",
    "/archive",
    "/contact",
    "/ritual",
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

  return [...staticRoutes, ...fieldNotes, ...memberPages];
}

