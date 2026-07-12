"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { StudioMember } from "@/lib/data";
import { SocialIconRenderer } from "@/lib/social-icons";

export default function MemberProfile({ member }: { member: StudioMember }) {
  const [showAlterEgo, setShowAlterEgo] = useState(false);

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

        <section className="mt-20 grid gap-10 md:grid-cols-2">
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
              {member.areas.length === 0 && (
                <p className="text-sm text-malamaya">No disciplines listed yet.</p>
              )}
            </div>
          </div>
        </section>

        {member.selectedWorkHtml.trim() && (
          <section className="mt-10 rounded-sm border border-malamaya-border/20 bg-white/[0.02] p-6">
            <h2 className="font-display text-3xl text-foreground">
              {member.selectedWorkTitle || "Selected Work"}
            </h2>
            <div
              className="mt-4 max-w-3xl site-rich-text text-sm leading-7 text-malamaya-light"
              dangerouslySetInnerHTML={{ __html: member.selectedWorkHtml }}
            />
          </section>
        )}

        {member.socialLinks.length > 0 && (
          <section className="mt-12 pt-10 border-t border-malamaya-border/20">
            <p className="text-malamaya text-xs tracking-widest uppercase mb-6 text-center">
              {member.connectTitle || "Connect"}
            </p>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
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
                  className="flex items-center gap-2 text-malamaya text-sm hover:text-maiba-red transition-colors duration-300"
                >
                  <SocialIconRenderer
                    iconId={link.iconId || ""}
                    customIconUrl={link.icon}
                    size={16}
                  />
                  {link.showLabel !== false && link.label}
                </a>
              ))}
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
