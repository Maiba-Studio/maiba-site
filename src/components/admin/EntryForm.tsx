"use client";

import { useState, FormEvent, KeyboardEvent } from "react";
import { X } from "lucide-react";
import type { FieldNote } from "@/lib/data";
import RichTextEditor from "./RichTextEditor";

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
  const [seoTags, setSeoTags] = useState<string[]>(entry?.seoTags ?? []);
  const [seoTagInput, setSeoTagInput] = useState("");
  const [published, setPublished] = useState(entry?.published ?? false);

  const addSeoTag = (value: string) => {
    const trimmed = value.trim().replace(/^#/, "");
    if (trimmed && !seoTags.includes(trimmed)) {
      setSeoTags([...seoTags, trimmed]);
    }
    setSeoTagInput("");
  };

  const handleSeoTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSeoTag(seoTagInput);
    }
    if (e.key === "Backspace" && !seoTagInput && seoTags.length > 0) {
      setSeoTags(seoTags.slice(0, -1));
    }
  };

  const removeSeoTag = (index: number) => {
    setSeoTags(seoTags.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    const payload = {
      title,
      headline,
      excerpt,
      body,
      tag,
      date,
      thumbnail,
      images: [],
      links: [],
      seoTags,
      published,
    };

    try {
      const url = isEdit ? `/api/entries/${entry.id}` : "/api/entries";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        credentials: "include",
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

      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
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

        <Field label="Headline" hint="Short subtitle for cards">
          <input
            type="text"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            className="admin-input"
            placeholder="A brief headline"
          />
        </Field>

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

        <Field label="Body" hint="Rich text — full article content">
          <RichTextEditor
            content={body}
            onChange={setBody}
            placeholder="Write your field note here..."
          />
        </Field>

        <Field label="Thumbnail URL" hint="Absolute URL or site path (e.g. /images/...)">
          <input
            type="text"
            value={thumbnail}
            onChange={(e) => setThumbnail(e.target.value)}
            className="admin-input"
            placeholder="https://... or /images/..."
          />
        </Field>

        <Field label="SEO Tags" hint="Press Enter or comma to add. Visible on the public page.">
          <div className="admin-input flex flex-wrap gap-2 min-h-[42px] items-center !p-2">
            {seoTags.map((t, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 bg-maiba-red/10 border border-maiba-red/30 text-maiba-red text-xs px-2.5 py-1 rounded-sm"
              >
                #{t}
                <button
                  type="button"
                  onClick={() => removeSeoTag(i)}
                  className="hover:text-foreground transition-colors"
                >
                  <X className="w-3 h-3" strokeWidth={2} />
                </button>
              </span>
            ))}
            <input
              type="text"
              value={seoTagInput}
              onChange={(e) => setSeoTagInput(e.target.value)}
              onKeyDown={handleSeoTagKeyDown}
              onBlur={() => { if (seoTagInput.trim()) addSeoTag(seoTagInput); }}
              className="flex-1 min-w-[120px] bg-transparent border-none outline-none text-foreground text-sm placeholder:text-malamaya-border/60"
              placeholder={seoTags.length === 0 ? "art, design, creative tech..." : ""}
            />
          </div>
        </Field>

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
