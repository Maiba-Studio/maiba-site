import sanitizeHtml from "sanitize-html";

const allowedTags = [
  ...sanitizeHtml.defaults.allowedTags,
  "h1",
  "h2",
  "h3",
  "img",
  "u",
  "s",
];

const sanitizeOptions: sanitizeHtml.IOptions = {
  allowedTags,
  allowedAttributes: {
    a: ["href", "name", "target", "rel", "class"],
    img: ["src", "alt", "title", "class"],
    code: ["class"],
    pre: ["class"],
    p: ["class", "style"],
    h1: ["class", "style"],
    h2: ["class", "style"],
    h3: ["class", "style"],
    blockquote: ["class"],
    ul: ["class"],
    ol: ["class"],
    li: ["class"],
    span: ["class"],
    div: ["style"],
  },
  allowedStyles: {
    "*": {
      "text-align": [/^(left|right|center|justify)$/],
    },
  },
  allowedSchemes: ["http", "https", "mailto"],
  allowedSchemesByTag: {
    img: ["http", "https"],
  },
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", {
      rel: "noopener noreferrer",
    }),
  },
};

export function sanitizeRichText(html: string): string {
  return sanitizeHtml(html, sanitizeOptions);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Convert legacy line arrays (or plain text) into paragraph HTML. */
export function linesToHtml(value: unknown): string {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return "";
    if (/<[a-z][\s\S]*>/i.test(trimmed)) return sanitizeRichText(trimmed);
    return sanitizeRichText(
      trimmed
        .split(/\n{2,}|\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => `<p>${escapeHtml(line)}</p>`)
        .join("")
    );
  }

  if (Array.isArray(value)) {
    return sanitizeRichText(
      value
        .map((line) => String(line ?? "").trim())
        .filter(Boolean)
        .map((line) => `<p>${escapeHtml(line)}</p>`)
        .join("")
    );
  }

  return "";
}

/** Normalize site-content rich fields that may still be string[]. */
export function richTextField(value: unknown): string {
  return linesToHtml(value);
}

function decodeBasicEntities(text: string): string {
  return text
    .replace(/&nbsp;/gi, " ")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&amp;/gi, "&");
}

/**
 * Accidental TipTap code-block-only bodies render as one horizontal line.
 * Promote a sole <pre><code> wrapper into normal paragraphs for public display.
 */
export function prepareFieldNoteBody(html: string): string {
  const trimmed = html.trim();
  const match = /^<pre><code(?:\s[^>]*)?>([\s\S]*)<\/code><\/pre>$/i.exec(trimmed);

  if (!match) {
    return sanitizeRichText(html);
  }

  const text = decodeBasicEntities(match[1].replace(/<br\s*\/?>/gi, "\n"));
  const paragraphs = text
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => `<p>${escapeHtml(block).replace(/\n/g, "<br>")}</p>`)
    .join("");

  return sanitizeRichText(paragraphs || `<p>${escapeHtml(text.trim())}</p>`);
}

