# Next steps: get the site working on Vercel

This project stores admin-edited content (Field Notes, site copy, users, lamp words) in **Vercel Blob** in production. Without the blob token, or with wrong env vars, login, saves, and publishes can fail or appear to “not stick.”

Work through the sections in order.

---

## 1. Push the latest code

1. Commit any local changes (including fixes for blob overwrites and the admin form).
2. Push to the branch Vercel deploys from (usually `main`).
3. Wait for the deployment to finish, or trigger **Redeploy** in the Vercel dashboard.

---

## 2. Add a Vercel Blob store

Admin saves write JSON files such as `entries.json` and `site-content.json` into Blob storage.

1. Open [Vercel Dashboard](https://vercel.com/dashboard) → your **project**.
2. Go to the **Storage** tab.
3. Click **Create** → **Blob** (or **Create Database** → **Blob**, depending on the UI).
4. Attach the store to this project when prompted.

Vercel should add **`BLOB_READ_WRITE_TOKEN`** to the project’s environment variables automatically. If it does not:

1. Open **Settings** → **Environment Variables**.
2. Add **`BLOB_READ_WRITE_TOKEN`** with the read/write token from the Blob store (Production, and Preview if you use preview deploys).

---

## 3. Set environment variables on Vercel

Go to **Project** → **Settings** → **Environment Variables** and ensure these exist for **Production** (and **Preview** if you test previews).

| Variable | Notes |
|----------|--------|
| `JWT_SECRET` | Long random secret. Generate locally: `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"` |
| `ADMIN_USERNAME` | e.g. `maiba-admin` |
| `ADMIN_PASSWORD_HASH` | Bcrypt hash of your admin password. **On Vercel, paste the hash exactly** — do **not** add backslashes before `$`. |
| `LAMP_PASSWORD_HASH` | Bcrypt hash for the Lamp phrase (e.g. “Mariposa Ylang”). Same rule: **no `\$` escaping** on Vercel. |
| `BLOB_READ_WRITE_TOKEN` | From step 2; required for saves to persist. |

**Local vs Vercel (important):**

- **`.env.local` (local):** Next.js/dotenv can expand `$` inside values. Bcrypt hashes must use **escaped** dollars: `\$2b\$12\$...`
- **Vercel dashboard:** Paste the hash **as generated** (normal `$2b$12$...`), with **no** backslashes.

If you change any variable, run **Redeploy** so new values are picked up.

---

## 4. Redeploy after env changes

Environment variables are baked in at build/runtime per deployment.

1. **Deployments** → three dots on the latest deployment → **Redeploy** (or push an empty commit).

---

## 5. Verify everything

Do this on your **production URL** (custom domain or `*.vercel.app`).

### Public site

- [ ] Home loads; sections and carousel show Field Notes.
- [ ] Hard refresh (Ctrl+Shift+R) after saving in admin to avoid stale cache while testing.

### Admin

- [ ] Open `/admin/login` and sign in with `ADMIN_USERNAME` + the password that matches `ADMIN_PASSWORD_HASH`.
- [ ] **Site content:** change a line, save, reload the home page — change should appear.
- [ ] **Field Notes:** edit an entry (thumbnail can be `/images/...` or a full URL), save; use **Publish** / **Unpublish**; confirm the public site updates.
- [ ] **Lamp** (if you use it): correct phrase still opens the flow you expect.

If something fails, open browser **DevTools** → **Network**, repeat the action, and check the failing request (e.g. `/api/site-content`, `/api/entries`) for status **401** (auth), **500** (server), or a JSON `error` message.

---

## 6. Optional: local development

1. Copy `.env.example` to `.env.local`.
2. Fill in all variables; for bcrypt hashes in `.env.local`, use **`\$`** before each `$` in the hash.
3. Leave **`BLOB_READ_WRITE_TOKEN` empty** to use the local `data/` folder instead of Blob.
4. Run `npm run dev` and test at `http://localhost:3000`.

---

## Quick reference: what usually breaks

| Symptom | Likely cause |
|---------|----------------|
| Saves never persist on Vercel | Missing `BLOB_READ_WRITE_TOKEN` or Blob not linked to the project |
| Admin password works locally but not on Vercel | Hash pasted with `\$` on Vercel, or wrong hash / wrong `ADMIN_USERNAME` |
| Lamp phrase fails on Vercel | Same as above for `LAMP_PASSWORD_HASH` |
| Logged out after redeploy | Expected if `JWT_SECRET` changed; log in again |
| Edit form “does nothing” | Rare: browser blocking submit; ensure thumbnail is not stuck on invalid `type="url"` — current code uses a text field for paths |

---

When these steps are done, the site should keep admin changes across visits and deployments. If you want a single checklist to print, use sections 1 → 5 in order.
