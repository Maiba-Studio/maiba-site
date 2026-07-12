"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import type { Project, ProjectsPageContent } from "@/lib/data";

export default function ProjectsAdminPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [page, setPage] = useState<ProjectsPageContent>({
    title: "Projects",
    subtitle: "",
  });
  const [loading, setLoading] = useState(true);
  const [savingPage, setSavingPage] = useState(false);
  const [pageSaved, setPageSaved] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/projects?all=true").then((r) => r.json()),
      fetch("/api/projects/page").then((r) => r.json()),
    ])
      .then(([list, meta]) => {
        if (Array.isArray(list)) setProjects(list);
        else setError(list.error || "Failed to load projects");
        if (meta && !meta.error) setPage(meta);
      })
      .catch(() => setError("Failed to load"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const savePage = async (e: FormEvent) => {
    e.preventDefault();
    setSavingPage(true);
    setPageSaved(false);
    try {
      const res = await fetch("/api/projects/page", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(page),
      });
      if (res.ok) {
        setPageSaved(true);
        setTimeout(() => setPageSaved(false), 3000);
      }
    } finally {
      setSavingPage(false);
    }
  };

  const remove = async (id: string, title: string) => {
    if (!confirm(`Delete project “${title}”?`)) return;
    const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
    if (res.ok) setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  const move = async (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= projects.length) return;
    const next = [...projects];
    const [item] = next.splice(index, 1);
    next.splice(nextIndex, 0, item);
    const withOrder = next.map((p, i) => ({ ...p, sortOrder: i }));
    setProjects(withOrder);

    await Promise.all(
      withOrder.map((p) =>
        fetch(`/api/projects/${p.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sortOrder: p.sortOrder }),
        })
      )
    );
  };

  return (
    <AdminShell>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-foreground">Projects</h1>
          <p className="text-malamaya text-sm mt-1">
            Gallery on /projects and detail pages at /projects/your-slug.
          </p>
        </div>
        <Link
          href="/admin/projects/new"
          className="bg-maiba-red/10 border border-maiba-red/30 text-maiba-red px-5 py-2.5 rounded-sm hover:bg-maiba-red/20 transition-colors text-xs tracking-widest uppercase text-center"
        >
          + New Project
        </Link>
      </div>

      <form
        onSubmit={savePage}
        className="mb-10 border border-malamaya-border/20 rounded-sm p-4 sm:p-5 space-y-4 max-w-2xl"
      >
        <p className="text-xs tracking-widest uppercase text-malamaya-light">
          Projects Page Header
        </p>
        <div>
          <label className="text-xs tracking-widest uppercase text-malamaya mb-2 block">
            Title
          </label>
          <input
            type="text"
            value={page.title}
            onChange={(e) => setPage({ ...page, title: e.target.value })}
            className="admin-input"
          />
        </div>
        <div>
          <label className="text-xs tracking-widest uppercase text-malamaya mb-2 block">
            Subtitle
          </label>
          <textarea
            value={page.subtitle}
            onChange={(e) => setPage({ ...page, subtitle: e.target.value })}
            rows={3}
            className="admin-input"
          />
        </div>
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={savingPage}
            className="bg-maiba-red/10 border border-maiba-red/30 text-maiba-red px-5 py-2.5 rounded-sm hover:bg-maiba-red/20 transition-colors text-xs tracking-widest uppercase disabled:opacity-50"
          >
            {savingPage ? "Saving..." : "Save Page Header"}
          </button>
          {pageSaved && <span className="text-emerald-400 text-sm">Saved!</span>}
        </div>
      </form>

      {loading && <p className="text-malamaya text-sm">Loading...</p>}
      {error && <p className="text-maiba-red text-sm">{error}</p>}

      {!loading && !error && (
        <div className="space-y-3">
          {projects.map((project, index) => (
            <div
              key={project.id}
              className="border border-malamaya-border/20 rounded-sm p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 min-w-0"
            >
              {project.thumbnail ? (
                <Image
                  src={project.thumbnail}
                  alt=""
                  width={72}
                  height={54}
                  unoptimized={project.thumbnail.startsWith("http")}
                  className="w-18 h-14 object-cover rounded-sm border border-malamaya-border/20 flex-shrink-0"
                />
              ) : (
                <div className="w-18 h-14 rounded-sm bg-malamaya-border/20 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-display text-xl text-foreground truncate">
                  {project.title}
                </p>
                <p className="text-malamaya text-xs mt-1 line-clamp-2">
                  {project.excerpt}
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span
                    className={`text-[10px] tracking-widest uppercase px-2 py-0.5 rounded-sm border ${
                      project.published
                        ? "border-emerald-400/30 text-emerald-400"
                        : "border-malamaya-border text-malamaya"
                    }`}
                  >
                    {project.published ? "Published" : "Draft"}
                  </span>
                  <span className="text-[10px] tracking-widest uppercase text-malamaya-border">
                    /projects/{project.slug}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  className="w-8 h-8 flex items-center justify-center text-malamaya hover:text-foreground disabled:opacity-20"
                  title="Move up"
                >
                  <ChevronUp className="w-4 h-4" strokeWidth={1.5} />
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === projects.length - 1}
                  className="w-8 h-8 flex items-center justify-center text-malamaya hover:text-foreground disabled:opacity-20"
                  title="Move down"
                >
                  <ChevronDown className="w-4 h-4" strokeWidth={1.5} />
                </button>
                <a
                  href={`/projects/${project.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs tracking-widest uppercase text-malamaya hover:text-foreground transition-colors px-3 py-2"
                >
                  View
                </a>
                <Link
                  href={`/admin/projects/${project.id}`}
                  className="text-xs tracking-widest uppercase text-maiba-red hover:text-maiba-red/80 transition-colors px-3 py-2"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => remove(project.id, project.title)}
                  className="text-xs tracking-widest uppercase text-maiba-red/50 hover:text-maiba-red transition-colors px-3 py-2"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}

          {projects.length === 0 && (
            <p className="text-malamaya text-sm">No projects yet.</p>
          )}
        </div>
      )}
    </AdminShell>
  );
}
