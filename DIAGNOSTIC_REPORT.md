# Maiba Site Diagnostic Report

Generated: 2026-05-02

## Executive Summary

The project is a Next.js 16 App Router site with a public studio landing page, field notes archive, contact form, lamp/ritual access flow, and an admin dashboard for entries, site content, accounts, and lamp words.

Current health is mixed:

- Production build passes.
- TypeScript typecheck passes.
- ESLint fails with 7 errors and 11 warnings.
- `npm audit` reports 3 dependency vulnerabilities: 1 high, 2 moderate.
- The git working tree was clean before this report was generated.
- Several production readiness tasks remain open in `TODO.md`.
- Some referenced production assets are missing from `public/images`.
- The public contact endpoint and auth endpoints lack rate limiting.
- Rich text field note bodies are rendered with `dangerouslySetInnerHTML` without a visible server-side sanitizer.

## Verification Commands Run

| Check | Result | Notes |
|---|---:|---|
| `git status --short; git branch --show-current` | Pass | Working tree was clean; branch: `main`. |
| `npm run lint` | Fail | 18 total lint findings: 7 errors, 11 warnings. |
| `npx tsc --noEmit` | Pass | TypeScript completed with exit code 0. |
| `npm audit --audit-level=low` | Fail | 3 vulnerabilities reported. |
| `npm run build` | Pass | Next.js compiled and generated 23 app routes. |

Build warnings:

- Next.js inferred the workspace root as `C:\Users\EL Bonuan` because it detected multiple lockfiles, including the project lockfile at `maiba-site/package-lock.json`. This can be silenced by configuring `turbopack.root` or removing the unrelated parent lockfile if it is not needed.
- Next.js warns that the `middleware` file convention is deprecated and should move to the `proxy` convention.
- Build output says `.env.local` is present. This report did not inspect it to avoid exposing secrets.

## Confirmed Unfinished Work

The existing `TODO.md` still lists the main production tasks:

- Set up Google reCAPTCHA v3 environment variables.
- Create and wire the Google Form endpoint and field IDs.
- Test the contact form end-to-end in production.
- Verify admin password change in production.
- Replace placeholder logos, favicon, apple icon, OG image, founder photo, alter ego photo, and field note thumbnails.
- Populate final content through the admin dashboard.
- Create the orphan EL Bonuan artist page.
- Add a dynamic sitemap.
- Add JSON-LD structured data.
- Run Lighthouse and mobile-friendly audits.
- Review CORS/rate limiting.
- Audit admin/API authorization.
- Configure domain, analytics, and mail forwarding.

Additional confirmed gaps from the codebase:

- `public/robots.txt` references `https://maiba.studio/sitemap.xml`, but no `src/app/sitemap.ts` exists.
- `src/app/layout.tsx` references `/images/og-image-placeholder.png`, but no `public/images` folder or OG image file was found.
- `src/lib/data.ts` references `/images/founder-placeholder.png`, `/images/alter-ego-placeholder.png`, and `/images/thumbnail-placeholder.png`, but no matching files were found under `public`.
- The `/el` or `/el-bonuan` artist page from `TODO.md` does not exist.
- Default social links still point to generic `https://twitter.com` and `https://linkedin.com`.
- Default field note bodies are empty strings, even though several default entries are published.

## Build, Type, and Lint Status

### Build

`npm run build` completed successfully.

Generated routes include:

- Public static routes: `/`, `/about`, `/archive`, `/contact`, `/ritual`
- Admin static routes: `/admin`, `/admin/accounts`, `/admin/entries`, `/admin/login`, `/admin/site`
- Dynamic/API routes: auth, contact, entries, lamp words, users, site content, and `/field-notes/[id]`

### TypeScript

`npx tsc --noEmit` passed.

### ESLint

`npm run lint` failed.

Errors:

- `src/app/admin/entries/page.tsx`: `react-hooks/set-state-in-effect` on the initial `loadEntries()` effect.
- `src/app/admin/login/page.tsx`: raw `<a href="/">` should use `next/link`.
- `src/app/field-notes/[id]/page.tsx`: unescaped apostrophe in text.
- `src/components/admin/AdminShell.tsx`: `react-hooks/set-state-in-effect` when closing the mobile nav on pathname change.
- `src/components/admin/AdminShell.tsx`: raw `<a href="/">` should use `next/link`.
- `src/components/admin/AdminShell.tsx`: another raw `<a href="/">` should use `next/link`.
- `src/components/sections/ArchiveSection.tsx`: `react-hooks/set-state-in-effect` when resetting carousel state on tag changes.

Warnings:

- Multiple `<img>` usage warnings where Next recommends `next/image`.
- Unused `_` variables when stripping `passwordHash` from user objects.

## Dependency Vulnerabilities

`npm audit --audit-level=low` reported:

