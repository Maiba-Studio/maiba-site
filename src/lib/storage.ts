import { put, list, del } from "@vercel/blob";
import fs from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const IS_VERCEL = !!process.env.BLOB_READ_WRITE_TOKEN;

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
      const blobs = await list({ prefix: blobKey(filename) });
      const match = blobs.blobs.find((b) => b.pathname === blobKey(filename));
      if (!match) return fallback;
      const res = await fetch(match.url, { cache: "no-store" });
      if (!res.ok) return fallback;
      return (await res.json()) as T;
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
    const blobs = await list({ prefix: blobKey(filename) });
    const existing = blobs.blobs.find((b) => b.pathname === blobKey(filename));
    if (existing) {
      await del(existing.url);
    }
    await put(blobKey(filename), json, {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
    });
    return;
  }

  await ensureLocalDir();
  await fs.writeFile(path.join(DATA_DIR, filename), json);
}
