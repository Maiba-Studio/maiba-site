"use client";

import { useState, FormEvent } from "react";
import type { FieldNote } from "@/lib/data";

const TAGS = ["drawing", "log", "code", "vision", "shadow"] as const;

interface Props {
  entry: FieldNote | null;
  onSaved: () => void;
}

export default function EntryForm({ entry, onSaved }: Props) {
  const isEdit = !!entry;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState(entry?.title ?? "");
  const [headline, setHeadline] = useState(entry?.headline ?? "");
  const [excerpt, setExcerpt] = useState(entry?.excerpt ?? "");
  const [body, setBody] = useState(entry?.body ?? "");
  const [tag, setTag] = useState<(typeof TAGS)[number]>(entry?.tag ?? "log");
  const [date, setDate] = useState(
    entry?.date ?? new Date().toISOString().slice(0, 10)
  );
  const [thumbnail, setThumbnail] = useState(entry?.thumbnail ?? "");
  const [images, setImages] = useState(entry?.images?.join("\n") ?? "");
  const [links, setLinks] = useState(
    entry?.links?.map((l) => `${l.label}|${l.url}`).join("\n") ?? ""
  );
  const [published, setPublished] = useState(entry?.published ?? false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    const parsedLinks = links
      .split("\n")
      .filter((l) => l.trim())
      .map((l) => {
        const [label, url] = l.split("|");
        return { label: label?.trim() || "", url: url?.trim() || "" };
      })
      .filter((l) => l.url);

    const parsedImages = images
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      title,
      headline,
      excerpt,
      body,
      tag,
      date,
      thumbnail,
      images: parsedImages,
      links: parsedLinks,
      published,
    };

    try {
      const url = isEdit ? `/api/entries/${entry.id}` : "/api/entries";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        onSaved();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to save");
      }
    } catch {
      setError("Connection failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h2 className="font-display text-2xl text-foreground mb-6">
        {isEdit ? "Edit Entry" : "New Entry"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        {/* Title */}
        <Field label="Title">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="admin-input"
            placeholder="Entry title"
          />
        </Field>

        {/* Headline */}
        <Field label="Headline" hint="Short subtitle for cards">
          <input
            type="text"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            className="admin-input"
            placeholder="A brief headline"
          />
        </Field>

        {/* Tag + Date row */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Tag">
            <select
              value={tag}
              onChange={(e) =>
                setTag(e.target.value as (typeof TAGS)[number])
              }
              className="admin-input"
            >
              {TAGS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Date">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="admin-input"
            />
          </Field>
        </div>

        {/* Excerpt */}
        <Field label="Excerpt" hint="Shown in the grid card">
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={3}
            required
            className="admin-input resize-none"
            placeholder="Brief description..."
          />
        </Field>

        {/* Body */}
        <Field label="Body" hint="Full content (optional, supports plain text)">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={8}
            className="admin-input resize-y"
            placeholder="Full entry content..."
          />
        </Field>

        {/* Thumbnail */}
        <Field label="Thumbnail URL" hint="URL to thumbnail image">
          <input
            type="url"
            value={thumbnail}
            onChange={(e) => setThumbnail(e.target.value)}
            className="admin-input"
            placeholder="https://..."
          />
        </Field>

        {/* Images */}
        <Field label="Images" hint="One URL per line">
          <textarea
            value={images}
            onChange={(e) => setImages(e.target.value)}
            rows={3}
            className="admin-input resize-none"
            placeholder={"https://image1.jpg\nhttps://image2.jpg"}
          />
        </Field>

        {/* Links */}
        <Field label="Links" hint="Format: Label|URL — one per line">
          <textarea
            value={links}
            onChange={(e) => setLinks(e.target.value)}
            rows={3}
            className="admin-input resize-none"
            placeholder={"GitHub|https://github.com\nDemo|https://demo.com"}
          />
        </Field>

        {/* Published toggle */}
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            className={`w-10 h-5 rounded-full relative transition-colors ${
              published ? "bg-maiba-red/40" : "bg-malamaya-border"
            }`}
            onClick={() => setPublished(!published)}
          >
            <div
              className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${
                published
                  ? "left-5 bg-maiba-red"
                  : "left-0.5 bg-malamaya"
              }`}
            />
          </div>
          <span className="text-sm text-malamaya">
            {published ? "Published" : "Draft"}
          </span>
        </label>

        {error && <p className="text-maiba-red text-sm">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-maiba-red/10 border border-maiba-red/30 text-maiba-red px-6 py-3 rounded-sm hover:bg-maiba-red/20 transition-colors text-sm tracking-widest uppercase disabled:opacity-50"
          >
            {saving ? "Saving..." : isEdit ? "Update Entry" : "Create Entry"}
          </button>
          {!published && (
            <button
              type="button"
              onClick={() => {
                setPublished(true);
                setTimeout(() => {
                  document
                    .querySelector<HTMLFormElement>("form")
                    ?.requestSubmit();
                }, 0);
              }}
              disabled={saving}
              className="border border-malamaya-border/30 text-malamaya px-6 py-3 rounded-sm hover:border-malamaya hover:text-foreground transition-colors text-sm tracking-widest uppercase disabled:opacity-50"
            >
              Save & Publish
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-xs tracking-widest uppercase text-malamaya mb-2 block">
        {label}
        {hint && (
          <span className="text-malamaya-border ml-2 normal-case tracking-normal">
            — {hint}
          </span>
        )}
      </label>
      {children}
    </div>
  );
}
