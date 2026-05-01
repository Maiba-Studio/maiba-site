# Maiba Site Diagnostic Report

Generated: 2026-05-02

## Executive Summary

The in-repo issues from the initial diagnostic pass have been addressed where they did not require external accounts, production credentials, final brand assets, DNS, analytics dashboards, or manual production testing.

Current health:

- Production build passes.
- TypeScript typecheck passes.
- ESLint passes.
- `npm audit --audit-level=low` reports 0 vulnerabilities.
- The previous Next/Turbopack root warning is resolved.
- The previous `middleware` deprecation warning is resolved by migrating to `src/proxy.ts`.
- `/sitemap.xml` is generated.
- `/el` exists as an orphan noindexed artist page.
- Local placeholder image files now exist for the image paths already referenced by the app.

## Verification Commands Run

| Check | Result | Notes |
|---|---:|---|
| `npm run lint` | Pass | ESLint completed with no errors or warnings. |
| `npx tsc --noEmit` | Pass | TypeScript completed with exit code 0. |
| `npm audit --audit-level=low` | Pass | 0 vulnerabilities found. |
| `npm run build` | Pass | Next.js 16.2.4 generated 25 app routes, including `/el` and `/sitemap.xml`. |

The local Node/npm installation still prints an experimental CommonJS/ESM warning and an engine warning for `eslint-visitor-keys` under Node `v23.3.0`. These are environment warnings, not project code failures. The declared supported engine for that package includes Node 20.19+, Node 22.13+, or Node 24+.

## Fixed In Repo

### Dependency Security

- Updated Next.js and `eslint-config-next` to `16.2.4`.
- Updated `uuid` to `14.0.0`.
- Added `sanitize-html` and its types for server-side rich text sanitization.
- Added an npm `overrides.postcss` entry so transitive PostCSS resolves to a patched `8.5.13` range.
- Re-ran install and verified `npm audit --audit-level=low` returns 0 vulnerabilities.

### API And Auth Hardening

- Added shared request security helpers in `src/lib/request-security.ts`.
- Added IP-based in-memory rate limiting for:
  - `/api/contact`
  - `/api/auth/login`
  - `/api/auth/lamp`
- Added same-origin checks for mutating API routes.
- Changed the contact API to fail closed in production when reCAPTCHA or Google Form delivery is not configured.
- Added request payload validation and normalization for entries, users, lamp words, and site content.
- Increased new password minimum length from 6 to 10 characters.
- Made JWT session verification reject malformed payloads instead of defaulting missing values to admin-like fallbacks.
- Made logout expire the session cookie with matching cookie options.
- Restricted public `/api/entries/[id]` reads so unpublished entries require an authenticated session.

### Rich Text Safety

- Added `src/lib/sanitize.ts`.
- Sanitized field note rich text on create and update before storage.
- Restricted allowed tags, attributes, URL schemes, and image schemes for stored rich text.

### Next.js 16 Compatibility

- Replaced `src/middleware.ts` with `src/proxy.ts`.
- Added `turbopack.root` to `next.config.ts` to avoid the previous multi-lockfile root inference warning.
- Confirmed the production build no longer emits the previous root or middleware deprecation warnings.

### Lint And Rendering

- Fixed all prior lint errors.
- Replaced internal raw anchors flagged by Next lint with `next/link`.
- Replaced lint-flagged image elements with `next/image`.
- Removed/sidestepped synchronous set-state-in-effect lint violations.
- Removed unused password hash destructuring warnings.

### SEO And Content Infrastructure

- Added `src/app/sitemap.ts` with public static routes and published field notes.
- Added Organization JSON-LD to the homepage.
- Added Article JSON-LD to field note detail pages.
- Added Person JSON-LD to the orphan artist page.
- Added `src/app/el/page.tsx` as the noindexed orphan EL Bonuan page.
- Generated local placeholder PNG files for:
  - `public/images/og-image-placeholder.png`
  - `public/images/founder-placeholder.png`
  - `public/images/alter-ego-placeholder.png`
  - `public/images/thumbnail-placeholder.png`

## Still Requires Your Intervention Outside The Repo

These items cannot be fully completed without accounts, final assets, production credentials, or business decisions:

- Set up Google reCAPTCHA v3 and provide production env vars.
- Create the Google Form and provide the production form URL plus field IDs.
- Test contact form delivery in production.
- Verify password change in production after deploy.
- Replace placeholder logos, favicon, apple touch icon, OG image, portraits, and thumbnails with final brand assets.
- Populate final production copy and field note content in the admin dashboard.
- Replace generic social URLs with final profile URLs.
- Run Google Mobile-Friendly Test and external OG/Twitter card validators.
- Run a production Lighthouse audit against the deployed site.
- Configure custom domain, DNS, analytics, and email forwarding.
- Decide whether future nice-to-have features should be built now: search, RSS, draft previews, direct image uploads, activity logs, and automated backups.

## Residual Engineering Notes

- The new rate limiter is in-memory. It is useful as an in-repo baseline, but distributed production deployments should use durable/shared rate limiting if traffic or abuse risk grows.
- The generated placeholder PNGs prevent broken references, but they are not final production artwork.
- The orphan `/el` page uses existing in-repo content and placeholder imagery. It is intentionally noindexed and not linked from navigation.
- The contact endpoint now fails closed in production when required integrations are missing. Make sure the production environment variables are present before launch.

