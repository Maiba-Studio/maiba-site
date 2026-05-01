# Maiba Studio — Remaining TODO

Everything still needed to get the site fully production-ready, organized by priority.

---

## 1. Environment & Deployment (Required)

- [ ] **Set up Google reCAPTCHA v3** — Register at [google.com/recaptcha/admin](https://www.google.com/recaptcha/admin/), choose v3, add `maiba.studio` + `localhost` as domains. Add `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` and `RECAPTCHA_SECRET_KEY` to Vercel env vars + `.env.local`.
- [ ] **Create a Google Form** (logged in as el@maiba.studio) with Name, Email, Message fields. Find the `entry.XXXXXXXXX` field IDs via DevTools. Set `GOOGLE_FORM_URL`, `GOOGLE_FORM_NAME_FIELD`, `GOOGLE_FORM_EMAIL_FIELD`, `GOOGLE_FORM_MESSAGE_FIELD` in Vercel env vars + `.env.local`.
- [ ] **Test the contact form end-to-end** — Submit on production, verify the response appears in Google Forms and optionally a linked Google Sheet.
- [ ] **Verify password change works on production** — Log in as primary admin, change password from Accounts tab, log out and back in with the new password.

---

## 2. Asset Replacement (Required)

See `ASSETS.md` for full specs. Replace every placeholder with final production assets.

- [ ] **Logo** — Replace `public/logo.svg` and `public/logo-light.svg` with final Maiba Studio wordmark/logo.
- [ ] **Logo icon** — Replace `public/logo-icon.svg` with square monogram (moth mark or "M").
- [ ] **Favicon** — Replace `public/favicon.svg`. Optionally generate a `favicon.ico` fallback via [realfavicongenerator.net](https://realfavicongenerator.net).
- [ ] **Apple touch icon** — Replace `public/apple-touch-icon.svg` with a 180x180 PNG (`apple-touch-icon.png`), update the path in `src/app/layout.tsx`.
- [ ] **OG image** — Design a 1200x630 social share preview image, replace `public/images/og-image-placeholder.png`, update path in `layout.tsx` if filename changes.
- [ ] **Founder photo** — Replace `public/images/founder-placeholder.png` (400x400) or set URL via admin dashboard.
- [ ] **Alter ego photo** — Replace `public/images/alter-ego-placeholder.png` (400x400) or set URL via admin dashboard.
- [ ] **Field note thumbnails** — Replace `public/images/thumbnail-placeholder.png` or upload per-entry via admin (600x400, 3:2 ratio).

---

## 3. Content (Required)

Populate all sections with real copy via the Admin Dashboard.

- [ ] **Hero section** — Final title, tagline, hover text, scroll cue.
- [ ] **About section** — Origin story lines, The Eye paragraphs, Founder name/role/bio, Alter Ego name/role, Studio Ethos list.
- [ ] **Contact section** — Title, subtitle, social links (with correct URLs, labels, and icons).
- [ ] **Field Notes** — Write and publish at least 3-5 entries with real content, thumbnails, SEO tags, and rich text bodies.
- [ ] **Lamp words** — Set up any additional lamp words/links via admin if using the Lamp feature beyond the password.

---

## 4. Artist Page — EL Bonuan (New Feature)

An orphan page at `/el` (or `/el-bonuan`) — not linked from the main navigation or landing page, accessible only by direct URL.

- [x] **Create the page** at `src/app/el/page.tsx` (or `src/app/el-bonuan/page.tsx`).
- [x] **Design the layout** — Artist portfolio/bio page with:
  - Hero/header with name, title, and a short personal statement
  - Profile photo (can reuse founder image or a separate one)
  - Bio section — longer personal narrative beyond what's on the About page
  - Portfolio/work gallery — curated pieces, projects, or case studies
  - Skills/disciplines section (art direction, AI, Web3, interiors, etc.)
  - Links to external profiles (Behance, Dribbble, GitHub, etc.)
  - Contact or CTA (can link back to the main site's contact form)
- [x] **Keep it orphaned** — Do NOT add it to `Navigation.tsx`, `Footer.tsx`, or any visible link on the main site. It should only be reachable by typing the URL directly or sharing the link.
- [x] **Add `noindex` meta** (optional) — If you want it truly private, add `robots: { index: false }` to the page's metadata export. If you want it findable by search engines but just not linked from the site, leave it indexable.
- [ ] **Consider making it admin-editable** (optional) — Add a new section in the admin dashboard or manage content via a separate JSON file in blob storage.

---

## 5. SEO & Technical Polish (Recommended)

- [x] **Generate a sitemap** — Create `src/app/sitemap.ts` that dynamically lists all public pages + published field notes. Exclude `/admin/*`, `/api/*`, and the orphan artist page (if noindexed).
- [x] **Add JSON-LD structured data** — Organization schema on the homepage, Article schema on field note pages, Person schema on the artist page.
- [ ] **Run Lighthouse audit** — Target 90+ on Performance, Accessibility, Best Practices, SEO. Fix any issues found.
- [ ] **Test with Google Mobile-Friendly Test** — Verify all public pages pass.
- [ ] **Verify OG tags** — Use [opengraph.xyz](https://www.opengraph.xyz) or Twitter Card Validator to confirm social previews render correctly.
- [ ] **Image optimization** — Ensure all images are compressed (use [squoosh.app](https://squoosh.app)). Convert JPGs to WebP where possible. Use descriptive filenames for image SEO.
- [ ] **Install Recoleta font** (optional) — If you have `Recoleta-Bold.woff2`, place it in `src/fonts/` and uncomment the `localFont` block in `layout.tsx` per `src/fonts/README.md`.

---

## 6. Security & Maintenance (Recommended)

- [x] **Review CORS / rate limiting** — The `/api/contact` endpoint is publicly accessible. Consider adding rate limiting (Vercel Edge Middleware or a simple in-memory counter) to prevent abuse.
- [x] **Audit admin routes** — Verify that all `/admin/*` pages and `/api/*` endpoints properly check authentication. Moderators should not access Site Content or Accounts.
- [ ] **Set up Vercel Analytics** (optional) — Enable Web Analytics or Speed Insights in the Vercel dashboard for traffic and performance monitoring.
- [ ] **Configure a custom domain** — If not already done, add `maiba.studio` as a custom domain in Vercel and configure DNS.
- [ ] **Set up email forwarding** — Ensure `el@maiba.studio` and `hello@maiba.studio` are receiving mail if referenced in the contact section.

---

## 7. Nice-to-Have (Future)

- [ ] **Dark/light mode toggle** — Currently dark-only. A theme toggle could improve accessibility.
- [ ] **Search functionality** — Allow searching through published field notes.
- [ ] **RSS feed** — Generate an RSS feed for field notes at `/feed.xml` for readers/aggregators.
- [ ] **Preview mode for drafts** — Allow admins to preview unpublished field notes on the public site without publishing.
- [ ] **Image upload in admin** — Currently thumbnails/images use URLs. A direct upload to Vercel Blob would simplify the workflow.
- [ ] **Admin activity log** — Track who changed what and when (useful once moderators are active).
- [ ] **Automated backups** — Periodic export of blob storage data.

---

## Quick Reference: Order of Operations

1. Replace assets (logos, favicon, OG image, photos)
2. Set up reCAPTCHA + Google Form env vars
3. Populate all content via admin dashboard
4. Build and deploy the artist page
5. Generate sitemap + add structured data
6. Run Lighthouse audit and fix issues
7. Go live with confidence
