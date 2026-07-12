import { v4 as uuid } from "uuid";
import { richTextField } from "./sanitize";
import { readJSON, writeJSON } from "./storage";

export interface FieldNote {
  id: string;
  slug?: string;
  title: string;
  headline: string;
  excerpt: string;
  body: string;
  tag: string;
  date: string;
  thumbnail: string;
  images: string[];
  links: { label: string; url: string }[];
  seoTags: string[];
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SocialLink {
  label: string;
  href: string;
  icon: string;
  iconId?: string;
  showLabel?: boolean;
}

export interface SiteContent {
  hero: {
    title: string;
    tagline: string;
    hoverText: string;
    scrollCue: string;
  };
  about: {
    originTitle: string;
    /** HTML rich text (legacy string[] migrated on read). */
    originLines: string;
    eyeTitle: string;
    eyeParagraphs: string;
    founderTitle: string;
    founderParagraphs: string;
    founderName: string;
    founderRole: string;
    founderImage: string;
    alterEgoName: string;
    alterEgoRole: string;
    alterEgoImage: string;
    ethosTitle: string;
    ethosList: string[];
  };
  archive: {
    title: string;
    /** HTML rich text (legacy plain/newline text migrated on read). */
    subtitle: string;
    emptyText: string;
    noTagText: string;
    tags: string[];
  };
  contact: {
    title: string;
    /** HTML rich text (legacy plain/newline text migrated on read). */
    subtitle: string;
    socialTitle: string;
    socialLinks: SocialLink[];
  };
  ritual: {
    title: string;
    lines: string[];
    accentLines: string[];
    highlightLines: string[];
    closingAttribution: string;
  };
}

export type UserRole = "admin" | "moderator";

export interface UserAccount {
  id: string;
  username: string;
  passwordHash: string;
  role: UserRole;
  createdAt: string;
}

export interface LampWord {
  id: string;
  word: string;
  link: string;
}

// --- Field Notes ---

export async function getEntries(): Promise<FieldNote[]> {
  return readJSON<FieldNote[]>("entries.json", getDefaultEntries());
}

export async function getPublishedEntries(): Promise<FieldNote[]> {
  const all = await getEntries();
  return all.filter((e) => e.published);
}

export async function getEntry(id: string): Promise<FieldNote | null> {
  const entries = await getEntries();
  return entries.find((e) => e.id === id || e.slug === id) ?? null;
}

export async function saveEntries(entries: FieldNote[]) {
  await writeJSON("entries.json", entries);
}

export async function createEntry(
  data: Omit<FieldNote, "id" | "createdAt" | "updatedAt">
): Promise<FieldNote> {
  const entries = await getEntries();
  const now = new Date().toISOString();
  const entry: FieldNote = {
    ...data,
    id: uuid(),
    slug: uniqueSlug(data.slug || data.title, entries),
    createdAt: now,
    updatedAt: now,
  };
  entries.unshift(entry);
  await saveEntries(entries);
  return entry;
}

export async function updateEntry(
  id: string,
  data: Partial<Omit<FieldNote, "id" | "createdAt">>
): Promise<FieldNote | null> {
  const entries = await getEntries();
  const idx = entries.findIndex((e) => e.id === id || e.slug === id);
  if (idx === -1) return null;
  const slug = data.slug
    ? uniqueSlug(data.slug, entries.filter((entry) => entry.id !== entries[idx].id))
    : entries[idx].slug;
  entries[idx] = {
    ...entries[idx],
    ...data,
    slug,
    updatedAt: new Date().toISOString(),
  };
  await saveEntries(entries);
  return entries[idx];
}

export async function deleteEntry(id: string): Promise<boolean> {
  const entries = await getEntries();
  const filtered = entries.filter((e) => e.id !== id && e.slug !== id);
  if (filtered.length === entries.length) return false;
  await saveEntries(filtered);
  return true;
}

// --- Site Content ---

export async function getSiteContent(): Promise<SiteContent> {
  const defaults = getDefaultSiteContent();
  const saved = await readJSON<Partial<SiteContent>>("site-content.json", defaults);
  const about = { ...defaults.about, ...saved.about };
  const archive = { ...defaults.archive, ...saved.archive };
  const contact = {
    ...defaults.contact,
    ...saved.contact,
    socialLinks: (saved.contact?.socialLinks ?? defaults.contact.socialLinks).map((link) => ({
      showLabel: true,
      ...link,
    })),
  };

  return {
    ...defaults,
    ...saved,
    hero: { ...defaults.hero, ...saved.hero },
    about: {
      ...about,
      originLines: richTextField(about.originLines),
      eyeParagraphs: richTextField(about.eyeParagraphs),
      founderParagraphs: richTextField(about.founderParagraphs),
    },
    archive: {
      ...archive,
      subtitle: richTextField(archive.subtitle),
    },
    contact: {
      ...contact,
      subtitle: richTextField(contact.subtitle),
    },
    ritual: { ...defaults.ritual, ...saved.ritual },
  };
}

export async function saveSiteContent(content: SiteContent) {
  await writeJSON("site-content.json", content);
}

export async function getFieldNoteTags(): Promise<string[]> {
  const content = await getSiteContent();
  return content.archive.tags;
}

// --- Users ---

export async function getUsers(): Promise<UserAccount[]> {
  return readJSON<UserAccount[]>("users.json", []);
}

export async function saveUsers(users: UserAccount[]) {
  await writeJSON("users.json", users);
}

export async function getUserByUsername(
  username: string
): Promise<UserAccount | null> {
  const users = await getUsers();
  return users.find((u) => u.username === username) ?? null;
}

export async function getUserById(id: string): Promise<UserAccount | null> {
  const users = await getUsers();
  return users.find((u) => u.id === id) ?? null;
}

export async function createUser(
  data: Omit<UserAccount, "id" | "createdAt">
): Promise<UserAccount> {
  const users = await getUsers();
  const user: UserAccount = {
    ...data,
    id: uuid(),
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  await saveUsers(users);
  return user;
}

export async function updateUser(
  id: string,
  data: Partial<Omit<UserAccount, "id" | "createdAt">>
): Promise<UserAccount | null> {
  const users = await getUsers();
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return null;
  users[idx] = { ...users[idx], ...data };
  await saveUsers(users);
  return users[idx];
}

export async function deleteUser(id: string): Promise<boolean> {
  const users = await getUsers();
  const filtered = users.filter((u) => u.id !== id);
  if (filtered.length === users.length) return false;
  await saveUsers(filtered);
  return true;
}

// --- Lamp Words ---

export async function getLampWords(): Promise<LampWord[]> {
  return readJSON<LampWord[]>("lamp-words.json", []);
}

export async function saveLampWords(words: LampWord[]) {
  await writeJSON("lamp-words.json", words);
}

export async function createLampWord(
  word: string,
  link: string
): Promise<LampWord> {
  const words = await getLampWords();
  const entry: LampWord = { id: uuid(), word, link };
  words.push(entry);
  await saveLampWords(words);
  return entry;
}

export async function updateLampWord(
  id: string,
  data: Partial<Omit<LampWord, "id">>
): Promise<LampWord | null> {
  const words = await getLampWords();
  const idx = words.findIndex((w) => w.id === id);
  if (idx === -1) return null;
  words[idx] = { ...words[idx], ...data };
  await saveLampWords(words);
  return words[idx];
}

export async function deleteLampWord(id: string): Promise<boolean> {
  const words = await getLampWords();
  const filtered = words.filter((w) => w.id !== id);
  if (filtered.length === words.length) return false;
  await saveLampWords(filtered);
  return true;
}

// --- Defaults ---

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function uniqueSlug(value: string, entries: FieldNote[]): string {
  const base = slugify(value) || "field-note";
  const used = new Set(entries.map((entry) => entry.slug).filter(Boolean));
  if (!used.has(base)) return base;

  let i = 2;
  while (used.has(`${base}-${i}`)) i += 1;
  return `${base}-${i}`;
}

function getDefaultEntries(): FieldNote[] {
  const now = new Date().toISOString();
  return [
    {
      id: "default-1",
      slug: "tropical-swallowtail-tattoo-concept-draft",
      title: "Tropical Swallowtail — Tattoo Concept Draft",
      headline: "Wing geometry as body art",
      excerpt:
        "Initial sketches exploring the wing geometry of the Tropical Swallowtail Moth as body art. The pattern language of deviation encoded in skin.",
      body: "",
      tag: "vision",
      date: "2025-03-15",
      thumbnail: "/images/thumbnail-placeholder.png",
      images: [],
      links: [],
      seoTags: ["tattoo", "moth", "body art", "concept art"],
      published: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "default-2",
      slug: "70k-php-build-rendering-optimization-notes",
      title: "70K PHP Build — Rendering Optimization Notes",
      headline: "Squeezing every frame",
      excerpt:
        "Thermals, GPU benchmarks, and the art of squeezing every frame out of a fresh build designed for Blender, Unreal, and diffusion models.",
      body: "",
      tag: "code",
      date: "2025-02-28",
      thumbnail: "/images/thumbnail-placeholder.png",
      images: [],
      links: [],
      seoTags: ["PC build", "GPU", "Blender", "Unreal Engine"],
      published: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "default-3",
      slug: "tiefling-artificer-lore-fragment",
      title: "The Tiefling Artificer — Lore Fragment",
      headline: "A hermit who speaks to machines",
      excerpt:
        "A hermit who speaks to machines. Backstory notes for a character that refuses to stay fictional. The line between player and played.",
      body: "",
      tag: "shadow",
      date: "2025-02-10",
      thumbnail: "/images/thumbnail-placeholder.png",
      images: [],
      links: [],
      seoTags: ["D&D", "TTRPG", "character lore", "worldbuilding"],
      published: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "default-4",
      slug: "on-deviation-as-practice",
      title: "On Deviation as Practice",
      headline: "The honest creative strategy",
      excerpt:
        "Why the act of making 'wrong' choices is the only honest creative strategy. A log entry from the first week of Maiba.",
      body: "",
      tag: "log",
      date: "2025-01-20",
      thumbnail: "/images/thumbnail-placeholder.png",
      images: [],
      links: [],
      seoTags: ["creativity", "studio log", "process"],
      published: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "default-5",
      slug: "moth-wing-studies-ink-on-paper",
      title: "Moth Wing Studies — Ink on Paper",
      headline: "Finding symmetry in asymmetry",
      excerpt:
        "Observational drawings of Lyssa zampa specimens. Finding symmetry in asymmetry. The beauty of things that only fly at night.",
      body: "",
      tag: "drawing",
      date: "2025-01-05",
      thumbnail: "/images/thumbnail-placeholder.png",
      images: [],
      links: [],
      seoTags: ["ink drawing", "moth", "observational art"],
      published: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "default-6",
      slug: "maiba-red-color-theory-notes",
      title: "Maiba Red — Color Theory Notes",
      headline: "A color that watches you back",
      excerpt:
        "Why #f23d3d. The psychology of red that doesn't scream but smolders. A color that watches you back.",
      body: "",
      tag: "vision",
      date: "2024-12-18",
      thumbnail: "/images/thumbnail-placeholder.png",
      images: [],
      links: [],
      seoTags: ["color theory", "branding", "design"],
      published: true,
      createdAt: now,
      updatedAt: now,
    },
  ];
}

function getDefaultSiteContent(): SiteContent {
  return {
    hero: {
      title: "Maiba Studio",
      tagline: "Deviant Made. Culture-coded. Artist-led.",
      hoverText:
        "This is Maiba Studio — a ritual, a rebellion, a creative sanctuary.",
      scrollCue: "↓ Enter the Studio",
    },
    about: {
      originTitle: 'The Origin of "Maiba"',
      originLines: richTextField([
        "Maiba means to change, to differ, to deviate.",
        "It is a word with motion, like flame.",
        "We don't create to fit in—we create to remember who we are becoming.",
      ]),
      eyeTitle: "The Eye",
      eyeParagraphs: richTextField([
        "In 2024, I lost sight in my left eye due to a severe infection—blinding me for a week.",
        "Then my right eye began to drift inward. Doctors feared a tumor.",
        "I lived in a world too bright to bear. I couldn't see without pain.",
        "It was the wake-up call I didn't know I needed.",
        "So I stopped. I left my roles, paused the projects, and finally chose to build something for me.",
        "Maiba is that choice. No more delays. No more excuses. Just truth, in the time I have left to see it.",
      ]),
      founderTitle: "The Founder",
      founderParagraphs: richTextField([
        "EL Bonuan is the founder and imagineer of Maiba Studio. A cultural deviant working across art, AI, Web3, and interior space, he builds at the bleeding edge of creative technology.",
        "His alter ego, Gamotwox, is the seeker—a moth cultist following light through shadow.",
      ]),
      founderName: "EL Bonuan",
      founderRole: "Founder · Imagineer",
      founderImage: "/images/founder-placeholder.png",
      alterEgoName: "Gamotwox",
      alterEgoRole: "The Seeker · Moth Cultist",
      alterEgoImage: "/images/alter-ego-placeholder.png",
      ethosTitle: "Studio Ethos",
      ethosList: [
        "Finish what matters.",
        "Burn bright, not fast.",
        "Create what you would regret not doing.",
        "Build deviant.",
        "Be moth. Seek light.",
      ],
    },
    archive: {
      title: "Field Notes",
      subtitle: richTextField(
        "What doesn't make it into the work... becomes the work.\nThese are the scattered sparks. The light between things."
      ),
      emptyText: "No field notes yet. The sparks are gathering...",
      noTagText: "No notes found for this tag.",
      tags: ["drawing", "log", "code", "create", "vision", "shadow"],
    },
    contact: {
      title: "Join the Cult",
      subtitle: richTextField(
        "Want to build something deviant?\nLeave a trace. Light a candle."
      ),
      socialTitle: "Find us in the periphery",
      socialLinks: [
        { label: "X (Twitter)", href: "https://twitter.com", icon: "", iconId: "x", showLabel: true },
        { label: "LinkedIn", href: "https://linkedin.com", icon: "", iconId: "linkedin", showLabel: true },
        { label: "Email", href: "mailto:hello@maiba.studio", icon: "", iconId: "email", showLabel: true },
      ],
    },
    ritual: {
      title: ":: Maiba Manifesto ::",
      lines: [
        "We are the moths who chose the flame.",
        "Not because we are blind,",
        "but because we refuse to live in the dark.",
        "",
        "Every deviation is an act of devotion.",
        "Every creation is a prayer we refuse to whisper.",
        "",
        "We build what the world did not ask for.",
        "We make what we would regret not making.",
        "We follow the light—not because it is safe,",
        "but because it is ours.",
        "",
        "This is the Maiba way.",
        "Deviant. Sacred. Unfinished.",
        "",
        "Burn bright.",
        "Be moth.",
        "Seek light.",
      ],
      accentLines: ["Burn bright.", "Be moth.", "Seek light."],
      highlightLines: ["This is the Maiba way."],
      closingAttribution: "— Fragment I · Written in the dark",
    },
  };
}
