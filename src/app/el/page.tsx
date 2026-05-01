import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EL Bonuan",
  description:
    "An orphan artist page for EL Bonuan, founder and imagineer of Maiba Studio.",
  robots: { index: false, follow: false },
};

const disciplines = [
  "Art direction",
  "AI-assisted creative systems",
  "Web3 culture",
  "Interior space",
  "Brand worlds",
  "Experimental storytelling",
];

const links = [
  { label: "Maiba Studio", href: "/" },
  { label: "Contact", href: "/#contact" },
];

export default function ELBonuanPage() {
  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "EL Bonuan",
    url: "https://maiba.studio/el",
    jobTitle: "Founder and Imagineer",
    affiliation: {
      "@type": "Organization",
      name: "Maiba Studio",
      url: "https://maiba.studio",
    },
    description:
      "A cultural deviant working across art, AI, Web3, and interior space.",
  };

  return (
    <main className="min-h-screen px-6 py-28 md:py-36">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <div className="mx-auto max-w-5xl">
        <section className="grid gap-10 md:grid-cols-[280px_1fr] md:items-center">
          <div className="relative mx-auto aspect-square w-56 overflow-hidden rounded-full border border-maiba-red/30 bg-malamaya-border/10 md:w-64">
            <Image
              src="/images/founder-placeholder.png"
              alt="EL Bonuan"
              fill
              sizes="(min-width: 768px) 256px, 224px"
              className="object-cover"
              priority
            />
          </div>

          <div>
            <p className="mb-4 text-xs uppercase tracking-[0.35em] text-maiba-red">
              Artist · Founder · Imagineer
            </p>
            <h1 className="font-display text-5xl text-foreground md:text-7xl">
              EL Bonuan
            </h1>
            <p className="mt-6 max-w-2xl font-accent text-xl italic leading-relaxed text-malamaya-light">
              A cultural deviant working across art, AI, Web3, and interior
              space, building at the edge where ritual, technology, and personal
              myth collide.
            </p>
          </div>
        </section>

        <section className="mt-20 grid gap-10 md:grid-cols-[1fr_1fr]">
          <div className="rounded-sm border border-malamaya-border/20 bg-white/[0.02] p-6">
            <h2 className="font-display text-3xl text-foreground">Bio</h2>
            <div className="mt-5 space-y-4 text-sm leading-7 text-malamaya-light">
              <p>
                EL Bonuan is the founder of Maiba Studio, a creative sanctuary
                for work that refuses to flatten itself for easy categories.
              </p>
              <p>
                Through the alter ego Gamotwox, the work follows light through
                shadow: part archive, part ritual, part experiment in becoming.
              </p>
            </div>
          </div>

          <div className="rounded-sm border border-malamaya-border/20 bg-white/[0.02] p-6">
            <h2 className="font-display text-3xl text-foreground">
              Disciplines
            </h2>
            <div className="mt-5 flex flex-wrap gap-2">
              {disciplines.map((discipline) => (
                <span
                  key={discipline}
                  className="rounded-sm border border-maiba-red/20 px-3 py-1 text-xs uppercase tracking-widest text-maiba-red/90"
                >
                  {discipline}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-10 rounded-sm border border-malamaya-border/20 bg-white/[0.02] p-6">
          <h2 className="font-display text-3xl text-foreground">Selected Work</h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-malamaya-light">
            Portfolio details can be expanded through future content updates.
            For now, the live Maiba archive carries the public body of field
            notes, studies, and studio fragments.
          </p>
        </section>

        <section className="mt-12 flex flex-wrap gap-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-sm border border-malamaya-border/30 px-5 py-3 text-xs uppercase tracking-widest text-malamaya transition-colors hover:border-maiba-red/50 hover:text-maiba-red"
            >
              {link.label}
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}

