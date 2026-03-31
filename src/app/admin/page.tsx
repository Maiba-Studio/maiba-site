"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";

interface Stats {
  totalEntries: number;
  publishedEntries: number;
  draftEntries: number;
  tags: Record<string, number>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/entries?all=true")
      .then((r) => r.json())
      .then((entries) => {
        const tags: Record<string, number> = {};
        let published = 0;
        let drafts = 0;
        for (const e of entries) {
          tags[e.tag] = (tags[e.tag] || 0) + 1;
          if (e.published) published++;
          else drafts++;
        }
        setStats({
          totalEntries: entries.length,
          publishedEntries: published,
          draftEntries: drafts,
          tags,
        });
      });
  }, []);

  return (
    <AdminShell>
      <div className="mb-8">
        <h1 className="font-display text-3xl text-foreground">Dashboard</h1>
        <p className="text-malamaya text-sm mt-2">
          Welcome back, keeper.
        </p>
      </div>

      {stats ? (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            <StatCard label="Total Entries" value={stats.totalEntries} />
            <StatCard
              label="Published"
              value={stats.publishedEntries}
              accent
            />
            <StatCard label="Drafts" value={stats.draftEntries} />
          </div>

          {/* Tags breakdown */}
          <div className="border border-malamaya-border/20 rounded-sm p-6">
            <h2 className="text-sm tracking-widest uppercase text-malamaya mb-4">
              Entries by Tag
            </h2>
            <div className="flex flex-wrap gap-3">
              {Object.entries(stats.tags).map(([tag, count]) => (
                <div
                  key={tag}
                  className="flex items-center gap-2 border border-malamaya-border/30 rounded-sm px-4 py-2"
                >
                  <span className="text-xs tracking-widest uppercase text-malamaya-light">
                    {tag}
                  </span>
                  <span className="text-foreground font-display text-lg">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div className="mt-8 flex gap-4">
            <a
              href="/admin/entries?new=true"
              className="bg-maiba-red/10 border border-maiba-red/30 text-maiba-red px-6 py-3 rounded-sm hover:bg-maiba-red/20 transition-colors text-sm tracking-widest uppercase"
            >
              + New Entry
            </a>
            <a
              href="/admin/site"
              className="border border-malamaya-border/30 text-malamaya px-6 py-3 rounded-sm hover:border-malamaya hover:text-foreground transition-colors text-sm tracking-widest uppercase"
            >
              Edit Site Content
            </a>
          </div>
        </>
      ) : (
        <div className="text-malamaya text-sm">Loading...</div>
      )}
    </AdminShell>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div className="border border-malamaya-border/20 rounded-sm p-6">
      <p className="text-xs tracking-widest uppercase text-malamaya mb-2">
        {label}
      </p>
      <p
        className={`font-display text-4xl ${accent ? "text-maiba-red" : "text-foreground"}`}
      >
        {value}
      </p>
    </div>
  );
}
