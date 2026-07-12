"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import RichTextEditor from "@/components/admin/RichTextEditor";
import SocialLinksEditor from "@/components/admin/SocialLinksEditor";
import type { SocialLink, StudioMember } from "@/lib/data";

type MemberFormState = Omit<StudioMember, "id" | "createdAt" | "updatedAt">;

const emptyMember = (): MemberFormState => ({
  slug: "",
  name: "",
  role: "",
  headline: "",
  image: "",
  bioHtml: "",
  areasTitle: "Areas of Work",
  areas: [],
  connectTitle: "Connect",
  socialLinks: [],
  locationNote: "",
  published: true,
  noindex: false,
  seoTitle: "",
  seoDescription: "",
});

export default function MemberEditorPage({
  memberId,
}: {
  memberId?: string;
}) {
  const router = useRouter();
  const isNew = !memberId;
  const [form, setForm] = useState<MemberFormState>(emptyMember());
  const [areasText, setAreasText] = useState("");
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!memberId) return;
    fetch(`/api/members/${memberId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
          return;
        }
        setForm({
          slug: data.slug || "",
          name: data.name || "",
          role: data.role || "",
          headline: data.headline || "",
          image: data.image || "",
          bioHtml: data.bioHtml || "",
          areasTitle: data.areasTitle || "Areas of Work",
          areas: data.areas || [],
          connectTitle: data.connectTitle || "Connect",
          socialLinks: (data.socialLinks || []).map((l: SocialLink) => ({
            ...l,
            showLabel: l.showLabel !== false,
          })),
          locationNote: data.locationNote || "",
          published: data.published !== false,
          noindex: data.noindex === true,
          seoTitle: data.seoTitle || "",
          seoDescription: data.seoDescription || "",
        });
        setAreasText((data.areas || []).join("\n"));
      })
      .catch(() => setError("Failed to load member"))
      .finally(() => setLoading(false));
  }, [memberId]);

  const patch = (partial: Partial<MemberFormState>) =>
    setForm((prev) => ({ ...prev, ...partial }));

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError("");

    const payload = {
      ...form,
      areas: areasText
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
    };

    try {
      const res = await fetch(isNew ? "/api/members" : `/api/members/${memberId}`, {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Save failed");
        return;
      }
      setSaved(true);
      if (isNew) {
        router.push(`/admin/members/${data.id}`);
      } else {
        setTimeout(() => setSaved(false), 3000);
      }
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

  const publicPath = form.slug === "el" ? "/el" : `/members/${form.slug || "slug"}`;

  return (
    <AdminShell>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-foreground">
            {isNew ? "New Member Page" : form.name || "Edit Member"}
          </h1>
          <p className="text-malamaya text-sm mt-1">
            Studio member profile — same template for future members.
          </p>
        </div>
        <Link
          href="/admin/members"
          className="text-xs tracking-widest uppercase text-malamaya hover:text-maiba-red transition-colors"
        >
          ← All members
        </Link>
      </div>

      <form onSubmit={handleSave} className="max-w-2xl space-y-6 min-w-0 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Name">
            <input
              type="text"
              value={form.name}
              onChange={(e) => patch({ name: e.target.value })}
              className="admin-input"
              required
            />
          </Field>
          <Field label="URL Slug" hint="Used in /members/your-slug. Slug “el” also serves /el">
            <input
              type="text"
              value={form.slug}
              onChange={(e) => patch({ slug: e.target.value })}
              className="admin-input"
              placeholder="el"
            />
          </Field>
        </div>

        <Field label="Role / Title">
          <textarea
            value={form.role}
            onChange={(e) => patch({ role: e.target.value })}
            rows={2}
            className="admin-input"
            placeholder="Creative Technologist · Founder & Imagineer"
          />
        </Field>

        <Field label="Headline" hint="Optional short lead under the role">
          <textarea
            value={form.headline}
            onChange={(e) => patch({ headline: e.target.value })}
            rows={3}
            className="admin-input"
          />
        </Field>

        <Field label="Portrait Image URL">
          <input
            type="text"
            value={form.image}
            onChange={(e) => patch({ image: e.target.value })}
            className="admin-input"
            placeholder="/images/founder-placeholder.png"
          />
        </Field>
        {form.image && (
          <div className="flex items-center gap-4">
            <Image
              src={form.image}
              alt="Preview"
              width={64}
              height={64}
              unoptimized={form.image.startsWith("http")}
              className="w-16 h-16 rounded-full object-cover border border-malamaya-border/30"
            />
            <span className="text-malamaya text-xs">Preview</span>
          </div>
        )}

        <Field label="Bio">
          <RichTextEditor
            content={form.bioHtml}
            onChange={(html) => patch({ bioHtml: html })}
            placeholder="Member bio..."
          />
        </Field>

        <Field label="Areas Section Title">
          <input
            type="text"
            value={form.areasTitle}
            onChange={(e) => patch({ areasTitle: e.target.value })}
            className="admin-input"
          />
        </Field>
        <Field label="Areas of Work" hint="One per line">
          <textarea
            value={areasText}
            onChange={(e) => setAreasText(e.target.value)}
            rows={6}
            className="admin-input"
          />
        </Field>

        <Field label="Connect Section Title">
          <input
            type="text"
            value={form.connectTitle}
            onChange={(e) => patch({ connectTitle: e.target.value })}
            className="admin-input"
          />
        </Field>

        <SocialLinksEditor
          links={form.socialLinks}
          onChange={(socialLinks) => patch({ socialLinks })}
        />

        <Field label="Location / Availability Note">
          <textarea
            value={form.locationNote}
            onChange={(e) => patch({ locationNote: e.target.value })}
            rows={2}
            className="admin-input"
          />
        </Field>

        <div className="border border-malamaya-border/20 rounded-sm p-4 space-y-4">
          <p className="text-xs tracking-widest uppercase text-malamaya-light">SEO & Visibility</p>
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
          <label className="flex items-center gap-3 text-sm text-malamaya-light">
            <input
              type="checkbox"
              checked={form.noindex}
              onChange={(e) => patch({ noindex: e.target.checked })}
              className="accent-maiba-red"
            />
            Hide from search engines (noindex)
          </label>
          {form.slug && (
            <p className="text-malamaya-border text-xs">
              Public URL:{" "}
              <a href={publicPath} className="text-maiba-red hover:underline" target="_blank" rel="noreferrer">
                {publicPath}
              </a>
              {form.slug === "el" && (
                <span className="block mt-1">Also available at /members/el</span>
              )}
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
