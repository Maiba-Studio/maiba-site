"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface RitualContent {
  title: string;
  lines: string[];
  accentLines: string[];
  highlightLines: string[];
  closingAttribution: string;
}

const defaults: RitualContent = {
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

export default function RitualPage() {
  const [content, setContent] = useState<RitualContent>(defaults);

  useEffect(() => {
    fetch("/api/site-content")
      .then((r) => r.json())
      .then((data) => {
        if (data.ritual) setContent({ ...defaults, ...data.ritual });
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center py-32 px-6">
      <div className="max-w-lg text-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="font-mono text-maiba-red text-xs tracking-[0.4em] uppercase mb-16"
        >
          {content.title}
        </motion.p>

        <div className="space-y-3">
          {content.lines.map((line, i) => {
            const isAccent = content.accentLines.includes(line);
            const isHighlight = content.highlightLines.includes(line);
            return (
              <motion.p
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 + i * 0.2, duration: 0.8 }}
                className={`font-mono text-sm leading-7 ${
                  line === ""
                    ? "h-6"
                    : isAccent
                      ? "text-maiba-red font-bold"
                      : isHighlight
                        ? "text-foreground"
                        : "text-malamaya-light"
                }`}
              >
                {line}
              </motion.p>
            );
          })}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: content.lines.length * 0.2 + 1, duration: 1 }}
          className="mt-16 font-mono text-malamaya-border text-xs tracking-widest"
        >
          {content.closingAttribution}
        </motion.p>
      </div>
    </div>
  );
}
