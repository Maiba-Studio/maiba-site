# Maiba Studio — Production Status Report

Generated: 2026-07-13

## Executive Verdict

The site is **technically launch-capable** for [maiba.studio](https://www.maiba.studio/). Core product surfaces, admin CMS, contact delivery, branding assets, SEO scaffolding, and in-repo security hardening are in place.

What remains is mostly **content, final imagery, production verification, and a few durable security upgrades** that should be done before or soon after public launch.

---

## 1. What We’ve Done

### Public site

- Landing page with Hero, About, Field Notes archive, and Contact
- Ritual manifesto page (`/ritual`) with lamp / Konami access flow
- Orphan artist page at `/el` (`noindex`, not linked from nav)
- Transparent logo wordmark, PFP-based favicon/icon set, OG image
- Header logo links to `https://www.maiba.studio/`
- Nav works from non-home pages (e.g. `/ritual` → `/#about`)
- Contact form requires all fields before submit
- Contact form integrates reCAPTCHA v3 (score-based, no popup) + Google Forms delivery

### Admin dashboard

- Auth with JWT sessions, admin vs moderator roles
- Field Notes CRUD, publish/unpublish
- Editable Field Note tags (add/remove; used by public filters)
- SEO URL slugs for field notes
- Site Content editing for Hero, About (including section titles), Field Notes section copy, Contact, Ritual, Lamp words
- Optional social-link labels (`showLabel`) so icons can appear without text
- Accounts: password change, moderator management

### SEO / technical

- Dynamic `/sitemap.xml`
- JSON-LD: Organization (home), Article (field notes), Person (`/el`)
- Server-rendered field note pages with per-entry metadata, canonical, Open Graph, Twitter cards
- Next.js 16.2.4, patched deps, PostCSS override
- Migrated `middleware` → `src/proxy.ts`
- Turbopack root configured

### Security hardening already shipped

- Rate limiting on contact, login, lamp
- Same-origin checks on mutating APIs
- Payload validation for entries, users, lamp words, site content
- Rich text sanitized with `sanitize-html` before storage
- Unpublished entries hidden from public GET without session
- Stricter JWT payload validation
- Password minimum raised to 10 characters
- Contact fails closed in production if reCAPTCHA / Google Form env is missing
- Sensitive Vercel env vars marked Sensitive (except managed Blob token)

---

## 2. What’s Left

### Required before calling it “production ready”

| Area | Status | Notes |
|---|---|---|
| reCAPTCHA keys | Likely done | Confirm both site + secret keys are set and redeployed |
| Google Form env vars | Likely done | Form responses were already received in testing |
| End-to-end contact test on production | Confirm | Submit once more after any env/redeploy changes |
| Admin password change on production | Pending | Log out/in after change |
| Founder / alter-ego photos | Pending | Still placeholders or admin URLs |
| Field note thumbnails + real bodies | Pending | Default entries are thin / placeholder-heavy |
| Final copy via admin | Pending | Hero, About, Contact, social URLs |
| Lighthouse + mobile + OG validators | Pending | External checks against live domain |
| Email forwarding | Pending | `el@` / `hello@maiba.studio` |
| Analytics (optional) | Pending | Vercel Web Analytics / Speed Insights |

### Optional / future

- Admin-editable `/el` page
- Direct image upload to Blob
- Draft preview mode
- RSS / search
- Activity log + automated backups
- Recoleta local font
- Dark/light toggle

---

## 3. Next Steps for Production

Do these in order:

1. **Env checklist (Vercel Production + Preview)**
   - `JWT_SECRET` (Sensitive)
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD_HASH` (Sensitive)
   - `LAMP_PASSWORD_HASH` (Sensitive)
   - `BLOB_READ_WRITE_TOKEN` (Blob-managed; rotate if ever exposed)
   - `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
   - `RECAPTCHA_SECRET_KEY` (Sensitive)
   - `GOOGLE_FORM_URL` → `.../formResponse`
   - `GOOGLE_FORM_NAME_FIELD=entry.1217052560`
   - `GOOGLE_FORM_EMAIL_FIELD=entry.1546459689`
   - `GOOGLE_FORM_MESSAGE_FIELD=entry.725334036`

2. **Redeploy** after any env change.

3. **Smoke test**
   - Home, About, Field Notes, Contact, Ritual, `/el`
   - Contact submit → Google Forms
   - Admin login, edit content, publish a real field note
   - Password change + re-login

4. **Content pass**
   - Replace founder/alter-ego images
   - Publish 3–5 real field notes with body, thumbnail, SEO tags, slug
   - Fix social URLs away from generic `twitter.com` / `linkedin.com`

5. **External quality checks**
   - Lighthouse on production
   - [opengraph.xyz](https://www.opengraph.xyz) / Twitter Card Validator
   - Google Mobile-Friendly Test

6. **Soft launch** → monitor Forms + Vercel logs for a few days.

---

## 4. Security Audit

### Already mitigated

| Control | Where |
|---|---|
| HttpOnly / Secure / SameSite=Lax session cookie | `src/lib/auth.ts` |
| bcrypt password hashing (cost 12) | `src/lib/auth.ts` |
| JWT HS256 with required `JWT_SECRET` | `src/lib/auth.ts` |
| Role-gated admin routes via proxy | `src/proxy.ts` |
| API auth on write endpoints | `/api/entries`, `/api/users`, `/api/site-content`, `/api/lamp-words` |
| Rate limits | contact / login / lamp |
| Origin checks on mutating routes | `src/lib/request-security.ts` |
| HTML sanitization | `src/lib/sanitize.ts` |
| Unpublished note privacy | `/api/entries/[id]` + server page |
| Production fail-closed contact config | `/api/contact` |

### Remaining risks and how to fix them

#### High priority

1. **In-memory rate limiting is weak on Vercel serverless**
   - Risk: each isolate has its own Map; attackers can spread load.
   - Fix: use Upstash Redis / Vercel KV / Edge Config counters, or Vercel Firewall / WAF rate rules.

2. **Origin check allows requests with no `Origin` header**
   - Risk: non-browser clients can skip the check.
   - Fix: for mutating routes, require `Origin` or `Referer` matching the site in production; reject if both missing.

3. **Google Form submission errors are swallowed**
   - Risk: API can return success even if Forms silently fails.
   - Fix: check response status from Forms; return 502 on failure; log status text.

4. **Concurrent Blob JSON writes can overwrite each other**
   - Risk: two admins saving at once can lose data.
   - Fix: version/etag optimistic locking, or move critical data to a transactional store.

#### Medium priority

5. **No Content-Security-Policy / security headers**
   - Risk: XSS impact is larger if HTML escapes sanitizer.
   - Fix: add headers in `next.config.ts` or Vercel: `Content-Security-Policy`, `X-Frame-Options` / `frame-ancestors`, `Referrer-Policy`, `Permissions-Policy`.

6. **Stored XSS residual via TipTap HTML**
   - Risk: compromised admin/moderator can still attempt payloads; sanitizer must stay correct.
   - Fix: keep server-side sanitize on write and render; add periodic regression tests for dangerous tags/attrs; prefer CSP `script-src 'self'`.

7. **Lamp words are plaintext string matches**
   - Risk: low, but words are readable in Blob JSON if storage is compromised.
   - Fix: store hashed lamp words if secrecy matters; keep links separate.

8. **Password policy is still light (10 chars only)**
   - Risk: weak admin passwords.
   - Fix: raise to 12+, block common passwords, optionally require mixed character classes.

9. **CSRF defense is partial**
   - Risk: cookie auth + missing Origin can be abused by crafted clients.
   - Fix: double-submit CSRF token for admin mutations, or require custom header + Origin always.

#### Lower priority

10. **`BLOB_READ_WRITE_TOKEN` cannot be marked Sensitive manually**
    - Managed by Vercel Blob connection.
    - Fix: rotate via **Rotate Blob Credentials** if exposed; restrict who can access the Vercel project.

11. **Admin login has no CAPTCHA**
    - Rate limited, but not bot-hardened.
    - Fix: add reCAPTCHA to `/admin/login` or use Vercel Bot Protection / Firewall.

12. **No admin activity audit log**
    - Harder to detect insider/moderator abuse.
    - Fix: append-only log of create/update/delete with userId + timestamp.

13. **Default published demo field notes**
    - Risk: placeholder content indexed if left published.
    - Fix: unpublish or replace before SEO push.

### Ops hygiene

- Never commit `.env.local`
- Keep JWT / password hashes / Blob token Sensitive where possible
- Rotate `JWT_SECRET` if ever leaked (invalidates all sessions)
- Prefer Node 20 LTS or 22 LTS for local/CI (Node 23 showed engine warnings)

---

## 5. Production Readiness Score

| Category | Score | Comment |
|---|---:|---|
| Core product / UX | 9/10 | Solid; content still placeholder in places |
| Branding / assets | 8/10 | Logos done; portraits/thumbnails remain |
| Admin CMS power | 9/10 | Titles, tags, slugs, SEO fields in place |
| SEO scaffolding | 8/10 | Code ready; real content + Lighthouse still needed |
| Security baseline | 7.5/10 | Good in-repo hardening; need durable rate limit + headers |
| Launch ops | 6.5/10 | Env/content/verification still human-owned |

**Overall:** ~8/10 for soft launch; ~9/10 after content + durable rate limiting + security headers + smoke tests.

---

## 6. Recommended Immediate Actions

1. Confirm all production env vars and redeploy.
2. Replace founder/alter-ego images and publish real field notes.
3. Unpublish placeholder default notes if still live.
4. Add production security headers + shared rate limiting.
5. Run Lighthouse / OG / mobile checks on the live domain.
6. Soft launch and watch Forms + Vercel logs for 48 hours.
