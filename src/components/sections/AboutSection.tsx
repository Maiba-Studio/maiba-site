"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import MothSvg from "@/components/MothSvg";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.8, ease: "easeOut" as const },
};

interface AboutContent {
  originTitle: string;
  originLines: string[];
  eyeTitle: string;
  eyeParagraphs: string[];
  founderTitle: string;
  founderParagraphs: string[];
  founderName: string;
  founderRole: string;
  founderImage: string;
  alterEgoName: string;
  alterEgoRole: string;
  alterEgoImage: string;
  ethosTitle: string;
  ethosList: string[];
}

const defaults: AboutContent = {
  originTitle: 'The Origin of "Maiba"',
  originLines: [
    "Maiba means to change, to differ, to deviate.",
    "It is a word with motion, like flame.",
    "We don't create to fit in—we create to remember who we are becoming.",
  ],
  eyeTitle: "The Eye",
  eyeParagraphs: [
    "In 2024, I lost sight in my left eye due to a severe infection—blinding me for a week.",
    "Then my right eye began to drift inward. Doctors feared a tumor.",
    "I lived in a world too bright to bear. I couldn't see without pain.",
    "It was the wake-up call I didn't know I needed.",
    "So I stopped. I left my roles, paused the projects, and finally chose to build something for me.",
    "Maiba is that choice. No more delays. No more excuses. Just truth, in the time I have left to see it.",
  ],
  founderTitle: "The Founder",
  founderParagraphs: [],
  founderName: "EL Bonuan",
  founderRole: "Founder · Imagineer",
  founderImage: "",
  alterEgoName: "Gamotwox",
  alterEgoRole: "The Seeker · Moth Cultist",
  alterEgoImage: "",
  ethosTitle: "Studio Ethos",
  ethosList: [
    "Finish what matters.",
    "Burn bright, not fast.",
    "Create what you would regret not doing.",
    "Build deviant.",
    "Be moth. Seek light.",
  ],
};

export default function AboutSection() {
  const [showAlterEgo, setShowAlterEgo] = useState(false);
  const [content, setContent] = useState<AboutContent>(defaults);

  useEffect(() => {
    fetch("/api/site-content")
      .then((r) => r.json())
      .then((data) => {
        if (data.about) setContent({ ...defaults, ...data.about });
      })
      .catch(() => {});
  }, []);

  return (
    <section id="about" className="relative py-32">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px bg-gradient-to-r from-transparent via-malamaya-border to-transparent" />

      {/* Origin */}
      <div className="max-w-3xl mx-auto px-6 mb-32">
        <motion.div {...fadeUp}>
          <p className="text-maiba-red text-xs tracking-[0.3em] uppercase mb-8">
            {content.originTitle}
          </p>
          <div className="space-y-6 font-accent italic text-bone/80 text-lg md:text-xl leading-relaxed">
            {content.originLines.map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        </motion.div>
      </div>

      {/* The Eye */}
      <div className="max-w-3xl mx-auto px-6 mb-32">
        <motion.div {...fadeUp}>
          <p className="text-maiba-red text-xs tracking-[0.3em] uppercase mb-8">
            {content.eyeTitle}
          </p>
          <div className="space-y-6 text-malamaya-light text-base md:text-lg leading-relaxed border-l-2 border-malamaya-border pl-6">
            {content.eyeParagraphs.map((para, i) => {
              const isWakeUp = para.includes("wake-up call");
              const isChoice = para.includes("Maiba is that choice");
              return (
                <p
                  key={i}
                  className={
                    isChoice
                      ? "text-maiba-red font-accent italic"
                      : isWakeUp
                        ? "text-foreground"
                        : ""
                  }
                >
                  {para}
                </p>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* The Founder */}
      <div className="max-w-3xl mx-auto px-6 mb-32">
        <motion.div {...fadeUp}>
          <p className="text-maiba-red text-xs tracking-[0.3em] uppercase mb-8">
            {content.founderTitle}
          </p>
          <div className="space-y-6 text-malamaya-light text-base md:text-lg leading-relaxed">
            <p>
              <strong className="text-foreground">{content.founderName}</strong>{" "}
              is the founder and imagineer of Maiba Studio. A cultural deviant
              working across art, AI, Web3, and interior space, he builds at
              the bleeding edge of creative technology.
            </p>
            <p>
              His alter ego,{" "}
              <strong className="text-foreground">{content.alterEgoName}</strong>,
              is the seeker—a moth cultist following light through shadow.
            </p>
          </div>

          <motion.button
            onClick={() => setShowAlterEgo(!showAlterEgo)}
            className="mt-10 group relative"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="border border-malamaya-border px-8 py-6 rounded-sm relative overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-maiba-red/5"
                animate={{ opacity: showAlterEgo ? 1 : 0 }}
              />
              <div className="flex items-center gap-5">
                {(showAlterEgo ? content.alterEgoImage : content.founderImage) && (
                  <motion.img
                    key={showAlterEgo ? "alter-img" : "founder-img"}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    src={showAlterEgo ? content.alterEgoImage : content.founderImage}
                    alt={showAlterEgo ? content.alterEgoName : content.founderName}
                    className="w-16 h-16 rounded-full object-cover border border-malamaya-border/40 flex-shrink-0"
                  />
                )}
                <div className="text-left">
                  <motion.span
                    key={showAlterEgo ? "alter" : "founder"}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="font-display text-2xl md:text-3xl block"
                  >
                    {showAlterEgo ? content.alterEgoName : content.founderName}
                  </motion.span>
                  <span className="text-malamaya text-xs tracking-widest uppercase mt-2 block">
                    {showAlterEgo ? content.alterEgoRole : content.founderRole}
                  </span>
                  <span className="text-malamaya-border text-[10px] tracking-widest uppercase mt-3 block group-hover:text-maiba-red transition-colors">
                    Click to {showAlterEgo ? "return" : "transform"}
                  </span>
                </div>
              </div>
            </div>
          </motion.button>
        </motion.div>
      </div>

      {/* Studio Ethos */}
      <div className="max-w-3xl mx-auto px-6">
        <motion.div {...fadeUp}>
          <p className="text-maiba-red text-xs tracking-[0.3em] uppercase mb-12 text-center">
            {content.ethosTitle}
          </p>
          <div className="flex flex-col items-center gap-6">
            {content.ethosList.map((line, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
                className="flex items-center gap-4"
              >
                <MothSvg size={16} animate={false} />
                <span className="font-accent italic text-bone/90 text-lg md:text-xl">
                  {line}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
