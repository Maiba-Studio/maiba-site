"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import RichTextEditor from "@/components/admin/RichTextEditor";
import SocialLinksEditor from "@/components/admin/SocialLinksEditor";
import type { FieldNote, SocialLink, StudioMember } from "@/lib/data";

type MemberFormState = Omit<StudioMember, "id" | "createdAt" | "updatedAt">;

const emptyMember = (): MemberFormState => ({
  slug: "",
  name: "",
  role: "",
  headline: "",
  image: "",
  bioTitle: "Bio",
  bioHtml: "",
  showBioCard: true,
  areasTitle: "Disciplines",
  areas: [],
  showAreasCard: true,
  selectedWorkTitle: "Selected Work",
  selectedWorkIds: [],
  showSelectedWork: true,
  selectedWorkHtml: "",
  alterEgoEnabled: false,
  alterEgoName: "",
  alterEgoRole: "",
  alterEgoHeadline: "",
  alterEgoImage: "",
  alterEgoBioHtml: "",
  connectTitle: "Connect",
  socialLinks: [],
  locationNote: "",
  published: true,
  noindex: false,
  seoTitle: "",
  seoDescription: "",
});

function formFromMember(data: StudioMember): MemberFormState {
  return {
    slug: data.slug || "",
    name: data.name || "",
    role: data.role || "",
    headline: data.headline || "",
    image: data.image || "",
    bioTitle: data.bioTitle || "Bio",
    bioHtml: data.bioHtml || "",
    showBioCard: data.showBioCard !== false,
    areasTitle: data.areasTitle || "Disciplines",
    areas: data.areas || [],
    showAreasCard: data.showAreasCard !== false,
    selectedWorkTitle: data.selectedWorkTitle || "Selected Work",
    selectedWorkIds: Array.isArray(data.selectedWorkIds) ? data.selectedWorkIds : [],
    showSelectedWork: data.showSelectedWork !== false,
    selectedWorkHtml: "",
    alterEgoEnabled: data.alterEgoEnabled === true,
    alterEgoName: data.alterEgoName || "",
    alterEgoRole: data.alterEgoRole || "",
    alterEgoHeadline: data.alterEgoHeadline || "",
    alterEgoImage: data.alterEgoImage || "",
    alterEgoBioHtml: data.alterEgoBioHtml || "",
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
  };
}

