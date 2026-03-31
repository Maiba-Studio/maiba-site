import { put, head } from "@vercel/blob";
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
      const meta = await head(blobKey(filename));
      const res = await fetch(meta.url, { cache: "no-store" });
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
    await put(blobKey(filename), json, {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
    });
    return;
  }

  await ensureLocalDir();
  await fs.writeFile(path.join(DATA_DIR, filename), json);
}
