"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";

const tagColors: Record<string, string> = {
  drawing: "text-amber-400 border-amber-400/30",
  log: "text-emerald-400 border-emerald-400/30",
  code: "text-sky-400 border-sky-400/30",
  vision: "text-maiba-red border-maiba-red/30",
  shadow: "text-purple-400 border-purple-400/30",
};

interface FieldNote {
  id: string;
  title: string;
  headline: string;
  excerpt: string;
  body: string;
  tag: string;
  date: string;
  thumbnail: string;
  images: string[];
  links: { label: string; url: string }[];
}

export default function FieldNotePage() {
  const params = useParams();
  const id = params.id as string;
  const [entry, setEntry] = useState<FieldNote | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/entries/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then(setEntry)
      .catch(() => setNotFound(true));
  }, [id]);

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <p className="font-display text-3xl mb-4">Lost in the dark</p>
          <p className="text-malamaya text-sm mb-8">This field note doesn't exist or has been removed.</p>
          <Link
            href="/#archive"
            className="text-xs tracking-widest uppercase text-maiba-red hover:text-maiba-red/80 transition-colors"
          >
            ← Back to Field Notes
          </Link>
        </div>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-malamaya text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-24 md:py-32 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Back link */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-12"
        >
          <Link
            href="/#archive"
            className="text-xs tracking-widest uppercase text-malamaya hover:text-maiba-red transition-colors"
          >
            ← Back to Field Notes
          </Link>
        </motion.div>

        {/* Meta */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <span
              className={`text-[10px] tracking-widest uppercase px-2 py-0.5 border rounded-sm ${
                tagColors[entry.tag] || "text-malamaya border-malamaya-border"
              }`}
            >
              {entry.tag}
            </span>
            <span className="text-malamaya-border text-xs">{entry.date}</span>
          </div>

          {entry.headline && (
            <p className="text-maiba-red text-xs tracking-widest uppercase mb-3">
              {entry.headline}
            </p>
          )}

          <h1 className="font-display text-3xl md:text-5xl mb-4">
            {entry.title}
          </h1>

          <p className="font-accent italic text-malamaya-light text-lg leading-relaxed">
            {entry.excerpt}
          </p>
        </motion.div>

        {/* Thumbnail */}
        {entry.thumbnail && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mb-12"
          >
            <img
              src={entry.thumbnail}
              alt={entry.title}
              className="w-full rounded-sm border border-malamaya-border/20"
            />
          </motion.div>
        )}

        {/* Body */}
        {entry.body && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="prose-invert mb-12"
          >
            {entry.body.split("\n").map((paragraph, i) =>
              paragraph.trim() === "" ? (
                <div key={i} className="h-6" />
              ) : (
                <p
                  key={i}
                  className="text-malamaya-light text-base leading-8 mb-4"
                >
                  {paragraph}
                </p>
              )
            )}
          </motion.div>
        )}

        {/* Images gallery */}
        {entry.images.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="mb-12 space-y-4"
          >
            <p className="text-xs tracking-widest uppercase text-malamaya mb-4">
              Gallery
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {entry.images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`${entry.title} — ${i + 1}`}
                  className="w-full rounded-sm border border-malamaya-border/20"
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Links */}
        {entry.links.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-12"
          >
            <p className="text-xs tracking-widest uppercase text-malamaya mb-4">
              Links
            </p>
            <div className="flex flex-wrap gap-3">
              {entry.links.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm border border-malamaya-border/30 px-4 py-2 rounded-sm text-malamaya hover:text-maiba-red hover:border-maiba-red/30 transition-colors"
                >
                  {link.label} ↗
                </a>
              ))}
            </div>
          </motion.div>
        )}

        {/* Footer divider */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="border-t border-malamaya-border/20 pt-8"
        >
          <Link
            href="/#archive"
            className="text-xs tracking-widest uppercase text-malamaya hover:text-maiba-red transition-colors"
          >
            ← Back to Field Notes
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
