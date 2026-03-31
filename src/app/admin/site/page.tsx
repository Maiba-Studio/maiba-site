"use client";

import { useEffect, useState, FormEvent } from "react";
import AdminShell from "@/components/admin/AdminShell";
import type { SiteContent } from "@/lib/data";

export default function SiteContentPage() {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<"hero" | "about" | "contact">(
    "hero"
  );

  useEffect(() => {
    fetch("/api/site-content")
      .then((r) => r.json())
      .then(setContent);
  }, []);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!content) return;
    setSaving(true);
    setSaved(false);

    await fetch("/api/site-content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(content),
    });

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (!content) {
    return (
      <AdminShell>
        <p className="text-malamaya text-sm">Loading...</p>
      </AdminShell>
    );
  }

  const tabs = [
    { id: "hero" as const, label: "Hero" },
    { id: "about" as const, label: "About" },
    { id: "contact" as const, label: "Contact" },
  ];

  return (
    <AdminShell>
      <div className="mb-8">
        <h1 className="font-display text-3xl text-foreground">Site Content</h1>
        <p className="text-malamaya text-sm mt-1">
          Edit text and details across the site.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 border-b border-malamaya-border/20">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-3 text-sm tracking-widest uppercase transition-colors border-b-2 -mb-px ${
              activeTab === tab.id
                ? "border-maiba-red text-maiba-red"
                : "border-transparent text-malamaya hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSave} className="max-w-2xl space-y-6">
        {activeTab === "hero" && (
          <>
            <Field label="Title">
              <input
                type="text"
                value={content.hero.title}
                onChange={(e) =>
                  setContent({
                    ...content,
                    hero: { ...content.hero, title: e.target.value },
                  })
                }
                className="admin-input"
              />
            </Field>
            <Field label="Tagline">
              <input
                type="text"
                value={content.hero.tagline}
                onChange={(e) =>
                  setContent({
                    ...content,
                    hero: { ...content.hero, tagline: e.target.value },
                  })
                }
                className="admin-input"
              />
            </Field>
            <Field label="Hover Text">
              <input
                type="text"
                value={content.hero.hoverText}
                onChange={(e) =>
                  setContent({
                    ...content,
                    hero: { ...content.hero, hoverText: e.target.value },
                  })
                }
                className="admin-input"
              />
            </Field>
            <Field label="Scroll Cue Text">
              <input
                type="text"
                value={content.hero.scrollCue}
                onChange={(e) =>
                  setContent({
                    ...content,
                    hero: { ...content.hero, scrollCue: e.target.value },
                  })
                }
                className="admin-input"
              />
            </Field>
          </>
        )}

        {activeTab === "about" && (
          <>
            <Field label="Origin Section Title">
              <input
                type="text"
                value={content.about.originTitle}
                onChange={(e) =>
                  setContent({
                    ...content,
                    about: { ...content.about, originTitle: e.target.value },
                  })
                }
                className="admin-input"
              />
            </Field>
            <Field label="Origin Lines" hint="One line per paragraph">
              <textarea
                value={content.about.originLines.join("\n")}
                onChange={(e) =>
                  setContent({
                    ...content,
                    about: {
                      ...content.about,
                      originLines: e.target.value.split("\n"),
                    },
                  })
                }
                rows={4}
                className="admin-input resize-y"
              />
            </Field>
            <Field label="Eye Section Paragraphs" hint="One per line">
              <textarea
                value={content.about.eyeParagraphs.join("\n")}
                onChange={(e) =>
                  setContent({
                    ...content,
                    about: {
                      ...content.about,
                      eyeParagraphs: e.target.value.split("\n"),
                    },
                  })
                }
                rows={6}
                className="admin-input resize-y"
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Founder Name">
                <input
                  type="text"
                  value={content.about.founderName}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      about: {
                        ...content.about,
                        founderName: e.target.value,
                      },
                    })
                  }
                  className="admin-input"
                />
              </Field>
              <Field label="Alter Ego Name">
                <input
                  type="text"
                  value={content.about.alterEgoName}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      about: {
                        ...content.about,
                        alterEgoName: e.target.value,
                      },
                    })
                  }
                  className="admin-input"
                />
              </Field>
            </div>
            <Field label="Ethos List" hint="One per line">
              <textarea
                value={content.about.ethosList.join("\n")}
                onChange={(e) =>
                  setContent({
                    ...content,
                    about: {
                      ...content.about,
                      ethosList: e.target.value.split("\n"),
                    },
                  })
                }
                rows={5}
                className="admin-input resize-y"
              />
            </Field>
          </>
        )}

        {activeTab === "contact" && (
          <>
            <Field label="Section Title">
              <input
                type="text"
                value={content.contact.title}
                onChange={(e) =>
                  setContent({
                    ...content,
                    contact: { ...content.contact, title: e.target.value },
                  })
                }
                className="admin-input"
              />
            </Field>
            <Field label="Subtitle">
              <textarea
                value={content.contact.subtitle}
                onChange={(e) =>
                  setContent({
                    ...content,
                    contact: { ...content.contact, subtitle: e.target.value },
                  })
                }
                rows={3}
                className="admin-input resize-none"
              />
            </Field>
            <Field label="Social Links" hint="Format: Label|URL — one per line">
              <textarea
                value={content.contact.socialLinks
                  .map((l) => `${l.label}|${l.href}`)
                  .join("\n")}
                onChange={(e) =>
                  setContent({
                    ...content,
                    contact: {
                      ...content.contact,
                      socialLinks: e.target.value
                        .split("\n")
                        .filter((l) => l.trim())
                        .map((l) => {
                          const [label, href] = l.split("|");
                          return {
                            label: label?.trim() || "",
                            href: href?.trim() || "",
                          };
                        }),
                    },
                  })
                }
                rows={4}
                className="admin-input resize-none"
              />
            </Field>
          </>
        )}

        <div className="flex items-center gap-4 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-maiba-red/10 border border-maiba-red/30 text-maiba-red px-6 py-3 rounded-sm hover:bg-maiba-red/20 transition-colors text-sm tracking-widest uppercase disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          {saved && (
            <span className="text-emerald-400 text-sm">Saved!</span>
          )}
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