| Package | Severity | Advisory |
|---|---:|---|
| `next` | High | Denial of Service with Server Components: `GHSA-q4gf-8mx6-v5v3` |
| `postcss` | Moderate | XSS via unescaped `</style>` in CSS stringify output: `GHSA-qx2v-qp2m-jg93` |
| `uuid` | Moderate | Missing buffer bounds check in v3/v5/v6 when `buf` is provided: `GHSA-w5hq-g745-h8pq` |

Audit suggested `npm audit fix --force`, but that would install versions outside current stated ranges and may include breaking changes. These should be handled intentionally:

- Upgrade Next.js to a patched compatible release after checking Next 16 release notes.
- Upgrade PostCSS through the dependency tree or direct dev dependency as needed.
- Evaluate `uuid@14` compatibility before upgrading because the audit marks it as breaking.

## Security Findings

### High Priority

1. Public contact endpoint can be abused when reCAPTCHA is not configured.

`src/app/api/contact/route.ts` returns `true` from captcha verification when `RECAPTCHA_SECRET_KEY` is missing. This is acceptable for local development, but in production it means `/api/contact` becomes an unauthenticated, unrate-limited submission endpoint. It also silently skips Google Form submission if form env vars are missing while still returning success.

Recommended fix:

- Require reCAPTCHA in production.
- Fail closed when production env vars are absent.
- Add rate limiting by IP/session/fingerprint.
- Return a useful operational error if the form destination is not configured.

2. Admin/login and lamp password routes have no rate limiting.

`src/app/api/auth/login/route.ts` and `src/app/api/auth/lamp/route.ts` accept repeated password attempts without throttling, lockout, backoff, or bot protection.

Recommended fix:

- Add rate limiting to `/api/auth/login`, `/api/auth/lamp`, and `/api/contact`.
- Log failed auth attempts in production.
- Consider CAPTCHA or temporary lockout after repeated failures.

3. Rich text body rendering may allow stored XSS if unsafe HTML reaches storage.

`src/app/field-notes/[id]/page.tsx` renders `entry.body` through `dangerouslySetInnerHTML`. The body comes from the admin rich text editor and is persisted through API routes without visible server-side sanitization.

Risk depends on who can access admin. If an admin/moderator account is compromised, injected scripts could execute for public visitors.

Recommended fix:

- Sanitize rich text server-side before storage or before rendering.
- Restrict allowed tags, attributes, protocols, and image sources.
- Validate TipTap link/image URLs to block `javascript:` and other unsafe protocols.

### Medium Priority

4. API update routes trust incoming shape too broadly.

Entry, site content, user, and lamp word update routes accept `req.json()` and apply broad patches with minimal schema validation.

Examples:

- `src/app/api/entries/route.ts` passes raw request JSON into `createEntry`.
- `src/app/api/entries/[id]/route.ts` passes raw request JSON into `updateEntry`.
- `src/app/api/site-content/route.ts` stores raw content payloads.
- `src/app/api/users/[id]/route.ts` accepts `body.role` without validating it against the allowed roles during updates.
- `src/app/api/lamp-words/[id]/route.ts` passes the whole request body into `updateLampWord`.

Recommended fix:

- Add request schemas for all write endpoints.
- Reject unknown fields.
- Enforce role enum validation on user updates.
- Enforce URL validation for links and images.

5. Session cookie lacks an explicit SameSite/CSRF strategy for write APIs.

The session cookie is `httpOnly`, `secure` in production, and `sameSite: "lax"`, which is a good baseline. However, write endpoints rely only on cookie authentication and do not include CSRF tokens or Origin checks.

Recommended fix:

- Add Origin/Referer validation for mutating API routes.
- Consider CSRF tokens for admin forms.
- Keep `sameSite: "lax"` or stronger unless cross-site admin flows are required.

6. Password policy is weak.

`src/app/api/users/change-password/route.ts` accepts new passwords with only a 6-character minimum.

Recommended fix:

- Increase minimum length.
- Add password quality checks or guidance.
- Consider blocking common passwords.

7. Storage writes can lose updates under concurrent admin actions.

`src/lib/storage.ts` reads and writes whole JSON files/blobs. Concurrent writes can overwrite each other, especially for entries, users, site content, and lamp words.

Recommended fix:

- Add optimistic concurrency with version timestamps.
- Move frequently edited data to a transactional store if multi-user editing becomes important.

### Low Priority

8. `verifySession` defaults missing token fields to admin-like values.

`src/lib/auth.ts` defaults missing `role` to `"admin"` and missing `userId` to `"env-admin"` after JWT verification. A signed malformed token would therefore receive elevated defaults.

Recommended fix:

- Treat missing role, userId, or username as invalid.
- Validate the role enum explicitly.

9. Logout deletes the cookie without mirroring all cookie options.

`clearSession()` calls `cookieStore.delete(SESSION_COOKIE)`. This usually works, but cookie deletion can be more reliable when maxAge/path/security options match how it was set.

Recommended fix:

- Explicitly set the cookie to an expired value with matching path and security options if logout issues appear.

