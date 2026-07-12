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
  /** When true, published note is omitted from the homepage Field Notes carousel */
  hideFromHome: boolean;
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

export interface StudioMember {
  id: string;
  slug: string;
  name: string;
  role: string;
  headline: string;
  image: string;
  bioTitle: string;
  bioHtml: string;
  showBioCard: boolean;
  areasTitle: string;
  areas: string[];
  showAreasCard: boolean;
  selectedWorkTitle: string;
  /** Ordered published field-note IDs for the Selected Work carousel */
  selectedWorkIds: string[];
  showSelectedWork: boolean;
  /** @deprecated kept for migration; prefer selectedWorkIds */
  selectedWorkHtml?: string;
  /** Second persona toggled via the profile photo */
  alterEgoEnabled: boolean;
  alterEgoName: string;
  alterEgoRole: string;
  alterEgoHeadline: string;
  alterEgoImage: string;
  alterEgoBioHtml: string;
  connectTitle: string;
  socialLinks: SocialLink[];
  locationNote: string;
  published: boolean;
  noindex: boolean;
  seoTitle: string;
  seoDescription: string;
  createdAt: string;
  updatedAt: string;
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

export interface Project {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  thumbnail: string;
  bodyHtml: string;
  links: SocialLink[];
  published: boolean;
  sortOrder: number;
  seoTitle: string;
  seoDescription: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectsPageContent {
  title: string;
  subtitle: string;
}

// --- Field Notes ---

export async function getEntries(): Promise<FieldNote[]> {
  const entries = await readJSON<FieldNote[]>("entries.json", getDefaultEntries());
  return entries.map(normalizeFieldNote);
}

function normalizeFieldNote(raw: FieldNote): FieldNote {
  return {
    ...raw,
    hideFromHome: raw.hideFromHome === true,
    seoTags: Array.isArray(raw.seoTags) ? raw.seoTags : [],
    images: Array.isArray(raw.images) ? raw.images : [],
    links: Array.isArray(raw.links) ? raw.links : [],
  };
}

export async function getPublishedEntries(): Promise<FieldNote[]> {
  const all = await getEntries();
  return all.filter((e) => e.published);
}

/** Published notes shown in the homepage Field Notes section */
export async function getHomeEntries(): Promise<FieldNote[]> {
  const published = await getPublishedEntries();
  return published.filter((e) => !e.hideFromHome);
}

export async function getEntriesByIds(ids: string[]): Promise<FieldNote[]> {
  if (!ids.length) return [];
  const all = await getEntries();
  const byId = new Map(all.map((e) => [e.id, e]));
  return ids
    .map((id) => byId.get(id))
    .filter((e): e is FieldNote => Boolean(e && e.published));
}

export async function getEntry(id: string): Promise<FieldNote | null> {
  const entries = await getEntries();
  const found = entries.find((e) => e.id === id || e.slug === id) ?? null;
  return found;
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
    hideFromHome: data.hideFromHome === true,
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

// --- Projects ---

export async function getProjectsPageContent(): Promise<ProjectsPageContent> {
  const defaults = getDefaultProjectsPageContent();
  const saved = await readJSON<Partial<ProjectsPageContent>>(
    "projects-page.json",
    defaults
  );
  return {
    title: saved.title || defaults.title,
    subtitle: saved.subtitle || defaults.subtitle,
  };
}

export async function saveProjectsPageContent(content: ProjectsPageContent) {
  await writeJSON("projects-page.json", content);
}

export async function getProjects(): Promise<Project[]> {
  const saved = await readJSON<Project[]>("projects.json", []);
  const projects = (Array.isArray(saved) ? saved : []).map(normalizeProject);
  return projects.sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title));
}

export async function getPublishedProjects(): Promise<Project[]> {
  const projects = await getProjects();
  return projects.filter((p) => p.published);
}

export async function getProject(idOrSlug: string): Promise<Project | null> {
  const projects = await getProjects();
  return projects.find((p) => p.id === idOrSlug || p.slug === idOrSlug) ?? null;
}

export async function getPublishedProject(idOrSlug: string): Promise<Project | null> {
  const project = await getProject(idOrSlug);
  if (!project || !project.published) return null;
  return project;
}

export async function saveProjects(projects: Project[]) {
  await writeJSON("projects.json", projects);
}

export async function createProject(
  data: Omit<Project, "id" | "createdAt" | "updatedAt">
): Promise<Project> {
  const projects = await getProjects();
  const now = new Date().toISOString();
  const project: Project = {
    ...data,
    id: uuid(),
    slug: uniqueProjectSlug(data.slug || data.title, projects),
    links: (data.links ?? []).map(normalizeSocialLink),
    sortOrder: typeof data.sortOrder === "number" ? data.sortOrder : projects.length,
    createdAt: now,
    updatedAt: now,
  };
  projects.push(project);
  await saveProjects(projects);
  return project;
}

export async function updateProject(
  id: string,
  data: Partial<Omit<Project, "id" | "createdAt">>
): Promise<Project | null> {
  const projects = await getProjects();
  const idx = projects.findIndex((p) => p.id === id);
  if (idx === -1) return null;

  const nextSlug =
    data.slug !== undefined
      ? uniqueProjectSlug(
          data.slug || projects[idx].title,
          projects.filter((p) => p.id !== id)
        )
      : projects[idx].slug;

  projects[idx] = {
    ...projects[idx],
    ...data,
    slug: nextSlug,
    links: data.links ? data.links.map(normalizeSocialLink) : projects[idx].links,
    updatedAt: new Date().toISOString(),
  };
  await saveProjects(projects);
  return projects[idx];
}

export async function deleteProject(id: string): Promise<boolean> {
  const projects = await getProjects();
  const filtered = projects.filter((p) => p.id !== id);
  if (filtered.length === projects.length) return false;
  await saveProjects(filtered);
  return true;
}

function normalizeProject(raw: Partial<Project>): Project {
  return {
    id: raw.id || uuid(),
    slug: raw.slug || "project",
    title: raw.title || "Untitled Project",
    excerpt: raw.excerpt || "",
    thumbnail: raw.thumbnail || "",
    bodyHtml: typeof raw.bodyHtml === "string" ? raw.bodyHtml : "",
    links: Array.isArray(raw.links) ? raw.links.map(normalizeSocialLink) : [],
    published: raw.published === true,
    sortOrder: typeof raw.sortOrder === "number" ? raw.sortOrder : 0,
    seoTitle: raw.seoTitle || "",
    seoDescription: raw.seoDescription || "",
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updatedAt || new Date().toISOString(),
  };
}

function uniqueProjectSlug(value: string, projects: Project[]): string {
  const base = slugify(value) || "project";
  const used = new Set(projects.map((p) => p.slug).filter(Boolean));
  if (!used.has(base)) return base;
  let i = 2;
  while (used.has(`${base}-${i}`)) i += 1;
  return `${base}-${i}`;
}

function getDefaultProjectsPageContent(): ProjectsPageContent {
  return {
    title: "Projects",
    subtitle:
      "Selected works from Maiba Studio — products, experiments, and worlds in progress.",
  };
}

// --- Studio Members ---

export async function getMembers(): Promise<StudioMember[]> {
  const saved = await readJSON<StudioMember[]>("members.json", getDefaultMembers());
  if (!Array.isArray(saved) || saved.length === 0) {
    const defaults = getDefaultMembers();
    await writeJSON("members.json", defaults);
    return defaults;
  }
  return saved.map(normalizeMemberRecord);
}

export async function getPublishedMembers(): Promise<StudioMember[]> {
  const members = await getMembers();
  return members.filter((m) => m.published);
}

export async function getMember(idOrSlug: string): Promise<StudioMember | null> {
  const members = await getMembers();
  return members.find((m) => m.id === idOrSlug || m.slug === idOrSlug) ?? null;
}

export async function getPublishedMember(idOrSlug: string): Promise<StudioMember | null> {
  const member = await getMember(idOrSlug);
  if (!member || !member.published) return null;
  return member;
}

export async function saveMembers(members: StudioMember[]) {
  await writeJSON("members.json", members);
}

export async function createMember(
  data: Omit<StudioMember, "id" | "createdAt" | "updatedAt">
): Promise<StudioMember> {
  const members = await getMembers();
  const now = new Date().toISOString();
  const member: StudioMember = {
    ...data,
    id: uuid(),
    slug: uniqueMemberSlug(data.slug || data.name, members),
    socialLinks: (data.socialLinks ?? []).map(normalizeSocialLink),
    createdAt: now,
    updatedAt: now,
  };
  members.push(member);
  await saveMembers(members);
  return member;
}

export async function updateMember(
  id: string,
  data: Partial<Omit<StudioMember, "id" | "createdAt">>
): Promise<StudioMember | null> {
  const members = await getMembers();
  const idx = members.findIndex((m) => m.id === id);
  if (idx === -1) return null;

  const nextSlug =
    data.slug !== undefined
      ? uniqueMemberSlug(
          data.slug || members[idx].name,
          members.filter((m) => m.id !== id)
        )
      : members[idx].slug;

  members[idx] = {
    ...members[idx],
    ...data,
    slug: nextSlug,
    socialLinks: data.socialLinks
      ? data.socialLinks.map(normalizeSocialLink)
      : members[idx].socialLinks,
    updatedAt: new Date().toISOString(),
  };
  await saveMembers(members);
  return members[idx];
}

export async function deleteMember(id: string): Promise<boolean> {
  const members = await getMembers();
  const filtered = members.filter((m) => m.id !== id);
  if (filtered.length === members.length) return false;
  await saveMembers(filtered);
  return true;
}

function normalizeSocialLink(link: SocialLink): SocialLink {
  return {
    label: link.label || "",
    href: link.href || "",
    icon: link.icon || "",
    iconId: link.iconId || "",
    showLabel: link.showLabel !== false,
  };
}

function normalizeMemberRecord(raw: Partial<StudioMember>): StudioMember {
  const defaults = getDefaultMembers()[0];
  const isDefaultEl = raw.id === defaults.id || raw.slug === "el";
  const alterEgoName =
    raw.alterEgoName ?? (isDefaultEl ? defaults.alterEgoName : "");
  const alterEgoImage =
    raw.alterEgoImage ?? (isDefaultEl ? defaults.alterEgoImage : "");
  const alterEgoBioHtml =
    typeof raw.alterEgoBioHtml === "string"
      ? raw.alterEgoBioHtml
      : isDefaultEl
        ? defaults.alterEgoBioHtml
        : "";

  return {
    ...defaults,
    ...raw,
    id: raw.id || uuid(),
    slug: raw.slug || "member",
    name: raw.name || "Untitled",
    role: raw.role || "",
    headline: raw.headline || (isDefaultEl ? defaults.headline : ""),
    image: raw.image || "",
    bioTitle: raw.bioTitle || "Bio",
    bioHtml: typeof raw.bioHtml === "string" ? raw.bioHtml : defaults.bioHtml,
    showBioCard: raw.showBioCard !== false,
    areasTitle: raw.areasTitle || "Disciplines",
    areas: Array.isArray(raw.areas) ? raw.areas.filter(Boolean) : defaults.areas,
    showAreasCard: raw.showAreasCard !== false,
    selectedWorkTitle: raw.selectedWorkTitle || "Selected Work",
    selectedWorkIds: Array.isArray(raw.selectedWorkIds)
      ? raw.selectedWorkIds.filter((id): id is string => typeof id === "string" && Boolean(id))
      : [],
    showSelectedWork: raw.showSelectedWork !== false,
    selectedWorkHtml:
      typeof raw.selectedWorkHtml === "string" ? raw.selectedWorkHtml : "",
    alterEgoEnabled:
      raw.alterEgoEnabled === true ||
      (raw.alterEgoEnabled === undefined && Boolean(alterEgoName || alterEgoImage)),
    alterEgoName,
    alterEgoRole:
      raw.alterEgoRole ?? (isDefaultEl ? defaults.alterEgoRole : ""),
    alterEgoHeadline:
      raw.alterEgoHeadline ?? (isDefaultEl ? defaults.alterEgoHeadline : ""),
    alterEgoImage,
    alterEgoBioHtml,
    connectTitle: raw.connectTitle || "Connect",
    socialLinks: Array.isArray(raw.socialLinks)
      ? raw.socialLinks.map(normalizeSocialLink)
      : defaults.socialLinks,
    locationNote: raw.locationNote || "",
    published: raw.published !== false,
    noindex: raw.noindex === true,
    seoTitle: raw.seoTitle || "",
    seoDescription: raw.seoDescription || "",
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updatedAt || new Date().toISOString(),
  };
}

function uniqueMemberSlug(value: string, members: StudioMember[]): string {
  const base = slugify(value) || "member";
  const used = new Set(members.map((m) => m.slug).filter(Boolean));
  if (!used.has(base)) return base;
  let i = 2;
  while (used.has(`${base}-${i}`)) i += 1;
  return `${base}-${i}`;
}

function getDefaultMembers(): StudioMember[] {
  const now = new Date().toISOString();
  return [
    {
      id: "member-el-bonuan",
      slug: "el",
      name: "EL Bonuan",
      role: "Artist · Founder · Imagineer",
      headline:
        "A cultural deviant working across art, AI, Web3, and interior space, building at the edge where ritual, technology, and personal myth collide.",
      image: "/images/founder-placeholder.png",
      bioTitle: "Bio",
      bioHtml: [
        "<p>I'm a Filipino multidisciplinary creative working at the intersection of <strong>design, art, artificial intelligence, immersive technology, games, and emerging digital platforms</strong>.</p>",
        "<p>Through <strong>Maiba Studio</strong>, I develop creative technology projects, digital products, brand experiences, and experimental systems that combine strong visual direction with practical innovation.</p>",
        "<p>My work has included:</p>",
        "<ul>",
        "<li>Founding <strong>XOVOX Labs</strong>, recognized as the first Philippine-based studio in The Sandbox partner network</li>",
        "<li>Co-founding <strong>DAOCre-8</strong>, an award-winning decentralized creative funding platform</li>",
        "<li>Contributing to <strong>Bagyo.App</strong>, an AI-assisted disaster intelligence initiative</li>",
        "<li>Developing AI, Web3, AR, game, and culture-driven products for startups, communities, and private clients</li>",
        "<li>Speaking and participating in technology, design, gaming, and creative-industry events</li>",
        "</ul>",
        "<p>My creative practice also exists under the name <strong>Gamotwox</strong>, exploring art, mythology, technology, and the pursuit of light through uncertainty.</p>",
      ].join(""),
      showBioCard: true,
      areasTitle: "Disciplines",
      areas: [
        "Creative Direction",
        "Product Design",
        "AI Systems",
        "Web Applications",
        "Immersive Experiences",
        "Games",
        "AR/XR",
        "Web3",
        "Brand Strategy",
      ],
      showAreasCard: true,
      selectedWorkTitle: "Selected Work",
      selectedWorkIds: [],
      showSelectedWork: true,
      selectedWorkHtml: "",
      alterEgoEnabled: true,
      alterEgoName: "Gamotwox",
      alterEgoRole: "The Seeker · Moth Cultist",
      alterEgoHeadline:
        "A moth cultist following light through shadow — part archive, part ritual, part experiment in becoming.",
      alterEgoImage: "/images/alter-ego-placeholder.png",
      alterEgoBioHtml: [
        "<p><strong>Gamotwox</strong> is the alter ego of EL Bonuan — the seeker side of the practice, where mythology, technology, and devotion to the light meet.</p>",
        "<p>Through this persona, the work explores art that refuses easy categories: ritual as method, deviation as craft, and uncertainty as the path.</p>",
        "<p>Where EL builds systems and studios in the open, Gamotwox moves through the periphery — gathering sparks, following flame, and remembering what it means to burn bright.</p>",
      ].join(""),
      connectTitle: "Connect",
      socialLinks: [
        { label: "Website", href: "https://maiba.studio", icon: "", iconId: "website", showLabel: true },
        { label: "Email", href: "mailto:el@maiba.studio", icon: "", iconId: "email", showLabel: true },
        { label: "LinkedIn", href: "https://www.linkedin.com/in/elbonuan/", icon: "", iconId: "linkedin", showLabel: true },
        { label: "Instagram", href: "https://www.instagram.com/elbonuan", icon: "", iconId: "instagram", showLabel: true },
        { label: "X", href: "https://x.com/ELBonuan", icon: "", iconId: "x", showLabel: true },
        { label: "TikTok", href: "https://www.tiktok.com/@elbonuan", icon: "", iconId: "tiktok", showLabel: true },
        { label: "Telegram", href: "https://t.me/n1t0y", icon: "", iconId: "telegram", showLabel: true },
        { label: "WhatsApp", href: "https://wa.me/639275493367", icon: "", iconId: "whatsapp", showLabel: true },
      ],
      locationNote: "Based in the Philippines · Available for select collaborations and projects",
      published: true,
      noindex: true,
      seoTitle: "EL Bonuan",
      seoDescription:
        "Creative Technologist, Founder & Imagineer of Maiba Studio — design, art, AI, immersive tech, games, and emerging digital platforms.",
      createdAt: now,
      updatedAt: now,
    },
  ];
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
      hideFromHome: false,
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
      hideFromHome: false,
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
      hideFromHome: false,
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
      hideFromHome: false,
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
      hideFromHome: false,
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
      hideFromHome: false,
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
