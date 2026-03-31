"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";

type Tag = "all" | "drawing" | "log" | "code" | "vision" | "shadow";

interface Entry {
  id: string;
  title: string;
  headline: string;
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

const INTERVAL = 5200;
const POLL_INTERVAL = 15000;
const tags: Tag[] = ["all", "drawing", "log", "code", "vision", "shadow"];

export default function ArchiveSection() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [activeTag, setActiveTag] = useState<Tag>("all");
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchEntries = useCallback(() => {
    fetch("/api/entries")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setEntries(data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchEntries();
    const poll = setInterval(fetchEntries, POLL_INTERVAL);
    return () => clearInterval(poll);
  }, [fetchEntries]);

  const filtered =
    activeTag === "all"
      ? entries
      : entries.filter((e) => e.tag === activeTag);

  const count = filtered.length;

  useEffect(() => {
    setCurrent(0);
    setDirection(1);
  }, [activeTag]);

  const advance = useCallback(() => {
    if (count <= 1) return;
    setDirection(1);
    setCurrent((prev) => (prev + 1) % count);
  }, [count]);

  const goBack = useCallback(() => {
    if (count <= 1) return;
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + count) % count);
  }, [count]);

  const goTo = useCallback(
    (idx: number) => {
      setDirection(idx > current ? 1 : -1);
      setCurrent(idx);
    },
    [current]
  );

  useEffect(() => {
    if (paused || count <= 1) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
      return;
    }
    timerRef.current = setInterval(advance, INTERVAL);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [paused, count, advance]);

  const entry = filtered[current];

  const variants = {
    enter: (d: number) => ({
      x: d > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({
      x: d > 0 ? -300 : 300,
      opacity: 0,
    }),
  };

  return (
    <section id="archive" className="relative py-32">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px bg-gradient-to-r from-transparent via-malamaya-border to-transparent" />

      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" as const }}
          className="mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl mb-6">
            Field Notes
          </h2>
          <p className="font-accent italic text-malamaya-light text-lg max-w-lg">
            What doesn&apos;t make it into the work... becomes the work.
            <br />
            These are the scattered sparks. The light between things.
          </p>
        </motion.div>

        {/* Tags */}
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

        {/* Carousel */}
        {count > 0 && entry ? (
          <div
            className="relative"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            {/* Nav arrows */}
            {count > 1 && (
              <>
                <button
                  onClick={goBack}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-8 z-20 w-10 h-10 flex items-center justify-center rounded-full border border-malamaya-border/40 text-malamaya hover:text-maiba-red hover:border-maiba-red/40 transition-colors bg-midnight/60 backdrop-blur-sm"
                  aria-label="Previous"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button
                  onClick={advance}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-8 z-20 w-10 h-10 flex items-center justify-center rounded-full border border-malamaya-border/40 text-malamaya hover:text-maiba-red hover:border-maiba-red/40 transition-colors bg-midnight/60 backdrop-blur-sm"
                  aria-label="Next"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </>
            )}

            {/* Card */}
            <div className="overflow-hidden relative min-h-[280px] md:min-h-[240px]">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={entry.id + "-" + current}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.45, ease: "easeInOut" }}
                  className="w-full"
                >
                  <Link href={`/field-notes/${entry.id}`} className="block group">
                    <div className="border border-malamaya-border/30 rounded-sm bg-midnight/50 p-6 md:p-8 relative overflow-hidden">
                      <motion.div
                        className="absolute inset-0 bg-maiba-red/[0.02]"
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      />

                      <div className="relative z-10 flex gap-6 items-start">
                        {entry.thumbnail && (
                          <div className="w-28 h-28 md:w-36 md:h-36 flex-shrink-0 rounded-sm overflow-hidden bg-malamaya-border/20">
                            <img
                              src={entry.thumbnail}
                              alt=""
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-3">
                            <span
                              className={`text-[10px] tracking-widest uppercase px-2 py-0.5 border rounded-sm ${
                                tagColors[entry.tag] || "text-malamaya border-malamaya-border"
                              }`}
                            >
                              {entry.tag}
                            </span>
                            <span className="text-malamaya-border text-xs">
                              {entry.date}
                            </span>
                          </div>

                          {entry.headline && (
                            <p className="text-maiba-red text-xs tracking-widest uppercase mb-2">
                              {entry.headline}
                            </p>
                          )}

                          <h3 className="font-display text-xl md:text-2xl mb-3 group-hover:text-maiba-red transition-colors duration-500">
                            {entry.title}
                          </h3>

                          <p className="text-malamaya text-sm leading-relaxed line-clamp-3 max-w-xl">
                            {entry.excerpt}
                          </p>

                          <span className="inline-block mt-4 text-[10px] tracking-[0.3em] uppercase text-malamaya-border group-hover:text-maiba-red transition-colors">
                            Read more →
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Progress dots + bar */}
            {count > 1 && (
              <div className="mt-6 flex flex-col items-center gap-3">
                <div className="flex gap-2">
                  {filtered.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => goTo(i)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        i === current
                          ? "bg-maiba-red w-6"
                          : "bg-malamaya-border hover:bg-malamaya"
                      }`}
                      aria-label={`Go to note ${i + 1}`}
                    />
                  ))}
                </div>

                {/* Auto-advance progress bar */}
                {!paused && (
                  <div className="w-32 h-px bg-malamaya-border/30 overflow-hidden rounded-full">
                    <motion.div
                      key={`progress-${current}-${activeTag}`}
                      className="h-full bg-maiba-red/50"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: INTERVAL / 1000, ease: "linear" }}
                    />
                  </div>
                )}

                <p className="text-malamaya-border text-[10px] tracking-widest">
                  {current + 1} / {count}
                </p>
              </div>
            )}
          </div>
        ) : entries.length === 0 ? (
          <p className="text-malamaya text-sm text-center py-12">
            No field notes yet. The sparks are gathering...
          </p>
        ) : (
          <p className="text-malamaya text-sm text-center py-12">
            No notes found for this tag.
          </p>
        )}
      </div>
    </section>
  );
}