## Functional Bugs and Product Risks

1. Public field note detail route can expose unpublished entries.

The `/api/entries/[id]` GET handler returns any entry by ID without checking `published`. Since `/field-notes/[id]` fetches from this endpoint, an unpublished entry can be viewed if someone knows or guesses its ID. UUIDs are hard to guess, but default IDs such as `default-1` are predictable.

Recommended fix:

- Public GET should return only published entries.
- Admin-only preview should require auth or a dedicated preview mode.

2. Missing image files will cause broken social and content imagery.

The app references images that were not found in `public/images`:

- `/images/og-image-placeholder.png`
- `/images/founder-placeholder.png`
- `/images/alter-ego-placeholder.png`
- `/images/thumbnail-placeholder.png`

Recommended fix:

- Add final assets or update references to files that exist.
- Consider using `next/image` for content images where practical.

3. `robots.txt` advertises a sitemap that does not exist.

Search engines will request `/sitemap.xml`, but no sitemap route exists.

Recommended fix:

- Create `src/app/sitemap.ts` listing public routes and published field notes.

4. Contact form can appear successful even if Google Form delivery is not configured.

`submitToGoogleForm()` returns early when form configuration is absent, and the API still returns `{ success: true }`.

Recommended fix:

- In production, fail loudly when the destination is not configured.
- Track submission failures in logs or monitoring.

5. Admin content defaults may look production-ready while still being placeholder/demo content.

Several published default field notes have titles and excerpts but empty bodies and placeholder thumbnails. This can produce a polished-looking archive with hollow detail pages.

Recommended fix:

- Replace default content before launch.
- Consider treating empty-body published entries as invalid in the admin form.

6. `ArchiveSection` polls `/api/entries` every 15 seconds for every visitor.

This keeps public content fresh but can create unnecessary server traffic as the site gets visitors.

Recommended fix:

- Replace polling with cache revalidation, manual refresh, or a longer interval.
- Consider using static rendering plus revalidation for published content.

7. Admin sidebar hides admin-only links client-side, but middleware/API authorization is the actual protection.

Middleware correctly redirects moderators away from `/admin/site` and `/admin/accounts`, and API routes check admin role for sensitive operations. This is good, but the client-side shell briefly has unknown role until `/api/auth/session` resolves.

Recommended fix:

- Keep server/API checks as the source of truth.
- Optionally render a loading state before showing nav items.

## SEO, Accessibility, and Performance

SEO gaps:

- Missing sitemap route.
- Missing JSON-LD structured data.
- OG/Twitter image path points to a missing placeholder image.
- Field note detail pages are client-rendered and do not export per-entry metadata.
- `/archive` and `/contact` redirect to homepage anchors; this is fine for UX, but those standalone route descriptions in `README.md` may overstate the actual page structure.

Accessibility/performance gaps:

- Several raw `<img>` tags trigger Next lint warnings.
- Lighthouse has not been run.
- The site is dark-mode only; `TODO.md` lists a future theme toggle.
- Some admin actions rely on `alert()`/`confirm()`, which works but is not ideal for polished accessibility.

## Next.js 16 Notes

The project uses Next.js 16.2.1. Build output flagged `src/middleware.ts` as deprecated in favor of the `proxy` convention. The repo rules also warn that this Next.js version may have breaking changes and that relevant docs should be checked before implementing code changes.

Recommended fix:

- Before touching routing/middleware/proxy behavior, read the installed Next docs under `node_modules/next/dist/docs/`.
- Plan a focused migration from `middleware.ts` to the current `proxy` convention.

## Recommended Priority Order

1. Patch dependency vulnerabilities, especially the Next.js Server Components DoS advisory.
2. Add rate limiting to contact, login, and lamp password endpoints.
3. Fix rich text sanitization before public rendering.
4. Fix lint errors so CI/deploy checks can be trusted.
5. Add schema validation for write APIs.
6. Add the missing sitemap or remove the sitemap reference until it exists.
7. Replace missing/placeholder assets and update OG metadata.
8. Fix unpublished field note exposure from `/api/entries/[id]`.
9. Configure Next `turbopack.root` or remove the parent lockfile to avoid root inference issues.
10. Migrate `middleware.ts` to the current Next.js `proxy` convention.
11. Complete production env setup and run contact/admin password end-to-end tests.
12. Run Lighthouse and mobile-friendly validation after the above fixes.

## Files Most Worth Reviewing First

- `src/app/api/contact/route.ts`
- `src/app/api/auth/login/route.ts`
- `src/app/api/auth/lamp/route.ts`
- `src/app/api/entries/[id]/route.ts`
- `src/app/field-notes/[id]/page.tsx`
- `src/components/admin/RichTextEditor.tsx`
- `src/lib/auth.ts`
- `src/lib/storage.ts`
- `src/middleware.ts`
- `src/app/layout.tsx`
- `TODO.md`

