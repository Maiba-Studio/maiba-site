import type { FieldNote, LampWord, SiteContent, SocialLink, StudioMember, UserRole } from "@/lib/data";
import { prepareFieldNoteBody, richTextField } from "@/lib/sanitize";

const USER_ROLES = ["admin", "moderator"] as const;

type FieldNoteInput = Omit<FieldNote, "id" | "createdAt" | "updatedAt">;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringValue(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value.trim() : fallback;
}

function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string").map((s) => s.trim()).filter(Boolean);
}

function normalizeTag(value: unknown): string {
  return stringValue(value)
    .toLowerCase()
    .replace(/[^a-z0-9-_\s]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 40);
}

function normalizeSlug(value: unknown): string {
  return stringValue(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function isUserRole(value: unknown): value is UserRole {
  return typeof value === "string" && USER_ROLES.includes(value as UserRole);
}

function normalizeUrl(value: unknown, { allowRelative = true } = {}): string {
  const raw = stringValue(value);
  if (!raw) return "";

  if (allowRelative && raw.startsWith("/")) return raw;

  try {
    const parsed = new URL(raw);
    if (["http:", "https:", "mailto:", "tel:"].includes(parsed.protocol)) return raw;
  } catch {
    return "";
  }

  return "";
}

export function parseSocialLinks(value: unknown): SocialLink[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(isRecord)
    .map((link) => ({
      label: stringValue(link.label),
      href: normalizeUrl(link.href),
      icon: normalizeUrl(link.icon),
      iconId: stringValue(link.iconId),
      showLabel: link.showLabel !== false,
    }))
    .filter((link) => link.label && link.href);
}

type StudioMemberInput = Omit<StudioMember, "id" | "createdAt" | "updatedAt">;

export function parseFieldNoteInput(value: unknown): FieldNoteInput | null {
  if (!isRecord(value)) return null;

  const title = stringValue(value.title);
  const excerpt = stringValue(value.excerpt);
  const tag = normalizeTag(value.tag);

  if (!title || !excerpt || !tag) {
    return null;
  }

  const links = Array.isArray(value.links)
    ? value.links
        .filter(isRecord)
        .map((link) => ({
          label: stringValue(link.label),
          url: normalizeUrl(link.url),
        }))
        .filter((link) => link.label && link.url)
    : [];

  return {
    title,
    slug: normalizeSlug(value.slug || title),
    headline: stringValue(value.headline),
    excerpt,
    body: prepareFieldNoteBody(typeof value.body === "string" ? value.body : ""),
    tag,
    date: stringValue(value.date, new Date().toISOString().slice(0, 10)),
    thumbnail: normalizeUrl(value.thumbnail),
    images: stringArray(value.images).map((url) => normalizeUrl(url)).filter(Boolean),
    links,
    seoTags: stringArray(value.seoTags),
    published: value.published === true,
  };
}

export function parseFieldNotePatch(value: unknown): Partial<Omit<FieldNote, "id" | "createdAt">> | null {
  if (!isRecord(value)) return null;

  const patch: Partial<Omit<FieldNote, "id" | "createdAt">> = {};

  if ("title" in value) patch.title = stringValue(value.title);
  if ("slug" in value) patch.slug = normalizeSlug(value.slug);
  if ("headline" in value) patch.headline = stringValue(value.headline);
  if ("excerpt" in value) patch.excerpt = stringValue(value.excerpt);
  if ("body" in value) patch.body = prepareFieldNoteBody(typeof value.body === "string" ? value.body : "");
  if ("tag" in value) {
    const tag = normalizeTag(value.tag);
    if (!tag) return null;
    patch.tag = tag;
  }
  if ("date" in value) patch.date = stringValue(value.date);
  if ("thumbnail" in value) patch.thumbnail = normalizeUrl(value.thumbnail);
  if ("images" in value) patch.images = stringArray(value.images).map((url) => normalizeUrl(url)).filter(Boolean);
  if ("links" in value) {
    if (!Array.isArray(value.links)) return null;
    patch.links = value.links
      .filter(isRecord)
      .map((link) => ({
        label: stringValue(link.label),
        url: normalizeUrl(link.url),
      }))
      .filter((link) => link.label && link.url);
  }
  if ("seoTags" in value) patch.seoTags = stringArray(value.seoTags);
  if ("published" in value) patch.published = value.published === true;

  return patch;
}

export function parseUserCreate(value: unknown): { username: string; password: string; role: UserRole } | null {
  if (!isRecord(value)) return null;
  const username = stringValue(value.username);
  const password = typeof value.password === "string" ? value.password : "";
  if (!username || password.length < 10 || !isUserRole(value.role)) return null;
  return { username, password, role: value.role };
}

export function parseUserPatch(value: unknown): { username?: string; password?: string; role?: UserRole } | null {
  if (!isRecord(value)) return null;
  const patch: { username?: string; password?: string; role?: UserRole } = {};

  if ("username" in value) patch.username = stringValue(value.username);
  if ("password" in value) {
    if (typeof value.password !== "string" || value.password.length < 10) return null;
    patch.password = value.password;
  }
  if ("role" in value) {
    if (!isUserRole(value.role)) return null;
    patch.role = value.role;
  }

  return patch;
}

export function parseLampWordInput(value: unknown): Omit<LampWord, "id"> | null {
  if (!isRecord(value)) return null;
  const word = stringValue(value.word);
  const link = normalizeUrl(value.link);
  if (!word || !link) return null;
  return { word, link };
}

export function parseSiteContent(value: unknown): SiteContent | null {
  if (!isRecord(value)) return null;
  const content = value as unknown as SiteContent;

  if (!isRecord(content.hero) || !isRecord(content.about) || !isRecord(content.contact) || !isRecord(content.ritual)) {
    return null;
  }

  return {
    hero: {
      title: stringValue(content.hero.title),
      tagline: stringValue(content.hero.tagline),
      hoverText: stringValue(content.hero.hoverText),
      scrollCue: stringValue(content.hero.scrollCue),
    },
    about: {
      originTitle: stringValue(content.about.originTitle),
      originLines: richTextField(content.about.originLines),
      eyeTitle: stringValue(content.about.eyeTitle),
      eyeParagraphs: richTextField(content.about.eyeParagraphs),
      founderTitle: stringValue(content.about.founderTitle),
      founderParagraphs: richTextField(content.about.founderParagraphs),
      founderName: stringValue(content.about.founderName),
      founderRole: stringValue(content.about.founderRole),
      founderImage: normalizeUrl(content.about.founderImage),
      alterEgoName: stringValue(content.about.alterEgoName),
      alterEgoRole: stringValue(content.about.alterEgoRole),
      alterEgoImage: normalizeUrl(content.about.alterEgoImage),
      ethosTitle: stringValue(content.about.ethosTitle),
      ethosList: stringArray(content.about.ethosList),
    },
    archive: {
      title: stringValue(content.archive?.title),
      subtitle: richTextField(content.archive?.subtitle),
      emptyText: stringValue(content.archive?.emptyText),
      noTagText: stringValue(content.archive?.noTagText),
      tags: stringArray(content.archive?.tags).map(normalizeTag).filter(Boolean),
    },
    contact: {
      title: stringValue(content.contact.title),
      subtitle: richTextField(content.contact.subtitle),
      socialTitle: stringValue(content.contact.socialTitle),
      socialLinks: parseSocialLinks(content.contact.socialLinks),
    },
    ritual: {
      title: stringValue(content.ritual.title),
      lines: stringArray(content.ritual.lines),
      accentLines: stringArray(content.ritual.accentLines),
      highlightLines: stringArray(content.ritual.highlightLines),
      closingAttribution: stringValue(content.ritual.closingAttribution),
    },
  };
}

export function parseStudioMemberInput(value: unknown): StudioMemberInput | null {
  if (!isRecord(value)) return null;

  const name = stringValue(value.name);
  if (!name) return null;

  return {
    slug: normalizeSlug(value.slug || name),
    name,
    role: stringValue(value.role),
    headline: stringValue(value.headline),
    image: normalizeUrl(value.image),
    bioHtml: richTextField(value.bioHtml),
    areasTitle: stringValue(value.areasTitle, "Areas of Work"),
    areas: stringArray(value.areas),
    connectTitle: stringValue(value.connectTitle, "Connect"),
    socialLinks: parseSocialLinks(value.socialLinks),
    locationNote: stringValue(value.locationNote),
    published: value.published !== false,
    noindex: value.noindex === true,
    seoTitle: stringValue(value.seoTitle),
    seoDescription: stringValue(value.seoDescription),
  };
}

export function parseStudioMemberPatch(
  value: unknown
): Partial<Omit<StudioMember, "id" | "createdAt">> | null {
  if (!isRecord(value)) return null;

  const patch: Partial<Omit<StudioMember, "id" | "createdAt">> = {};

  if ("slug" in value) patch.slug = normalizeSlug(value.slug);
  if ("name" in value) patch.name = stringValue(value.name);
  if ("role" in value) patch.role = stringValue(value.role);
  if ("headline" in value) patch.headline = stringValue(value.headline);
  if ("image" in value) patch.image = normalizeUrl(value.image);
  if ("bioHtml" in value) patch.bioHtml = richTextField(value.bioHtml);
  if ("areasTitle" in value) patch.areasTitle = stringValue(value.areasTitle, "Areas of Work");
  if ("areas" in value) patch.areas = stringArray(value.areas);
  if ("connectTitle" in value) patch.connectTitle = stringValue(value.connectTitle, "Connect");
  if ("socialLinks" in value) patch.socialLinks = parseSocialLinks(value.socialLinks);
  if ("locationNote" in value) patch.locationNote = stringValue(value.locationNote);
  if ("published" in value) patch.published = value.published === true;
  if ("noindex" in value) patch.noindex = value.noindex === true;
  if ("seoTitle" in value) patch.seoTitle = stringValue(value.seoTitle);
  if ("seoDescription" in value) patch.seoDescription = stringValue(value.seoDescription);

  return patch;
}