export default function MemberEditorPage({
  memberId,
}: {
  memberId?: string;
}) {
  const router = useRouter();
  const isNew = !memberId;
  const [form, setForm] = useState<MemberFormState>(emptyMember());
  const [areasText, setAreasText] = useState("");
  const [availableNotes, setAvailableNotes] = useState<FieldNote[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/entries?all=true")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAvailableNotes(data.filter((e: FieldNote) => e.published));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!memberId) return;
    fetch(`/api/members/${memberId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
          return;
        }
        const next = formFromMember(data);
        setForm(next);
        setAreasText((next.areas || []).join("\n"));
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
          <Field label="URL Slug" hint="Slug “el” also serves /el">
            <input
              type="text"
              value={form.slug}
              onChange={(e) => patch({ slug: e.target.value })}
              className="admin-input"
              placeholder="el"
            />
          </Field>
        </div>

        <Field label="Role / Eyebrow">
          <textarea
            value={form.role}
            onChange={(e) => patch({ role: e.target.value })}
            rows={2}
            className="admin-input"
            placeholder="Artist · Founder · Imagineer"
          />
        </Field>

        <Field label="Headline" hint="Italic line under the name">
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
            <span className="text-malamaya text-xs">Primary preview</span>
          </div>
        )}

        <Field label="Bio Section Title">
          <input
            type="text"
            value={form.bioTitle}
            onChange={(e) => patch({ bioTitle: e.target.value })}
            className="admin-input"
          />
        </Field>
        <label className="flex items-center gap-3 text-sm text-malamaya-light">
          <input
            type="checkbox"
            checked={form.showBioCard}
            onChange={(e) => patch({ showBioCard: e.target.checked })}
            className="accent-maiba-red"
          />
          Show Bio card on public page
        </label>
        {form.showBioCard && (
          <Field label="Bio">
            <RichTextEditor
              content={form.bioHtml}
              onChange={(html) => patch({ bioHtml: html })}
              placeholder="Member bio..."
            />
          </Field>
        )}

        <Field label="Disciplines Section Title">
          <input
            type="text"
            value={form.areasTitle}
            onChange={(e) => patch({ areasTitle: e.target.value })}
            className="admin-input"
          />
        </Field>
        <label className="flex items-center gap-3 text-sm text-malamaya-light">
          <input
            type="checkbox"
            checked={form.showAreasCard}
            onChange={(e) => patch({ showAreasCard: e.target.checked })}
            className="accent-maiba-red"
          />
          Show Disciplines card on public page
        </label>
        {form.showAreasCard && (
          <Field label="Disciplines" hint="One per line">
            <textarea
              value={areasText}
              onChange={(e) => setAreasText(e.target.value)}
              rows={6}
              className="admin-input"
            />
          </Field>
        )}

        <Field label="Selected Work Title">
          <input
            type="text"
            value={form.selectedWorkTitle}
            onChange={(e) => patch({ selectedWorkTitle: e.target.value })}
            className="admin-input"
          />
        </Field>
        <label className="flex items-center gap-3 text-sm text-malamaya-light">
          <input
            type="checkbox"
            checked={form.showSelectedWork}
            onChange={(e) => patch({ showSelectedWork: e.target.checked })}
            className="accent-maiba-red"
          />
          Show Selected Work carousel on public page
        </label>
        {form.showSelectedWork && (
          <div className="border border-malamaya-border/20 rounded-sm p-4 space-y-4">
            <p className="text-xs tracking-widest uppercase text-malamaya-light">
              Field Notes Carousel
            </p>
            <p className="text-malamaya-border text-xs">
              Choose published field notes and arrange their order. Notes hidden from the homepage can still be selected here.
            </p>

            <Field label="Add field note">
              <select
                className="admin-input"
                value=""
                onChange={(e) => {
                  const id = e.target.value;
                  if (!id || form.selectedWorkIds.includes(id)) return;
                  patch({ selectedWorkIds: [...form.selectedWorkIds, id] });
                }}
              >
                <option value="">Select a published note…</option>
                {availableNotes
                  .filter((n) => !form.selectedWorkIds.includes(n.id))
                  .map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.title}
                      {n.hideFromHome ? " (hidden from home)" : ""}
                    </option>
                  ))}
              </select>
            </Field>

            <div className="space-y-2">
              {form.selectedWorkIds.map((id, index) => {
                const note = availableNotes.find((n) => n.id === id);
                return (
                  <div
                    key={id}
                    className="flex items-center gap-2 border border-malamaya-border/20 rounded-sm px-3 py-2 min-w-0"
                  >
                    <span className="text-xs text-malamaya-border w-5 flex-shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-sm text-foreground truncate flex-1 min-w-0">
                      {note?.title || id}
                    </span>
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => {
                        const next = [...form.selectedWorkIds];
                        const [item] = next.splice(index, 1);
                        next.splice(index - 1, 0, item);
                        patch({ selectedWorkIds: next });
                      }}
                      className="w-7 h-7 flex items-center justify-center text-malamaya hover:text-foreground disabled:opacity-20"
                      title="Move up"
                    >
                      <ChevronUp className="w-3.5 h-3.5" strokeWidth={2} />
                    </button>
                    <button
                      type="button"
                      disabled={index === form.selectedWorkIds.length - 1}
                      onClick={() => {
                        const next = [...form.selectedWorkIds];
                        const [item] = next.splice(index, 1);
                        next.splice(index + 1, 0, item);
                        patch({ selectedWorkIds: next });
                      }}
                      className="w-7 h-7 flex items-center justify-center text-malamaya hover:text-foreground disabled:opacity-20"
                      title="Move down"
                    >
                      <ChevronDown className="w-3.5 h-3.5" strokeWidth={2} />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        patch({
                          selectedWorkIds: form.selectedWorkIds.filter((x) => x !== id),
                        })
                      }
                      className="text-[10px] tracking-widest uppercase text-maiba-red/60 hover:text-maiba-red px-2"
                    >
                      Remove
                    </button>
                  </div>
                );
              })}
              {form.selectedWorkIds.length === 0 && (
                <p className="text-malamaya-border text-sm">No notes selected yet.</p>
              )}
            </div>
          </div>
        )}

        <div className="border border-malamaya-border/20 rounded-sm p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-xs tracking-widest uppercase text-malamaya-light">
              Alter Ego Toggle
            </p>
            <label className="flex items-center gap-3 text-sm text-malamaya-light">
              <input
                type="checkbox"
                checked={form.alterEgoEnabled}
                onChange={(e) => patch({ alterEgoEnabled: e.target.checked })}
                className="accent-maiba-red"
              />
              Enable photo / name / bio toggle
            </label>
          </div>
          <p className="text-malamaya-border text-xs">
            Visitors click the portrait to switch between primary and alter ego content.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Alter Ego Name">
              <input
                type="text"
                value={form.alterEgoName}
                onChange={(e) => patch({ alterEgoName: e.target.value })}
                className="admin-input"
                placeholder="Gamotwox"
              />
            </Field>
            <Field label="Alter Ego Role">
              <input
                type="text"
                value={form.alterEgoRole}
                onChange={(e) => patch({ alterEgoRole: e.target.value })}
                className="admin-input"
                placeholder="The Seeker · Moth Cultist"
              />
            </Field>
          </div>

          <Field label="Alter Ego Headline">
            <textarea
              value={form.alterEgoHeadline}
              onChange={(e) => patch({ alterEgoHeadline: e.target.value })}
              rows={3}
              className="admin-input"
            />
          </Field>

          <Field label="Alter Ego Portrait URL">
            <input
              type="text"
              value={form.alterEgoImage}
              onChange={(e) => patch({ alterEgoImage: e.target.value })}
              className="admin-input"
              placeholder="/images/alter-ego-placeholder.png"
            />
          </Field>
          {form.alterEgoImage && (
            <div className="flex items-center gap-4">
              <Image
                src={form.alterEgoImage}
                alt="Alter ego preview"
                width={64}
                height={64}
                unoptimized={form.alterEgoImage.startsWith("http")}
                className="w-16 h-16 rounded-full object-cover border border-malamaya-border/30"
              />
              <span className="text-malamaya text-xs">Alter ego preview</span>
            </div>
          )}

          <Field label="Alter Ego Bio">
            <RichTextEditor
              content={form.alterEgoBioHtml}
              onChange={(html) => patch({ alterEgoBioHtml: html })}
              placeholder="Alter ego bio..."
            />
          </Field>
        </div>

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
