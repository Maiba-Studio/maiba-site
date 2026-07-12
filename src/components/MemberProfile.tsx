"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { FieldNote, StudioMember } from "@/lib/data";
import { SocialIconRenderer } from "@/lib/social-icons";

const tagColors: Record<string, string> = {
  drawing: "text-amber-400 border-amber-400/30",
  log: "text-emerald-400 border-emerald-400/30",
  code: "text-sky-400 border-sky-400/30",
  create: "text-pink-400 border-pink-400/30",
  vision: "text-maiba-red border-maiba-red/30",
  shadow: "text-purple-400 border-purple-400/30",
};

type WorkEntry = Pick<
  FieldNote,
  "id" | "slug" | "title" | "headline" | "excerpt" | "tag" | "date" | "thumbnail"
>;

export default function MemberProfile({
  member,
  selectedWork = [],
}: {
  member: StudioMember;
  selectedWork?: WorkEntry[];
}) {
  const [showAlterEgo, setShowAlterEgo] = useState(false);
  const [workIndex, setWorkIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const canToggle =
    member.alterEgoEnabled &&
    Boolean(member.alterEgoName.trim() || member.alterEgoImage.trim());

  const active = showAlterEgo && canToggle;
  const name = active ? member.alterEgoName || member.name : member.name;
  const role = active ? member.alterEgoRole || member.role : member.role;
  const headline = active
    ? member.alterEgoHeadline || member.headline
    : member.headline;
  const image = active ? member.alterEgoImage || member.image : member.image;
  const bioHtml = active
    ? member.alterEgoBioHtml || member.bioHtml
    : member.bioHtml;

  const showBio = member.showBioCard !== false && Boolean(bioHtml.trim());
  const showAreas =
    member.showAreasCard !== false && member.areas.length > 0;
  const showWork =
    member.showSelectedWork !== false && selectedWork.length > 0;
  const showCardGrid = showBio || showAreas;

  const workCount = selectedWork.length;
  const workEntry = selectedWork[workIndex] ?? null;

  const advance = useCallback(() => {
    if (workCount < 2) return;
    setDirection(1);
    setWorkIndex((i) => (i + 1) % workCount);
  }, [workCount]);

  const goBack = useCallback(() => {
    if (workCount < 2) return;
    setDirection(-1);
    setWorkIndex((i) => (i - 1 + workCount) % workCount);
  }, [workCount]);

  useEffect(() => {
    setWorkIndex(0);
  }, [selectedWork]);

  useEffect(() => {
    if (workCount < 2) return;
    const timer = setInterval(advance, 5200);
    return () => clearInterval(timer);
  }, [advance, workCount]);

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: member.name,
    url:
      member.slug === "el"
        ? "https://maiba.studio/el"
        : `https://maiba.studio/members/${member.slug}`,
    jobTitle: member.role,
    image: member.image
      ? member.image.startsWith("http")
        ? member.image
        : `https://maiba.studio${member.image}`
      : undefined,
    affiliation: {
      "@type": "Organization",
      name: "Maiba Studio",
      url: "https://maiba.studio",
    },
    description: member.seoDescription || member.headline,
    sameAs: member.socialLinks
      .map((l) => l.href)
      .filter((href) => href.startsWith("http")),
  };

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
  };

  const Portrait = (
    <div className="relative mx-auto aspect-square w-56 overflow-hidden rounded-full border border-maiba-red/30 bg-malamaya-border/10 md:w-64">
      <AnimatePresence mode="wait">
        {image ? (
          <motion.div
            key={active ? "alter-img" : "primary-img"}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.35 }}
            className="absolute inset-0"
          >
            <Image
              src={image}
              alt={name}
              fill
              sizes="(min-width: 768px) 256px, 224px"
              className="object-cover"
              unoptimized={image.startsWith("http")}
              priority
            />
          </motion.div>
        ) : (
          <motion.div
            key="placeholder"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <span className="text-sm tracking-widest uppercase text-foreground/80">
              {active ? "Alter Ego" : "Portrait"}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
      {canToggle && (
        <motion.div
          className="pointer-events-none absolute -inset-1 rounded-full border border-maiba-red/25"
          animate={{ opacity: active ? 0.7 : 0.25, scale: active ? 1 : 0.98 }}
          transition={{ duration: 0.35 }}
        />
      )}
    </div>
  );

  return (
    <main className="min-h-screen px-6 py-28 md:py-36">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />

      <div className="mx-auto max-w-5xl">
        <section className="grid gap-10 md:grid-cols-[280px_1fr] md:items-center">
          {canToggle ? (
            <button
              type="button"
              onClick={() => setShowAlterEgo((v) => !v)}
              className="group mx-auto w-fit text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-maiba-red/50 rounded-full"
              aria-pressed={active}
              aria-label={active ? "Show primary profile" : "Show alter ego profile"}
            >
              {Portrait}
              <span className="mt-3 block text-center text-[10px] tracking-widest uppercase text-malamaya-border group-hover:text-maiba-red transition-colors">
                Click to {active ? "return" : "transform"}
              </span>
            </button>
          ) : (
            <div className="mx-auto w-fit">{Portrait}</div>
          )}

          <div>
            <AnimatePresence mode="wait">
              <motion.div
                key={active ? "alter-meta" : "primary-meta"}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
              >
                {role && (
                  <p className="mb-4 text-xs uppercase tracking-[0.35em] text-maiba-red">
                    {role}
                  </p>
                )}
                <h1 className="font-display text-5xl text-foreground md:text-7xl">
                  {name}
                </h1>
                {headline && (
                  <p className="mt-6 max-w-2xl font-accent text-xl italic leading-relaxed text-malamaya-light">
                    {headline}
                  </p>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </section>

        {member.socialLinks.length > 0 && (
          <section className="mt-14 md:mt-16">
            <p className="text-malamaya text-xs tracking-widest uppercase mb-5 text-center md:text-left">
              {member.connectTitle || "Connect"}
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 sm:gap-5">
              {member.socialLinks.map((link, i) => (
                <a
                  key={`${link.label}-${i}`}
                  href={link.href}
                  aria-label={link.label}
                  target={
                    link.href.startsWith("mailto:") || link.href.startsWith("tel:")
                      ? undefined
                      : "_blank"
                  }
                  rel={
                    link.href.startsWith("mailto:") || link.href.startsWith("tel:")
                      ? undefined
                      : "noopener noreferrer"
                  }
                  className="group flex items-center gap-2 text-maiba-red text-sm transition-all duration-300 hover:text-white focus-visible:text-white active:text-white hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.85)] focus-visible:drop-shadow-[0_0_10px_rgba(255,255,255,0.85)] active:drop-shadow-[0_0_10px_rgba(255,255,255,0.85)]"
                >
                  <span className="transition-transform duration-300 group-hover:scale-110 group-focus-visible:scale-110">
                    <SocialIconRenderer
                      iconId={link.iconId || ""}
                      customIconUrl={link.icon}
                      size={18}
                    />
                  </span>
                  {link.showLabel !== false && (
                    <span className="tracking-wide">{link.label}</span>
                  )}
                </a>
              ))}
            </div>
          </section>
        )}

        {showCardGrid && (
          <section
            className={`mt-12 grid gap-10 ${
              showBio && showAreas ? "md:grid-cols-2" : "md:grid-cols-1"
            }`}
          >
            {showBio && (
              <div className="rounded-sm border border-malamaya-border/20 bg-white/[0.02] p-6">
                <h2 className="font-display text-3xl text-foreground">
                  {member.bioTitle || "Bio"}
                </h2>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={active ? "alter-bio" : "primary-bio"}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-5 site-rich-text text-sm leading-7 text-malamaya-light"
                    dangerouslySetInnerHTML={{ __html: bioHtml }}
                  />
                </AnimatePresence>
              </div>
            )}

            {showAreas && (
              <div className="rounded-sm border border-malamaya-border/20 bg-white/[0.02] p-6">
                <h2 className="font-display text-3xl text-foreground">
                  {member.areasTitle || "Disciplines"}
                </h2>
                <div className="mt-5 flex flex-wrap gap-2">
                  {member.areas.map((area) => (
                    <span
                      key={area}
                      className="rounded-sm border border-maiba-red/20 px-3 py-1 text-xs uppercase tracking-widest text-maiba-red/90"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {showWork && workEntry && (
          <section className="mt-10">
            <h2 className="font-display text-3xl text-foreground mb-6">
              {member.selectedWorkTitle || "Selected Work"}
            </h2>
            <div className="relative">
              {workCount > 1 && (
                <>
                  <button
                    type="button"
                    onClick={goBack}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 md:-translate-x-6 z-20 w-10 h-10 flex items-center justify-center rounded-full border border-malamaya-border/40 text-malamaya hover:text-maiba-red hover:border-maiba-red/40 transition-colors bg-midnight/60 backdrop-blur-sm"
                    aria-label="Previous"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={advance}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 md:translate-x-6 z-20 w-10 h-10 flex items-center justify-center rounded-full border border-malamaya-border/40 text-malamaya hover:text-maiba-red hover:border-maiba-red/40 transition-colors bg-midnight/60 backdrop-blur-sm"
                    aria-label="Next"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </>
              )}

              <div className="overflow-hidden relative min-h-[240px]">
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={workEntry.id + "-" + workIndex}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.45, ease: "easeInOut" }}
                    className="w-full"
                  >
                    <Link
                      href={`/field-notes/${workEntry.slug || workEntry.id}`}
                      className="block group"
                    >
                      <div className="border border-malamaya-border/30 rounded-sm bg-midnight/50 p-6 md:p-8 relative overflow-hidden">
                        <div className="relative z-10 flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
                          {workEntry.thumbnail && (
                            <div className="w-full sm:w-28 h-40 sm:h-28 md:w-36 md:h-36 flex-shrink-0 rounded-sm overflow-hidden bg-malamaya-border/20">
                              <Image
                                src={workEntry.thumbnail}
                                alt=""
                                width={300}
                                height={300}
                                unoptimized={workEntry.thumbnail.startsWith("http")}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-3">
                              <span
                                className={`text-[10px] tracking-widest uppercase px-2 py-0.5 border rounded-sm ${
                                  tagColors[workEntry.tag] ||
                                  "text-malamaya border-malamaya-border"
                                }`}
                              >
                                {workEntry.tag}
                              </span>
                              <span className="text-malamaya-border text-xs">
                                {workEntry.date}
                              </span>
                            </div>
                            {workEntry.headline && (
                              <p className="text-maiba-red text-xs tracking-widest uppercase mb-2">
                                {workEntry.headline}
                              </p>
                            )}
                            <h3 className="font-display text-xl md:text-2xl mb-3 group-hover:text-maiba-red transition-colors duration-500">
                              {workEntry.title}
                            </h3>
                            <p className="text-malamaya text-sm leading-relaxed line-clamp-3 max-w-xl">
                              {workEntry.excerpt}
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

              {workCount > 1 && (
                <div className="mt-6 flex justify-center gap-2">
                  {selectedWork.map((entry, i) => (
                    <button
                      key={entry.id}
                      type="button"
                      onClick={() => {
                        setDirection(i > workIndex ? 1 : -1);
                        setWorkIndex(i);
                      }}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        i === workIndex ? "bg-maiba-red w-6" : "bg-malamaya-border w-2"
                      }`}
                      aria-label={`Go to slide ${i + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {member.locationNote && (
          <p className="mt-10 text-center font-accent italic text-malamaya text-sm md:text-base">
            {member.locationNote}
          </p>
        )}

        <section className="mt-12 flex flex-wrap gap-4">
          <Link
            href="/"
            className="rounded-sm border border-malamaya-border/30 px-5 py-3 text-xs uppercase tracking-widest text-malamaya transition-colors hover:border-maiba-red/50 hover:text-maiba-red"
          >
            Maiba Studio
          </Link>
          <Link
            href="/#contact"
            className="rounded-sm border border-malamaya-border/30 px-5 py-3 text-xs uppercase tracking-widest text-malamaya transition-colors hover:border-maiba-red/50 hover:text-maiba-red"
          >
            Contact
          </Link>
        </section>
      </div>
    </main>
  );
}
