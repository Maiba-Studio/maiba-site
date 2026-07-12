import { put, get } from "@vercel/blob";
import fs from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const IS_VERCEL = !!process.env.BLOB_READ_WRITE_TOKEN;

/** Minimum CDN TTL Blob allows (seconds). CMS JSON must stay fresh. */
const CMS_CACHE_MAX_AGE = 60;

async function ensureLocalDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch {
    /* exists */
  }
}

function blobKey(filename: string) {
  return `maiba-data/${filename}`;
}

export async function readJSON<T>(filename: string, fallback: T): Promise<T> {
  if (IS_VERCEL) {
    try {
      // Bypass Blob CDN — overwrites can take 60s+ to propagate when cached.
      const result = await get(blobKey(filename), {
        access: "private",
        useCache: false,
      });
      if (!result) return fallback;
      const response = new Response(result.stream);
      return (await response.json()) as T;
    } catch {
      return fallback;
    }
  }

  await ensureLocalDir();
  try {
    const raw = await fs.readFile(path.join(DATA_DIR, filename), "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function writeJSON<T>(filename: string, data: T): Promise<void> {
  const json = JSON.stringify(data, null, 2);

  if (IS_VERCEL) {
    // Single overwrite put — avoid list+delete+put (slow admin saves + races).
    await put(blobKey(filename), json, {
      access: "private",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
      cacheControlMaxAge: CMS_CACHE_MAX_AGE,
    });
    return;
  }

  await ensureLocalDir();
  await fs.writeFile(path.join(DATA_DIR, filename), json);
}
