"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import type { StudioMember } from "@/lib/data";

export default function MembersAdminPage() {
  const [members, setMembers] = useState<StudioMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    fetch("/api/members?all=true")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setMembers(data);
        else setError(data.error || "Failed to load");
      })
      .catch(() => setError("Failed to load"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id: string, name: string) => {
    if (!confirm(`Delete member page for ${name}?`)) return;
    const res = await fetch(`/api/members/${id}`, { method: "DELETE" });
    if (res.ok) setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <AdminShell>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-foreground">Members</h1>
          <p className="text-malamaya text-sm mt-1">
            Profile pages for studio members (template used by /el and /members/…).
          </p>
        </div>
        <Link
          href="/admin/members/new"
          className="bg-maiba-red/10 border border-maiba-red/30 text-maiba-red px-5 py-2.5 rounded-sm hover:bg-maiba-red/20 transition-colors text-xs tracking-widest uppercase text-center"
        >
          + New Member
        </Link>
      </div>

      {loading && <p className="text-malamaya text-sm">Loading...</p>}
      {error && <p className="text-maiba-red text-sm">{error}</p>}

      {!loading && !error && (
        <div className="space-y-3">
          {members.map((member) => {
            const href = member.slug === "el" ? "/el" : `/members/${member.slug}`;
            return (
              <div
                key={member.id}
                className="border border-malamaya-border/20 rounded-sm p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 min-w-0"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-display text-xl text-foreground truncate">
                    {member.name}
                  </p>
                  <p className="text-malamaya text-xs mt-1 truncate">{member.role}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span
                      className={`text-[10px] tracking-widest uppercase px-2 py-0.5 rounded-sm border ${
                        member.published
                          ? "border-emerald-400/30 text-emerald-400"
                          : "border-malamaya-border text-malamaya"
                      }`}
                    >
                      {member.published ? "Published" : "Draft"}
                    </span>
                    <span className="text-[10px] tracking-widest uppercase text-malamaya-border">
                      {href}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs tracking-widest uppercase text-malamaya hover:text-foreground transition-colors px-3 py-2"
                  >
                    View
                  </a>
                  <Link
                    href={`/admin/members/${member.id}`}
                    className="text-xs tracking-widest uppercase text-maiba-red hover:text-maiba-red/80 transition-colors px-3 py-2"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => remove(member.id, member.name)}
                    className="text-xs tracking-widest uppercase text-maiba-red/50 hover:text-maiba-red transition-colors px-3 py-2"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}

          {members.length === 0 && (
            <p className="text-malamaya text-sm">No member pages yet.</p>
          )}
        </div>
      )}
    </AdminShell>
  );
}
