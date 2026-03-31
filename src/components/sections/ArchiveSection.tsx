"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

type Tag = "all" | "drawing" | "log" | "code" | "vision" | "shadow";

interface Entry {
  id: string;
  title: string;
  excerpt: string;
  tag: Exclude<Tag, "all">;
  date: string;
  thumbnail?: string;
}

const tagColors: Record<string, string> = {
  drawing: "text-amber-400 border-amber-400/30",
  log: "text-emerald-400 border-emerald-400/30",
  code: "text-sky-400 border-sky-400/30",
  vision: "text-maiba-red border-maiba-red/30",
  shadow: "text-purple-400 border-purple-400/30",
};

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.8, ease: "easeOut" as const },
};

export default function ArchiveSection() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [activeTag, setActiveTag] = useState<Tag>("all");

  useEffect(() => {
    fetch("/api/entries")
      .then((r) => r.json())
      .then(setEntries)
      .catch(() => {});
  }, []);

  const filtered =
    activeTag === "all"
      ? entries
      : entries.filter((e) => e.tag === activeTag);

  const tags: Tag[] = ["all", "drawing", "log", "code", "vision", "shadow"];

  return (
    <section id="archive" className="relative py-32">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px bg-gradient-to-r from-transparent via-malamaya-border to-transparent" />

      <div className="max-w-5xl mx-auto px-6">
        <motion.div {...fadeUp} className="mb-16">
          <h2 className="font-display text-4xl md:text-5xl mb-6">
            Field Notes
          </h2>
          <p className="font-accent italic text-malamaya-light text-lg max-w-lg">
            What doesn&apos;t make it into the work... becomes the work.
            <br />
            These are the scattered sparks. The light between things.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-wrap gap-3 mb-12"
        >
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`text-xs tracking-widest uppercase px-4 py-2 border rounded-sm transition-all duration-300 ${
                activeTag === tag
                  ? "border-maiba-red text-maiba-red bg-maiba-red/5"
                  : "border-malamaya-border text-malamaya hover:border-malamaya hover:text-foreground"
              }`}
            >
              {tag}
            </button>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-malamaya-border/30">
          {filtered.map((entry, i) => (
            <motion.article
              key={entry.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className={`group bg-midnight p-8 relative cursor-pointer ${
                i % 3 === 0 ? "md:col-span-2" : ""
              }`}
            >
              <motion.div
                className="absolute inset-0 bg-maiba-red/[0.02]"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />

              <div className="relative z-10 flex gap-5">
                {entry.thumbnail && (
                  <div className="w-20 h-20 flex-shrink-0 rounded-sm overflow-hidden bg-malamaya-border/20">
                    <img
                      src={entry.thumbnail}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-4">
                    <span
                      className={`text-[10px] tracking-widest uppercase px-2 py-0.5 border rounded-sm ${tagColors[entry.tag] || "text-malamaya border-malamaya-border"}`}
                    >
                      {entry.tag}
                    </span>
                    <span className="text-malamaya-border text-xs">
                      {entry.date}
                    </span>
                  </div>
                  <h3 className="font-display text-xl md:text-2xl mb-3 group-hover:text-maiba-red transition-colors duration-500">
                    {entry.title}
                  </h3>
                  <p className="text-malamaya text-sm leading-relaxed max-w-lg">
                    {entry.excerpt}
                  </p>
                </div>
              </div>

              <div className="absolute bottom-0 left-8 right-8 h-px bg-malamaya-border/20 group-hover:bg-maiba-red/20 transition-colors" />
            </motion.article>
          ))}
        </div>

        {entries.length === 0 && (
          <p className="text-malamaya text-sm text-center py-12">
            No field notes yet. The sparks are gathering...
          </p>
        )}
      </div>
    </section>
  );
}
