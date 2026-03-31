"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Lamp from "./Lamp";

const KONAMI = [
  "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
  "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight",
];

interface RitualPreview {
  title: string;
  lines: string[];
  accentLines: string[];
  closingAttribution: string;
}

const defaultRitual: RitualPreview = {
  title: ":: The Ritual ::",
  lines: [
    "We are the moths who chose the flame.",
    "Not because we are blind,",
    "but because we refuse to live in the dark.",
    "",
    "Every deviation is an act of devotion.",
    "Every creation is a prayer we refuse to whisper.",
  ],
  accentLines: [],
  closingAttribution: "— Maiba Manifesto, Fragment I",
};

export default function Footer() {
  const [konamiIndex, setKonamiIndex] = useState(0);
  const [ritualUnlocked, setRitualUnlocked] = useState(false);
  const [secretsRevealed, setSecretsRevealed] = useState(false);
  const [ritual, setRitual] = useState<RitualPreview>(defaultRitual);
  const footerRef = useRef<HTMLElement>(null);
  const hasReachedBottom = useRef(false);

  useEffect(() => {
    fetch("/api/site-content")
      .then((r) => r.json())
      .then((data) => {
        if (data.ritual) {
          const first6 = data.ritual.lines.slice(0, 6);
          setRitual({
            title: ":: The Ritual ::",
            lines: first6,
            accentLines: data.ritual.accentLines || [],
            closingAttribution: data.ritual.closingAttribution || defaultRitual.closingAttribution,
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === KONAMI[konamiIndex]) {
        const next = konamiIndex + 1;
        if (next === KONAMI.length) {
          setRitualUnlocked(true);
          setKonamiIndex(0);
        } else {
          setKonamiIndex(next);
        }
      } else {
        setKonamiIndex(0);
      }
    },
    [konamiIndex]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (secretsRevealed) return;

    let scrollAttempts = 0;

    const handleScroll = () => {
      const scrollBottom = window.scrollY + window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      const atBottom = scrollBottom >= docHeight - 2;

      if (atBottom && !hasReachedBottom.current) {
        hasReachedBottom.current = true;
        scrollAttempts = 0;
      }

      if (hasReachedBottom.current && atBottom) {
        scrollAttempts++;
        if (scrollAttempts > 3) {
          setSecretsRevealed(true);
        }
      }

      if (!atBottom) {
        hasReachedBottom.current = false;
        scrollAttempts = 0;
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if (secretsRevealed) return;

      const scrollBottom = window.scrollY + window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      const atBottom = scrollBottom >= docHeight - 2;

      if (atBottom && e.deltaY > 0) {
        if (!hasReachedBottom.current) {
          hasReachedBottom.current = true;
        }
        scrollAttempts++;
        if (scrollAttempts >= 2) {
          setSecretsRevealed(true);
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("wheel", handleWheel, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("wheel", handleWheel);
    };
  }, [secretsRevealed]);

  return (
    <footer ref={footerRef} className="relative border-t border-malamaya-border mt-auto">
      {/* Visible footer */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-malamaya text-sm">
            &copy; {new Date().getFullYear()} Maiba Studio. Deviant Made.
          </div>
          <div className="flex items-center gap-6 text-malamaya text-sm">
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-maiba-red transition-colors">Twitter</a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-maiba-red transition-colors">LinkedIn</a>
            <a href="https://warpcast.com" target="_blank" rel="noopener noreferrer" className="hover:text-maiba-red transition-colors">Farcaster</a>
          </div>
        </div>
      </div>

      {/* Hidden secrets — revealed on overscroll past footer */}
      <AnimatePresence>
        {secretsRevealed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" as const }}
            className="overflow-hidden"
          >
            <div className="border-t border-malamaya-border/20 max-w-7xl mx-auto px-6 py-10">
              {/* Konami hint */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="flex justify-center gap-1"
              >
                {KONAMI.map((key, i) => (
                  <span
                    key={i}
                    className={`text-[10px] w-5 h-5 flex items-center justify-center border rounded ${
                      i < konamiIndex
                        ? "border-maiba-red text-maiba-red"
                        : "border-malamaya-border text-malamaya-border"
                    } transition-colors duration-300`}
                  >
                    {key === "ArrowUp" ? "↑" : key === "ArrowDown" ? "↓" : key === "ArrowLeft" ? "←" : "→"}
                  </span>
                ))}
              </motion.div>

              {/* Lamp */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="mt-6 flex justify-center"
              >
                <Lamp />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Secret ritual overlay */}
      <AnimatePresence>
        {ritualUnlocked && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black flex items-center justify-center p-8"
          >
            <button
              onClick={() => setRitualUnlocked(false)}
              className="absolute top-6 right-6 text-malamaya hover:text-maiba-red text-sm"
            >
              ✕ Close
            </button>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="max-w-lg text-center"
            >
              <p className="font-mono text-maiba-red text-xs tracking-widest uppercase mb-8">
                {ritual.title}
              </p>
              <div className="font-mono text-malamaya-light text-sm leading-8 space-y-4">
                {ritual.lines.map((line, i) =>
                  line === "" ? (
                    <div key={i} className="h-4" />
                  ) : (
                    <p
                      key={i}
                      className={ritual.accentLines.includes(line) ? "text-maiba-red" : ""}
                    >
                      {line}
                    </p>
                  )
                )}
                <p className="mt-8 text-malamaya">{ritual.closingAttribution}</p>
              </div>
              <Link
                href="/ritual"
                onClick={() => setRitualUnlocked(false)}
                className="inline-block mt-12 text-xs text-malamaya-border hover:text-maiba-red transition-colors tracking-widest uppercase"
              >
                Go deeper →
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </footer>
  );
}
