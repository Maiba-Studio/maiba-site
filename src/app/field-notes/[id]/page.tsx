import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { getEntry } from "@/lib/data";
import { prepareFieldNoteBody } from "@/lib/sanitize";

const tagColors: Record<string, string> = {
  drawing: "text-amber-400 border-amber-400/30",
  log: "text-emerald-400 border-emerald-400/30",
  code: "text-sky-400 border-sky-400/30",
  create: "text-pink-400 border-pink-400/30",
  vision: "text-maiba-red border-maiba-red/30",
  shadow: "text-purple-400 border-purple-400/30",
};

const siteUrl = "https://maiba.studio";

function absoluteUrl(path: string) {
  if (!path) return undefined;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const entry = await getEntry(id);

  if (!entry || !entry.published) {
    return {
      title: "Field Note",
      robots: { index: false, follow: false },
    };
  }

  const image = absoluteUrl(entry.thumbnail) ?? `${siteUrl}/images/og-image.png`;
  const url = `${siteUrl}/field-notes/${entry.slug || entry.id}`;

  return {
    title: entry.title,
    description: entry.excerpt,
    keywords: entry.seoTags,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "article",
      url,
      siteName: "Maiba Studio",
      title: entry.title,
      description: entry.excerpt,
      publishedTime: entry.date,
      modifiedTime: entry.updatedAt,
      tags: entry.seoTags,
      images: [
        {
          url: image,
          alt: entry.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: entry.title,
      description: entry.excerpt,
      images: [image],
    },
  };
}

export default async function FieldNotePage({ params }: Props) {
  const { id } = await params;
  const [entry, session] = await Promise.all([getEntry(id), getSession()]);

  if (!entry || (!entry.published && !session)) {
    notFound();
  }

  const entryUrl = `${siteUrl}/field-notes/${entry.slug || entry.id}`;
  const image = absoluteUrl(entry.thumbnail);
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: entry.title,
    description: entry.excerpt,
    image: image ? [image] : [`${siteUrl}/images/og-image.png`],
    datePublished: entry.date,
    dateModified: entry.updatedAt,
    mainEntityOfPage: entryUrl,
    keywords: entry.seoTags.join(", "),
    articleSection: entry.tag,
    author: {
      "@type": "Organization",
      name: "Maiba Studio",
      url: siteUrl,
    },
    publisher: {
      "@type": "Organization",
      name: "Maiba Studio",
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/logo-icon.png`,
      },
    },
  };

  return (
    <article className="min-h-screen py-24 md:py-32 px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <div className="max-w-3xl mx-auto">
        <div className="mb-12">
          <Link
            href="/#archive"
            className="text-xs tracking-widest uppercase text-malamaya hover:text-maiba-red transition-colors"
          >
            ← Back to Field Notes
          </Link>
        </div>

        <header className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span
              className={`text-[10px] tracking-widest uppercase px-2 py-0.5 border rounded-sm ${
                tagColors[entry.tag] || "text-malamaya border-malamaya-border"
              }`}
            >
              {entry.tag}
            </span>
            <time className="text-malamaya-border text-xs" dateTime={entry.date}>
              {entry.date}
            </time>
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
        </header>

        {entry.thumbnail && (
          <div className="mb-12">
            <Image
              src={entry.thumbnail}
              alt={entry.title}
              width={1200}
              height={800}
              unoptimized={entry.thumbnail.startsWith("http")}
              priority
              className="w-full rounded-sm border border-malamaya-border/20"
            />
          </div>
        )}

        {entry.body && (
          <div
            className="field-note-body mb-12 text-base"
            dangerouslySetInnerHTML={{ __html: prepareFieldNoteBody(entry.body) }}
          />
        )}

        {entry.seoTags.length > 0 && (
          <footer className="mb-12">
            <div className="flex flex-wrap gap-2">
              {entry.seoTags.map((seoTag) => (
                <span
                  key={seoTag}
                  className="text-xs text-maiba-red/80 border border-maiba-red/20 px-3 py-1 rounded-sm"
                >
                  #{seoTag}
                </span>
              ))}
            </div>
          </footer>
        )}

        <div className="border-t border-malamaya-border/20 pt-8">
          <Link
            href="/#archive"
            className="text-xs tracking-widest uppercase text-malamaya hover:text-maiba-red transition-colors"
          >
            ← Back to Field Notes
          </Link>
        </div>
      </div>
    </article>
  );
}

