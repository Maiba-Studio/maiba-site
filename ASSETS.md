# Maiba Studio — Asset Replacement Guide

All placeholder assets live in `public/` and `public/images/`. Replace each placeholder with your final production asset, keeping the same filename (or update the reference path noted below).

---

## Branding & Logos

### 1. Main Logo (Horizontal)

| Property | Value |
|----------|-------|
| **Placeholder** | `public/logo.svg` |
| **Used in** | Navigation bar, Admin sidebar |
| **Recommended format** | SVG (preferred) or PNG with transparency |
| **Recommended dimensions** | 200×60px (SVG scales; if PNG, export at 2× = 400×120px) |
| **Dark variant** | `public/logo-light.svg` — light-colored version for dark backgrounds (currently used site-wide) |
| **Alt text (SEO)** | `"Maiba Studio — Deviant creative studio"` |
| **Notes** | SVG is ideal for sharp rendering at all sizes. If using PNG, ensure transparent background. The logo appears in the top-left navigation at ~32px height. |

### 2. Logo Icon (Square Mark)

| Property | Value |
|----------|-------|
| **Placeholder** | `public/logo-icon.svg` |
| **Used for** | Brand mark, future social profile, app shortcuts |
| **Recommended format** | SVG or PNG |
| **Recommended dimensions** | 64×64px (if PNG, export at 4× = 256×256px) |
| **Notes** | Square aspect ratio. The "M" monogram or moth symbol works well here. |

---

## Favicons & App Icons

### 3. Favicon

| Property | Value |
|----------|-------|
| **Placeholder** | `public/favicon.svg` |
| **Referenced in** | `src/app/layout.tsx` → `metadata.icons.icon` |
| **Recommended format** | SVG (modern browsers) + ICO fallback for legacy |
| **Recommended dimensions** | 32×32px (SVG scales; for ICO, include 16×16, 32×32, 48×48) |
| **SEO note** | Favicons appear in browser tabs, bookmarks, and Google search results. A recognizable brand mark improves click-through rate (CTR). |

