import type { MetadataRoute } from "next";
import { getPublishedEntries } from "@/lib/data";

const baseUrl = "https://maiba.studio";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries = await getPublishedEntries();
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
    url: `${baseUrl}/field-notes/${entry.id}`,
    lastModified: new Date(entry.updatedAt || entry.createdAt || entry.date),
  }));

  return [...staticRoutes, ...fieldNotes];
}

