"use client";

import { motion } from "framer-motion";

const lines = [
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
];

export default function RitualPage() {
  return (
    <div className="min-h-screen flex items-center justify-center py-32 px-6">
      <div className="max-w-lg text-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="font-mono text-maiba-red text-xs tracking-[0.4em] uppercase mb-16"
        >
          :: Maiba Manifesto ::
        </motion.p>

        <div className="space-y-3">
          {lines.map((line, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 + i * 0.2, duration: 0.8 }}
              className={`font-mono text-sm leading-7 ${
                line === ""
                  ? "h-6"
                  : line.startsWith("Burn") ||
                      line.startsWith("Be moth") ||
                      line.startsWith("Seek")
                    ? "text-maiba-red font-bold"
                    : line.startsWith("This is")
                      ? "text-foreground"
                      : "text-malamaya-light"
              }`}
            >
              {line}
            </motion.p>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: lines.length * 0.2 + 1, duration: 1 }}
          className="mt-16 font-mono text-malamaya-border text-xs tracking-widest"
        >
          — Fragment I · Written in the dark
        </motion.p>
      </div>
    </div>
  );
}