**To add ICO fallback:**
1. Generate a `favicon.ico` from your design (use [realfavicongenerator.net](https://realfavicongenerator.net))
2. Place it at `public/favicon.ico` — browsers auto-detect it at the root

### 4. Apple Touch Icon

| Property | Value |
|----------|-------|
| **Placeholder** | `public/apple-touch-icon.svg` |
| **Referenced in** | `src/app/layout.tsx` → `metadata.icons.apple` |
| **Recommended format** | PNG (required by Apple) |
| **Recommended dimensions** | 180×180px |
| **Filename for production** | `public/apple-touch-icon.png` |
| **SEO note** | This icon appears when users add your site to their iOS home screen. Use a solid background (no transparency) for best results on iOS. |

**When replacing with PNG:** update `src/app/layout.tsx`:
```ts
apple: "/apple-touch-icon.png",
```

---

## Open Graph & Social Previews

### 5. OG Image (Social Share Preview)

| Property | Value |
|----------|-------|
| **Placeholder** | `public/images/og-image-placeholder.svg` |
| **Referenced in** | `src/app/layout.tsx` → `metadata.openGraph.images` and `metadata.twitter.images` |
| **Recommended format** | PNG or JPG |
| **Required dimensions** | **1200×630px** (OG standard) |
| **Filename for production** | `public/images/og-image.png` (update path in layout.tsx) |
| **SEO note** | This is the preview image shown when your site is shared on Twitter/X, Facebook, LinkedIn, Discord, iMessage, etc. It is a **critical ranking signal** for social SEO. |

**Design tips for OG image:**
- Include the Maiba Studio logo prominently
- Use the brand tagline: "Deviant Made. Culture-coded. Artist-led."
- Include the URL `maiba.studio` for brand recognition
- Use high contrast text on the dark background
- Keep key content in the center 60% (edges get cropped on some platforms)
- Avoid small text — test at 600×315px (half-size preview)

**When replacing:** update both paths in `src/app/layout.tsx`:
```ts
openGraph: { images: [{ url: "/images/og-image.png", ... }] },
twitter: { images: ["/images/og-image.png"] },
```

---

## People / Profile Photos

### 6. Founder Photo

| Property | Value |
|----------|-------|
| **Placeholder** | `public/images/founder-placeholder.svg` |
| **Default value in** | `src/lib/data.ts` → `about.founderImage` |
| **Editable via** | Admin Dashboard → Site Content → About → Founder → Profile Picture URL |
| **Recommended format** | JPG or WebP |
| **Recommended dimensions** | **400×400px** (displayed as 64px circle, needs 2× for retina) |
| **Alt text (SEO)** | `"EL Bonuan — Founder and Imagineer of Maiba Studio"` |
| **SEO note** | Profile photos help with E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) — a key Google ranking factor. Photos of real people build trust and improve engagement. |

**Tips:**
- Use a professional headshot or artistic portrait that matches the Maiba aesthetic
- Square crop with the face centered (displayed as a circle)
- Optimize to under 100KB for fast loading

### 7. Alter Ego Photo

| Property | Value |
|----------|-------|
| **Placeholder** | `public/images/alter-ego-placeholder.svg` |
| **Default value in** | `src/lib/data.ts` → `about.alterEgoImage` |
| **Editable via** | Admin Dashboard → Site Content → About → Alter Ego → Profile Picture URL |
| **Recommended format** | JPG, WebP, or PNG (with transparency for artistic effect) |
| **Recommended dimensions** | **400×400px** |
| **Alt text (SEO)** | `"Gamotwox — The Seeker, Moth Cultist alter ego"` |
| **Notes** | This can be more stylized/artistic than the founder photo — an avatar, illustration, or masked photo. |

---

## Field Notes / Content

### 8. Field Note Thumbnails

| Property | Value |
|----------|-------|
| **Placeholder** | `public/images/thumbnail-placeholder.svg` |
| **Default value in** | `src/lib/data.ts` → default entries `thumbnail` field |
| **Editable via** | Admin Dashboard → Field Notes → Thumbnail URL |
| **Recommended format** | JPG or WebP |
| **Recommended dimensions** | **600×400px** (3:2 ratio) |
| **Alt text (SEO)** | Use the entry title, e.g. `"Moth Wing Studies — Ink on Paper"` |
| **SEO note** | Thumbnails appear in the carousel and on individual field note pages. Use descriptive filenames: `moth-wing-studies-ink.jpg` (not `IMG_2847.jpg`). Descriptive filenames are a minor but real SEO signal. |

**Best practices for thumbnails:**
- Compress to under 80KB for fast carousel loading (use [squoosh.app](https://squoosh.app))
- Maintain consistent 3:2 aspect ratio for uniform carousel appearance
- Use meaningful, keyword-rich filenames
- WebP format saves 25-35% over JPG at similar quality

### 9. Field Note Gallery Images

| Property | Value |
|----------|-------|
| **No placeholder file** | — (entered as URLs in admin) |
| **Editable via** | Admin Dashboard → Field Notes → Gallery Image URLs |
| **Recommended format** | JPG or WebP |
| **Recommended dimensions** | **1200×800px** or larger (displayed full-width on detail page) |
| **Alt text (SEO)** | Set via image filename. Use descriptive names: `tropical-swallowtail-sketch-01.jpg` |
| **SEO note** | Google Image Search is a significant traffic source. Descriptive filenames, proper alt attributes, and reasonable file sizes all contribute to image SEO. |

---

## Social Link Icons

### 10. Social Link Icons / Thumbnails

| Property | Value |
|----------|-------|
| **Placeholder** | `public/images/social-icon-placeholder.svg` |
| **Editable via** | Admin Dashboard → Site Content → Contact → Social Links → Icon URL |
| **Recommended format** | SVG (preferred) or PNG with transparency |
| **Recommended dimensions** | **32×32px** (displayed at 16px, needs 2× for retina) |
| **Notes** | These appear next to social link labels in the Contact section. Use official brand icons or a consistent monochrome icon set. SVG is recommended for perfect scaling. |

**Suggested icon sources:**
- [Simple Icons](https://simpleicons.org) — SVG brand icons (free)
- [Lucide](https://lucide.dev) — consistent icon set (free)

---

## SEO Checklist

Use this checklist when replacing placeholder assets to maximize search ranking:

### Image SEO

- [ ] **Descriptive filenames** — Use kebab-case with keywords: `maiba-studio-logo.svg`, `el-bonuan-founder-portrait.jpg`
- [ ] **Alt text** — Every image should have meaningful alt text describing the content (set via admin or code)
- [ ] **File size** — Keep images under 100KB where possible; use WebP for photos
- [ ] **Dimensions** — Serve images at 2× display size for retina screens
- [ ] **Lazy loading** — Gallery images on field note pages benefit from `loading="lazy"` (already handled by browser defaults for below-fold images)

### Metadata SEO

- [ ] **Title tags** — `<title>` is set via `metadata.title` in `layout.tsx`. Format: `Page Name | Maiba Studio`
- [ ] **Meta description** — Set via `metadata.description`. Keep to 150-160 characters. Include primary keywords naturally.
- [ ] **Open Graph image** — Replace the 1200×630 placeholder with a polished brand image
- [ ] **Twitter card** — Uses `summary_large_image` format. Same OG image is reused.
- [ ] **Canonical URL** — Set via `metadata.metadataBase` (currently `https://maiba.studio`)
- [ ] **Structured data** — Consider adding JSON-LD for Organization schema (see below)

### Technical SEO

- [ ] **Robots** — `index: true, follow: true` is set for the public site. Admin pages are `noindex`.
- [ ] **Sitemap** — Generate via Next.js `sitemap.ts` (not yet created — consider adding)
- [ ] **robots.txt** — Not yet created. Add `public/robots.txt` with sitemap URL.
- [ ] **Performance** — Run Lighthouse audit. Target 90+ on Performance, Accessibility, Best Practices, SEO.
- [ ] **Mobile** — Site is responsive. Test with Google Mobile-Friendly Test.

### Keyword Strategy

Primary keywords to target across headings (H1/H2), meta descriptions, and alt text:

| Keyword | Placement |
|---------|-----------|
| Maiba Studio | H1 (hero), title tag, OG title, alt text |
| creative studio | meta description, about section |
| cultural deviant | tagline, about section, OG description |
| EL Bonuan | founder section, author meta, alt text |
| art + AI + Web3 | meta description, about section, keywords meta |
| Gamotwox | alter ego section, field notes |
| digital art | field notes tags, meta keywords |
| creative technology | about section, meta description |

### Heading Hierarchy (Current)

```
H1: "Maiba Studio" (hero)
  H2: "Field Notes" (archive section)
  H2: "Join the Cult" (contact section)
  H2: [Entry Title] (field note detail pages)
```

Ensure each page has exactly one H1. Field note detail pages should use the entry title as H1.

---

## File Structure Summary

```
public/
├── logo.svg                        ← Full horizontal logo (dark bg)
├── logo-light.svg                  ← Full horizontal logo (transparent, for nav)
├── logo-icon.svg                   ← Square icon/monogram
├── favicon.svg                     ← Browser tab icon (32×32)
├── apple-touch-icon.svg            ← iOS home screen icon (180×180) → replace with .png
└── images/
    ├── og-image-placeholder.svg    ← Social share preview (1200×630) → replace with .png
    ├── founder-placeholder.svg     ← Founder profile (400×400) → replace with .jpg
    ├── alter-ego-placeholder.svg   ← Alter ego profile (400×400) → replace with .jpg
    ├── thumbnail-placeholder.svg   ← Field note thumbnail (600×400) → replace with .jpg
    └── social-icon-placeholder.svg ← Social link icon (32×32) → replace with .svg
```

---

## Quick Replacement Steps

1. Export your final assets at the recommended dimensions and format
2. Drop them into `public/` or `public/images/` with the same filename (or a new descriptive name)
3. If using a different filename, update the reference:
   - **Logo**: `src/components/Navigation.tsx` and `src/components/admin/AdminShell.tsx`
   - **Favicon/Apple icon**: `src/app/layout.tsx` → `metadata.icons`
   - **OG image**: `src/app/layout.tsx` → `metadata.openGraph.images` and `metadata.twitter.images`
   - **Founder/Alter ego photos**: Admin Dashboard → Site Content → About (or `src/lib/data.ts` defaults)
   - **Thumbnails**: Admin Dashboard → Field Notes → each entry's Thumbnail URL
   - **Social icons**: Admin Dashboard → Site Content → Contact → each link's Icon URL
4. Delete the old placeholder SVG files
5. Run `npx next build` to verify no broken references
6. Run a Lighthouse audit to confirm SEO scores
