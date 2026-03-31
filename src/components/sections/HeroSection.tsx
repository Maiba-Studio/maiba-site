"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import MothSvg from "@/components/MothSvg";

interface HeroContent {
  title: string;
  tagline: string;
  hoverText: string;
  scrollCue: string;
}

export default function HeroSection() {
  const [content, setContent] = useState<HeroContent>({
    title: "Maiba Studio",
    tagline: "Deviant Made. Culture-coded. Artist-led.",
    hoverText: "This is Maiba Studio — a ritual, a rebellion, a creative sanctuary.",
    scrollCue: "↓ Enter the Studio",
  });

  useEffect(() => {
    fetch("/api/site-content")
      .then((r) => r.json())
      .then((data) => {
        if (data.hero) setContent(data.hero);
      })
      .catch(() => {});
  }, []);

  return (
    <section
      id="home"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
    >
      <motion.div
        className="absolute w-64 h-64 rounded-full"
        style={{
          background: "radial-gradient(circle, #f23d3d22, transparent 70%)",
        }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" as const }}
      />

      <div className="absolute opacity-40">
        <MothSvg size={200} animate />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, ease: "easeOut" as const }}
        className="relative z-10 text-center"
      >
        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl tracking-tight mb-6">
          {content.title}
        </h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="text-malamaya-light text-lg md:text-xl tracking-[0.25em] uppercase"
        >
          {content.tagline}
        </motion.p>

        <motion.p
          initial={{ opacity: 0, height: 0 }}
          whileHover={{ opacity: 1, height: "auto" }}
          className="mt-8 text-malamaya font-accent italic text-base md:text-lg max-w-md mx-auto leading-relaxed"
        >
          {content.hoverText}
        </motion.p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-12 flex flex-col items-center gap-3"
      >
        <a href="#about" className="group flex flex-col items-center gap-3">
          <div className="relative">
            <motion.div
              className="w-3 h-5 rounded-full mx-auto mb-1"
              style={{
                background: "linear-gradient(to top, #f23d3d, #ff8c00, #ffcc00)",
                filter: "blur(1px)",
              }}
              animate={{
                scaleX: [1, 0.8, 1.1, 0.9, 1],
                scaleY: [1, 1.1, 0.9, 1.05, 1],
                opacity: [1, 0.8, 1, 0.7, 1],
              }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" as const }}
            />
            <motion.div
              className="absolute -inset-4 rounded-full"
              style={{
                background: "radial-gradient(circle, #f23d3d22, transparent)",
              }}
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <div className="w-1.5 h-8 bg-bone/30 rounded-sm mx-auto" />
          </div>
          <span className="text-malamaya text-xs tracking-[0.3em] uppercase group-hover:text-maiba-red transition-colors">
            {content.scrollCue}
          </span>
        </a>
      </motion.div>
    </section>
  );
}
