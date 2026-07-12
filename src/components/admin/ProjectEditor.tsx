"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import RichTextEditor from "@/components/admin/RichTextEditor";
import SocialLinksEditor from "@/components/admin/SocialLinksEditor";
import type { Project, SocialLink } from "@/lib/data";

type FormState = Omit<Project, "id" | "createdAt" | "updatedAt">;

const empty = (): FormState => ({
  slug: "",
  title: "",
  excerpt: "",
  thumbnail: "",
  bodyHtml: "",
  links: [],
  published: true,
  sortOrder: 0,
  seoTitle: "",
  seoDescription: "",
});

function fromProject(data: Project): FormState {
  return {
    slug: data.slug || "",
    title: data.title || "",
    excerpt: data.excerpt || "",
    thumbnail: data.thumbnail || "",
    bodyHtml: data.bodyHtml || "",
    links: (data.links || []).map((l: SocialLink) => ({
      ...l,
      showLabel: l.showLabel !== false,
    })),
    published: data.published === true,
    sortOrder: data.sortOrder ?? 0,
    seoTitle: data.seoTitle || "",
    seoDescription: data.seoDescription || "",
  };
}

export default function ProjectEditor({ projectId }: { projectId?: string }) {
  const router = useRouter();
  const isNew = !projectId;
  const [form, setForm] = useState<FormState>(empty());
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!projectId) return;
    fetch(`/api/projects/${projectId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
          return;
        }
        setForm(fromProject(data));
      })
      .catch(() => setError("Failed to load project"))
      .finally(() => setLoading(false));
  }, [projectId]);

  const patch = (partial: Partial<FormState>) =>
    setForm((prev) => ({ ...prev, ...partial }));

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError("");

    try {
      const res = await fetch(
        isNew ? "/api/projects" : `/api/projects/${projectId}`,
        {
          method: isNew ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Save failed");
        return;
      }
      setSaved(true);
      if (isNew) router.push(`/admin/projects/${data.id}`);
      else setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Connection failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminShell>
        <p className="text-malamaya text-sm">Loading...</p>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-foreground">
            {isNew ? "New Project" : form.title || "Edit Project"}
          </h1>
          <p className="text-malamaya text-sm mt-1">
            Card on /projects · detail at /projects/slug
          </p>
        </div>
        <Link
          href="/admin/projects"
          className="text-xs tracking-widest uppercase text-malamaya hover:text-maiba-red transition-colors"
        >
          ← All projects
        </Link>
      </div>

      <form onSubmit={handleSave} className="max-w-2xl space-y-6 min-w-0 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Title">
            <input
              type="text"
              value={form.title}
              onChange={(e) => patch({ title: e.target.value })}
              className="admin-input"
              required
            />
          </Field>
          <Field label="URL Slug">
            <input
              type="text"
              value={form.slug}
              onChange={(e) => patch({ slug: e.target.value })}
              className="admin-input"
              placeholder="my-project"
            />
          </Field>
        </div>

        <Field label="Short Description" hint="Shown on the gallery card">
          <textarea
            value={form.excerpt}
            onChange={(e) => patch({ excerpt: e.target.value })}
            rows={3}
            className="admin-input"
          />
        </Field>

        <Field label="Thumbnail Image URL">
          <input
            type="text"
            value={form.thumbnail}
            onChange={(e) => patch({ thumbnail: e.target.value })}
            className="admin-input"
            placeholder="https://... or /images/..."
          />
        </Field>
        {form.thumbnail && (
          <Image
            src={form.thumbnail}
            alt="Preview"
            width={240}
            height={160}
            unoptimized={form.thumbnail.startsWith("http")}
            className="w-48 h-32 object-cover rounded-sm border border-malamaya-border/30"
          />
        )}

        <Field label="Detail Body">
          <RichTextEditor
            content={form.bodyHtml}
            onChange={(html) => patch({ bodyHtml: html })}
            placeholder="Full project story..."
          />
        </Field>

        <SocialLinksEditor
          links={form.links}
          onChange={(links) => patch({ links })}
        />

        <div className="border border-malamaya-border/20 rounded-sm p-4 space-y-4">
          <p className="text-xs tracking-widest uppercase text-malamaya-light">
            SEO & Visibility
          </p>
          <Field label="SEO Title">
            <input
              type="text"
              value={form.seoTitle}
              onChange={(e) => patch({ seoTitle: e.target.value })}
              className="admin-input"
            />
          </Field>
          <Field label="SEO Description">
            <textarea
              value={form.seoDescription}
              onChange={(e) => patch({ seoDescription: e.target.value })}
              rows={3}
              className="admin-input"
            />
          </Field>
          <label className="flex items-center gap-3 text-sm text-malamaya-light">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => patch({ published: e.target.checked })}
              className="accent-maiba-red"
            />
            Published
          </label>
          {form.slug && (
            <p className="text-malamaya-border text-xs">
              Public URL:{" "}
              <a
                href={`/projects/${form.slug}`}
                className="text-maiba-red hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                /projects/{form.slug}
              </a>
            </p>
          )}
        </div>

        {error && <p className="text-maiba-red text-sm">{error}</p>}

        <div className="flex items-center gap-4 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-maiba-red/10 border border-maiba-red/30 text-maiba-red px-6 py-3 rounded-sm hover:bg-maiba-red/20 transition-colors text-sm tracking-widest uppercase disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          {saved && <span className="text-emerald-400 text-sm">Saved!</span>}
        </div>
      </form>
    </AdminShell>
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
    <div className="min-w-0">
      <label className="text-xs tracking-widest uppercase text-malamaya mb-2 block">
        {label}
      </label>
      {hint && (
        <p className="text-malamaya-border text-xs mb-2 normal-case tracking-normal">
          {hint}
        </p>
      )}
      {children}
    </div>
  );
}
