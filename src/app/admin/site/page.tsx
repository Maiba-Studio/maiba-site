"use client";

import { useEffect, useState, FormEvent } from "react";
import AdminShell from "@/components/admin/AdminShell";
import type { SiteContent, SocialLink, LampWord } from "@/lib/data";

type Tab = "hero" | "about" | "contact" | "ritual" | "lamp";

const defaultRitual: SiteContent["ritual"] = {
  title: ":: Maiba Manifesto ::",
  lines: [
    "We are the moths who chose the flame.",
    "Not because we are blind,",
    "but because we refuse to live in the dark.",
    "",
    "Every deviation is an act of devotion.",
    "Every creation is a prayer we refuse to whisper.",
    "",
    "We build what the world did not ask for.",
    "We make what we would regret not making.",
    "We follow the light—not because it is safe,",
    "but because it is ours.",
    "",
    "This is the Maiba way.",
    "Deviant. Sacred. Unfinished.",
    "",
    "Burn bright.",
    "Be moth.",
    "Seek light.",
  ],
  accentLines: ["Burn bright.", "Be moth.", "Seek light."],
  highlightLines: ["This is the Maiba way."],
  closingAttribution: "— Fragment I · Written in the dark",
};

export default function SiteContentPage() {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("hero");

  // Lamp words state
  const [lampWords, setLampWords] = useState<LampWord[]>([]);
  const [newWord, setNewWord] = useState("");
  const [newLink, setNewLink] = useState("");
  const [lampMsg, setLampMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [lampSaving, setLampSaving] = useState(false);

  useEffect(() => {
    fetch("/api/site-content")
      .then((r) => r.json())
      .then((data: Partial<SiteContent>) => {
        setContent({
          ...data,
          about: {
            ...data.about!,
            founderImage: data.about?.founderImage ?? "",
            alterEgoImage: data.about?.alterEgoImage ?? "",
          },
          contact: {
            ...data.contact!,
            socialLinks: (data.contact?.socialLinks ?? []).map((l) => ({
              ...l,
              icon: (l as SocialLink).icon ?? "",
            })),
          },
          ritual: data.ritual ?? defaultRitual,
        } as SiteContent);
      });

    fetch("/api/lamp-words")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setLampWords(data);
      })
      .catch(() => {});
  }, []);

  const addLampWord = async (e: FormEvent) => {
    e.preventDefault();
    if (!newWord.trim() || !newLink.trim()) return;
    setLampSaving(true);
    setLampMsg(null);
    try {
      const res = await fetch("/api/lamp-words", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: newWord.trim(), link: newLink.trim() }),
      });
      if (res.ok) {
        const entry = await res.json();
        setLampWords([...lampWords, entry]);
        setNewWord("");
        setNewLink("");
        setLampMsg({ type: "ok", text: "Lamp word added." });
        setTimeout(() => setLampMsg(null), 3000);
      }
    } catch {
      setLampMsg({ type: "err", text: "Failed to add." });
    } finally {
      setLampSaving(false);
    }
  };

  const deleteLampWord = async (id: string) => {
    const res = await fetch(`/api/lamp-words/${id}`, { method: "DELETE" });
    if (res.ok) setLampWords(lampWords.filter((w) => w.id !== id));
  };

  const updateLampWordField = async (
    id: string,
    field: "word" | "link",
    value: string
  ) => {
    setLampWords(lampWords.map((w) => (w.id === id ? { ...w, [field]: value } : w)));
  };

  const saveLampWord = async (lw: LampWord) => {
    await fetch(`/api/lamp-words/${lw.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ word: lw.word, link: lw.link }),
    });
  };

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

  const tabs: { id: Tab; label: string }[] = [
    { id: "hero", label: "Hero" },
    { id: "about", label: "About" },
    { id: "contact", label: "Contact" },
    { id: "ritual", label: "Ritual" },
    { id: "lamp", label: "Lamp" },
  ];

  const updateAbout = (patch: Partial<SiteContent["about"]>) =>
    setContent({ ...content, about: { ...content.about, ...patch } });

  const updateSocialLink = (index: number, patch: Partial<SocialLink>) => {
    const links = [...content.contact.socialLinks];
    links[index] = { ...links[index], ...patch };
    setContent({
      ...content,
      contact: { ...content.contact, socialLinks: links },
    });
  };

  const addSocialLink = () => {
    setContent({
      ...content,
      contact: {
        ...content.contact,
        socialLinks: [
          ...content.contact.socialLinks,
          { label: "", href: "", icon: "" },
        ],
      },
    });
  };

  const removeSocialLink = (index: number) => {
    setContent({
      ...content,
      contact: {
        ...content.contact,
        socialLinks: content.contact.socialLinks.filter((_, i) => i !== index),
      },
    });
  };

  return (
    <AdminShell>
      <div className="mb-8">
        <h1 className="font-display text-3xl text-foreground">Site Content</h1>
        <p className="text-malamaya text-sm mt-1">
          Edit text and details across the site.
        </p>
      </div>

      <div className="flex gap-1 mb-8 border-b border-malamaya-border/20 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 sm:px-5 py-3 text-xs sm:text-sm tracking-widest uppercase transition-colors border-b-2 -mb-px whitespace-nowrap ${
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
        {/* ── Hero ── */}
        {activeTab === "hero" && (
          <>
            <Field label="Title">
              <input type="text" value={content.hero.title} onChange={(e) => setContent({ ...content, hero: { ...content.hero, title: e.target.value } })} className="admin-input" />
            </Field>
            <Field label="Tagline">
              <input type="text" value={content.hero.tagline} onChange={(e) => setContent({ ...content, hero: { ...content.hero, tagline: e.target.value } })} className="admin-input" />
            </Field>
            <Field label="Hover Text">
              <input type="text" value={content.hero.hoverText} onChange={(e) => setContent({ ...content, hero: { ...content.hero, hoverText: e.target.value } })} className="admin-input" />
            </Field>
            <Field label="Scroll Cue Text">
              <input type="text" value={content.hero.scrollCue} onChange={(e) => setContent({ ...content, hero: { ...content.hero, scrollCue: e.target.value } })} className="admin-input" />
            </Field>
          </>
        )}

        {/* ── About ── */}
        {activeTab === "about" && (
          <>
            <Field label="Origin Section Title">
              <input type="text" value={content.about.originTitle} onChange={(e) => updateAbout({ originTitle: e.target.value })} className="admin-input" />
            </Field>
            <Field label="Origin Lines" hint="One line per paragraph">
              <textarea value={content.about.originLines.join("\n")} onChange={(e) => updateAbout({ originLines: e.target.value.split("\n") })} rows={4} className="admin-input resize-y" />
            </Field>
            <Field label="Eye Section Paragraphs" hint="One per line">
              <textarea value={content.about.eyeParagraphs.join("\n")} onChange={(e) => updateAbout({ eyeParagraphs: e.target.value.split("\n") })} rows={6} className="admin-input resize-y" />
            </Field>

            {/* Founder */}
            <div className="border border-malamaya-border/20 rounded-sm p-5 space-y-4">
              <p className="text-xs tracking-widest uppercase text-malamaya-light">Founder</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Name">
                  <input type="text" value={content.about.founderName} onChange={(e) => updateAbout({ founderName: e.target.value })} className="admin-input" />
                </Field>
                <Field label="Role">
                  <input type="text" value={content.about.founderRole} onChange={(e) => updateAbout({ founderRole: e.target.value })} className="admin-input" />
                </Field>
              </div>
              <Field label="Profile Picture URL">
                <input type="url" value={content.about.founderImage} onChange={(e) => updateAbout({ founderImage: e.target.value })} className="admin-input" placeholder="https://..." />
              </Field>
              {content.about.founderImage && (
                <div className="flex items-center gap-4">
                  <img src={content.about.founderImage} alt="Founder preview" className="w-16 h-16 rounded-full object-cover border border-malamaya-border/30" />
                  <span className="text-malamaya text-xs">Preview</span>
                </div>
              )}
            </div>

            {/* Alter Ego */}
            <div className="border border-malamaya-border/20 rounded-sm p-5 space-y-4">
              <p className="text-xs tracking-widest uppercase text-malamaya-light">Alter Ego</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Name">
                  <input type="text" value={content.about.alterEgoName} onChange={(e) => updateAbout({ alterEgoName: e.target.value })} className="admin-input" />
                </Field>
                <Field label="Role">
                  <input type="text" value={content.about.alterEgoRole} onChange={(e) => updateAbout({ alterEgoRole: e.target.value })} className="admin-input" />
                </Field>
              </div>
              <Field label="Profile Picture URL">
                <input type="url" value={content.about.alterEgoImage} onChange={(e) => updateAbout({ alterEgoImage: e.target.value })} className="admin-input" placeholder="https://..." />
              </Field>
              {content.about.alterEgoImage && (
                <div className="flex items-center gap-4">
                  <img src={content.about.alterEgoImage} alt="Alter ego preview" className="w-16 h-16 rounded-full object-cover border border-malamaya-border/30" />
                  <span className="text-malamaya text-xs">Preview</span>
                </div>
              )}
            </div>

            <Field label="Founder Bio Paragraphs" hint="One per line">
              <textarea value={content.about.founderParagraphs.join("\n")} onChange={(e) => updateAbout({ founderParagraphs: e.target.value.split("\n") })} rows={4} className="admin-input resize-y" />
            </Field>
            <Field label="Ethos List" hint="One per line">
              <textarea value={content.about.ethosList.join("\n")} onChange={(e) => updateAbout({ ethosList: e.target.value.split("\n") })} rows={5} className="admin-input resize-y" />
            </Field>
          </>
        )}

        {/* ── Contact ── */}
        {activeTab === "contact" && (
          <>
            <Field label="Section Title">
              <input type="text" value={content.contact.title} onChange={(e) => setContent({ ...content, contact: { ...content.contact, title: e.target.value } })} className="admin-input" />
            </Field>
            <Field label="Subtitle">
              <textarea value={content.contact.subtitle} onChange={(e) => setContent({ ...content, contact: { ...content.contact, subtitle: e.target.value } })} rows={3} className="admin-input resize-none" />
            </Field>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs tracking-widest uppercase text-malamaya">
                  Social Links
                </label>
                <button
                  type="button"
                  onClick={addSocialLink}
                  className="text-xs text-maiba-red hover:text-maiba-red/80 transition-colors tracking-widest uppercase"
                >
                  + Add Link
                </button>
              </div>

              <div className="space-y-3">
                {content.contact.socialLinks.map((link, i) => (
                  <div key={i} className="border border-malamaya-border/20 rounded-sm p-4 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <Field label="Label">
                        <input type="text" value={link.label} onChange={(e) => updateSocialLink(i, { label: e.target.value })} className="admin-input" placeholder="Twitter" />
                      </Field>
                      <Field label="URL">
                        <input type="text" value={link.href} onChange={(e) => updateSocialLink(i, { href: e.target.value })} className="admin-input" placeholder="https://..." />
                      </Field>
                      <Field label="Icon URL" hint="optional thumbnail">
                        <input type="text" value={link.icon} onChange={(e) => updateSocialLink(i, { icon: e.target.value })} className="admin-input" placeholder="https://icon..." />
                      </Field>
                    </div>
                    <div className="flex items-center justify-between">
                      {link.icon && (
                        <img src={link.icon} alt="" className="w-5 h-5 rounded-sm object-contain" />
                      )}
                      <button
                        type="button"
                        onClick={() => removeSocialLink(i)}
                        className="text-[10px] text-maiba-red/60 hover:text-maiba-red tracking-widest uppercase transition-colors ml-auto"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── Ritual ── */}
        {activeTab === "ritual" && (
          <>
            <Field label="Manifesto Title">
              <input type="text" value={content.ritual.title} onChange={(e) => setContent({ ...content, ritual: { ...content.ritual, title: e.target.value } })} className="admin-input" />
            </Field>
            <Field label="Manifesto Lines" hint="One line per row. Empty lines create spacing.">
              <textarea
                value={content.ritual.lines.join("\n")}
                onChange={(e) => setContent({ ...content, ritual: { ...content.ritual, lines: e.target.value.split("\n") } })}
                rows={18}
                className="admin-input resize-y font-mono text-sm"
              />
            </Field>
            <Field label="Accent Lines" hint="Lines rendered bold + red. One per row, must match a manifesto line exactly.">
              <textarea
                value={content.ritual.accentLines.join("\n")}
                onChange={(e) => setContent({ ...content, ritual: { ...content.ritual, accentLines: e.target.value.split("\n").filter((l) => l.trim()) } })}
                rows={4}
                className="admin-input resize-y font-mono text-sm"
              />
            </Field>
            <Field label="Highlight Lines" hint="Lines rendered in white (foreground). One per row.">
              <textarea
                value={content.ritual.highlightLines.join("\n")}
                onChange={(e) => setContent({ ...content, ritual: { ...content.ritual, highlightLines: e.target.value.split("\n").filter((l) => l.trim()) } })}
                rows={3}
                className="admin-input resize-y font-mono text-sm"
              />
            </Field>
            <Field label="Closing Attribution">
              <input type="text" value={content.ritual.closingAttribution} onChange={(e) => setContent({ ...content, ritual: { ...content.ritual, closingAttribution: e.target.value } })} className="admin-input font-mono text-sm" />
            </Field>
          </>
        )}

        {/* ── Save (for hero/about/contact/ritual) ── */}
        {activeTab !== "lamp" && (
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
        )}
      </form>

      {/* ── Lamp Words (outside form — has its own save logic) ── */}
      {activeTab === "lamp" && (
        <div className="max-w-2xl space-y-6">
          <p className="text-malamaya text-sm">
            Add secret words for the Lamp. When a visitor types a matching word, they will be redirected to the linked URL instead of getting a random quote.
          </p>
          <p className="text-malamaya-border text-xs">
            The original admin password (from environment) still works as before and leads to the admin login.
          </p>

          {/* Add new */}
          <form onSubmit={addLampWord} className="border border-malamaya-border/20 rounded-sm p-5 space-y-4">
            <p className="text-xs tracking-widest uppercase text-malamaya-light">
              Add New Lamp Word
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Secret Word">
                <input
                  type="text"
                  value={newWord}
                  onChange={(e) => setNewWord(e.target.value)}
                  className="admin-input"
                  placeholder="The passphrase..."
                />
              </Field>
              <Field label="Redirect Link">
                <input
                  type="text"
                  value={newLink}
                  onChange={(e) => setNewLink(e.target.value)}
                  className="admin-input"
                  placeholder="https://... or /path"
                />
              </Field>
            </div>

            {lampMsg && (
              <p className={`text-sm ${lampMsg.type === "ok" ? "text-emerald-400" : "text-maiba-red"}`}>
                {lampMsg.text}
              </p>
            )}

            <button
              type="submit"
              disabled={lampSaving}
              className="bg-maiba-red/10 border border-maiba-red/30 text-maiba-red px-6 py-3 rounded-sm hover:bg-maiba-red/20 transition-colors text-sm tracking-widest uppercase disabled:opacity-50"
            >
              {lampSaving ? "Adding..." : "+ Add Word"}
            </button>
          </form>

          {/* List existing */}
          {lampWords.length > 0 && (
            <div>
              <p className="text-xs tracking-widest uppercase text-malamaya-light mb-3">
                Active Lamp Words ({lampWords.length})
              </p>
              <div className="space-y-2">
                {lampWords.map((lw) => (
                  <div
                    key={lw.id}
                    className="border border-malamaya-border/20 rounded-sm p-4"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                      <Field label="Word">
                        <input
                          type="text"
                          value={lw.word}
                          onChange={(e) =>
                            updateLampWordField(lw.id, "word", e.target.value)
                          }
                          onBlur={() => saveLampWord(lw)}
                          className="admin-input"
                        />
                      </Field>
                      <Field label="Link">
                        <input
                          type="text"
                          value={lw.link}
                          onChange={(e) =>
                            updateLampWordField(lw.id, "link", e.target.value)
                          }
                          onBlur={() => saveLampWord(lw)}
                          className="admin-input"
                        />
                      </Field>
                    </div>
                    <button
                      onClick={() => deleteLampWord(lw.id)}
                      className="text-[10px] text-maiba-red/60 hover:text-maiba-red tracking-widest uppercase transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
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
