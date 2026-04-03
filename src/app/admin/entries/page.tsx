"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import EntryForm from "@/components/admin/EntryForm";
import type { FieldNote } from "@/lib/data";

export const dynamic = "force-dynamic";

const tagColors: Record<string, string> = {
  drawing: "text-amber-400 border-amber-400/30",
  log: "text-emerald-400 border-emerald-400/30",
  code: "text-sky-400 border-sky-400/30",
  vision: "text-maiba-red border-maiba-red/30",
  shadow: "text-purple-400 border-purple-400/30",
};

export default function EntriesPage() {
  const [entries, setEntries] = useState<FieldNote[]>([]);
  const [editing, setEditing] = useState<FieldNote | null>(null);
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadEntries = async () => {
    const res = await fetch(`/api/entries?all=true&_t=${Date.now()}`, {
      credentials: "include",
      cache: "no-store",
    });
    const data = await res.json();
    setEntries(data);
    setLoading(false);
  };

  useEffect(() => {
    loadEntries();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this entry permanently?")) return;
    await fetch(`/api/entries/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    loadEntries();
  };

  const handleTogglePublish = async (id: string, currentlyPublished: boolean) => {
    const newState = !currentlyPublished;
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, published: newState } : e))
    );
    try {
      const res = await fetch(`/api/entries/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: newState }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Failed to update publish state");
        setEntries((prev) =>
          prev.map((e) => (e.id === id ? { ...e, published: currentlyPublished } : e))
        );
        return;
      }
    } catch {
      alert("Connection failed");
      setEntries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, published: currentlyPublished } : e))
      );
      return;
    }
    loadEntries();
  };

  const handleSaved = () => {
    setEditing(null);
    setCreating(false);
    loadEntries();
  };

  if (editing || creating) {
    return (
      <AdminShell>
        <div className="mb-6">
          <button
            onClick={() => {
              setEditing(null);
              setCreating(false);
            }}
            className="text-malamaya text-sm hover:text-foreground transition-colors"
          >
            ← Back to entries
          </button>
        </div>
        <EntryForm entry={editing} onSaved={handleSaved} />
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl text-foreground">
            Field Notes
          </h1>
          <p className="text-malamaya text-sm mt-1">
            {entries.length} entries
          </p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="bg-maiba-red/10 border border-maiba-red/30 text-maiba-red px-5 py-2.5 rounded-sm hover:bg-maiba-red/20 transition-colors text-sm tracking-widest uppercase self-start sm:self-auto"
        >
          + New Entry
        </button>
      </div>

      {loading ? (
        <p className="text-malamaya text-sm">Loading...</p>
      ) : entries.length === 0 ? (
        <p className="text-malamaya text-sm">No entries yet.</p>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="border border-malamaya-border/20 rounded-sm p-4 sm:p-5 hover:border-malamaya-border/40 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                    <span
                      className={`text-[10px] tracking-widest uppercase px-2 py-0.5 border rounded-sm ${tagColors[entry.tag] || "text-malamaya border-malamaya-border"}`}
                    >
                      {entry.tag}
                    </span>
                    <span className="text-malamaya-border text-xs">
                      {entry.date}
                    </span>
                    {!entry.published && (
                      <span className="text-[10px] tracking-widest uppercase text-amber-500 border border-amber-500/30 px-2 py-0.5 rounded-sm">
                        Draft
                      </span>
                    )}
                  </div>
                  <h3 className="text-foreground font-display text-base sm:text-lg truncate">
                    {entry.title}
                  </h3>
                  <p className="text-malamaya text-sm mt-1 line-clamp-2 sm:truncate">
                    {entry.excerpt}
                  </p>
                  {entry.seoTags && entry.seoTags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {entry.seoTags.map((t, i) => (
                        <span key={i} className="text-[10px] text-maiba-red/70 border border-maiba-red/15 px-1.5 py-0.5 rounded-sm">
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleTogglePublish(entry.id, entry.published)}
                    className="text-xs px-3 py-1.5 border border-malamaya-border/30 rounded-sm text-malamaya hover:text-foreground hover:border-malamaya transition-colors"
                  >
                    {entry.published ? "Unpublish" : "Publish"}
                  </button>
                  <button
                    onClick={() => setEditing(entry)}
                    className="text-xs px-3 py-1.5 border border-malamaya-border/30 rounded-sm text-malamaya hover:text-foreground hover:border-malamaya transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="text-xs px-3 py-1.5 border border-maiba-red/20 rounded-sm text-maiba-red/60 hover:text-maiba-red hover:border-maiba-red/40 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
