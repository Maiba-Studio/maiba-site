import Image from "next/image";
import Link from "next/link";
import type { StudioMember } from "@/lib/data";
import { SocialIconRenderer } from "@/lib/social-icons";

export default function MemberProfile({ member }: { member: StudioMember }) {
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

  return (
    <main className="min-h-screen px-6 py-28 md:py-36">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />

      <div className="mx-auto max-w-3xl">
        <section className="relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px bg-gradient-to-r from-transparent via-malamaya-border to-transparent" />

          <div className="flex flex-col items-center text-center gap-6 pt-4">
            {member.image && (
              <div className="relative w-36 h-36 md:w-44 md:h-44 overflow-hidden rounded-full border-2 border-malamaya-border/40">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  sizes="(min-width: 768px) 176px, 144px"
                  className="object-cover"
                  unoptimized={member.image.startsWith("http")}
                  priority
                />
              </div>
            )}

            <div>
              <h1 className="font-display text-5xl md:text-7xl text-foreground tracking-tight">
                {member.name}
              </h1>
              {member.role && (
                <p className="mt-4 text-xs uppercase tracking-[0.3em] text-maiba-red max-w-xl mx-auto leading-relaxed">
                  {member.role}
                </p>
              )}
            </div>
          </div>
        </section>

        {member.bioHtml && (
          <section className="mt-16 md:mt-20">
            <div
              className="site-rich-text text-malamaya-light text-base md:text-lg leading-relaxed"
              dangerouslySetInnerHTML={{ __html: member.bioHtml }}
            />
          </section>
        )}

        {member.areas.length > 0 && (
          <section className="mt-16 md:mt-20">
            <p className="text-maiba-red text-xs tracking-[0.3em] uppercase mb-6">
              {member.areasTitle || "Areas of Work"}
            </p>
            <div className="flex flex-wrap gap-2">
              {member.areas.map((area) => (
                <span
                  key={area}
                  className="text-xs tracking-widest uppercase text-maiba-red/80 border border-maiba-red/20 px-3 py-1 rounded-sm"
                >
                  {area}
                </span>
              ))}
            </div>
          </section>
        )}

        {member.socialLinks.length > 0 && (
          <section className="mt-16 md:mt-20 pt-12 border-t border-malamaya-border/20">
            <p className="text-malamaya text-xs tracking-widest uppercase mb-6 text-center">
              {member.connectTitle || "Connect"}
            </p>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
              {member.socialLinks.map((link, i) => (
                <a
                  key={`${link.label}-${i}`}
                  href={link.href}
                  aria-label={link.label}
                  target={link.href.startsWith("mailto:") || link.href.startsWith("tel:") ? undefined : "_blank"}
                  rel={link.href.startsWith("mailto:") || link.href.startsWith("tel:") ? undefined : "noopener noreferrer"}
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
          <p className="mt-12 text-center font-accent italic text-malamaya text-sm md:text-base">
            {member.locationNote}
          </p>
        )}

        <div className="mt-16 border-t border-malamaya-border/20 pt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/"
            className="text-xs tracking-widest uppercase text-malamaya hover:text-maiba-red transition-colors"
          >
            ← Maiba Studio
          </Link>
          <Link
            href="/#contact"
            className="text-xs tracking-widest uppercase text-malamaya hover:text-maiba-red transition-colors"
          >
            Contact
          </Link>
        </div>
      </div>
    </main>
  );
}
