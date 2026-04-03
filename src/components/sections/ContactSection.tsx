"use client";

import { motion } from "framer-motion";
import { useState, useEffect, FormEvent } from "react";
import { Flame, Loader2 } from "lucide-react";
import { SocialIconRenderer } from "@/lib/social-icons";

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.8, ease: "easeOut" as const },
};

interface ContactContent {
  title: string;
  subtitle: string;
  socialLinks: { label: string; href: string; icon: string; iconId?: string }[];
}

const defaults: ContactContent = {
  title: "Join the Cult",
  subtitle: "Want to build something deviant?\nLeave a trace. Light a candle.",
  socialLinks: [
    { label: "X (Twitter)", href: "https://twitter.com", icon: "", iconId: "x" },
    { label: "LinkedIn", href: "https://linkedin.com", icon: "", iconId: "linkedin" },
    { label: "Email", href: "mailto:hello@maiba.studio", icon: "", iconId: "email" },
  ],
};

export default function ContactSection() {
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [content, setContent] = useState<ContactContent>(defaults);

  useEffect(() => {
    fetch("/api/site-content")
      .then((r) => r.json())
      .then((data) => {
        if (data.contact) setContent({ ...defaults, ...data.contact });
      })
      .catch(() => {});
  }, []);

  const getCaptchaToken = async (): Promise<string> => {
    if (!RECAPTCHA_SITE_KEY || !window.grecaptcha) return "";
    return new Promise((resolve) => {
      window.grecaptcha!.ready(async () => {
        try {
          const token = await window.grecaptcha!.execute(RECAPTCHA_SITE_KEY, {
            action: "contact",
          });
          resolve(token);
        } catch {
          resolve("");
        }
      });
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSending(true);

    try {
      const captchaToken = await getCaptchaToken();

      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, captchaToken }),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Connection failed. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="contact" className="relative py-32">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px bg-gradient-to-r from-transparent via-malamaya-border to-transparent" />

      <div className="max-w-2xl mx-auto px-6">
        <motion.div {...fadeUp} className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl mb-6">
            {content.title}
          </h2>
          <p className="font-accent italic text-malamaya-light text-lg whitespace-pre-line">
            {content.subtitle}
          </p>
        </motion.div>

        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="mb-6">
              <Flame className="w-10 h-10 text-maiba-red mx-auto" strokeWidth={1.5} />
            </div>
            <p className="font-display text-2xl mb-3">Candle lit.</p>
            <p className="text-malamaya">
              Your trace has been left. We&apos;ll find you in the light.
            </p>
          </motion.div>
        ) : (
          <motion.form
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            onSubmit={handleSubmit}
            className="space-y-8"
          >
            <div>
              <label htmlFor="contact-name" className="text-xs tracking-widest uppercase text-malamaya mb-3 block">
                Name
              </label>
              <input
                id="contact-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={sending}
                className="w-full bg-transparent border-b border-malamaya-border px-0 py-3 text-foreground focus:border-maiba-red focus:outline-none transition-colors placeholder:text-malamaya-border disabled:opacity-50"
                placeholder="Your name, alias, or sigil"
              />
            </div>
            <div>
              <label htmlFor="contact-email" className="text-xs tracking-widest uppercase text-malamaya mb-3 block">
                Email
              </label>
              <input
                id="contact-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={sending}
                className="w-full bg-transparent border-b border-malamaya-border px-0 py-3 text-foreground focus:border-maiba-red focus:outline-none transition-colors placeholder:text-malamaya-border disabled:opacity-50"
                placeholder="Where to send the signal"
              />
            </div>
            <div>
              <label htmlFor="contact-message" className="text-xs tracking-widest uppercase text-malamaya mb-3 block">
                Message
              </label>
              <textarea
                id="contact-message"
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                disabled={sending}
                className="w-full bg-transparent border-b border-malamaya-border px-0 py-3 text-foreground focus:border-maiba-red focus:outline-none transition-colors resize-none placeholder:text-malamaya-border disabled:opacity-50"
                placeholder="What are you building? What keeps you up at night?"
              />
            </div>

            {error && (
              <p className="text-maiba-red text-sm text-center">{error}</p>
            )}

            <motion.button
              type="submit"
              disabled={sending}
              whileHover={sending ? {} : { scale: 1.02 }}
              whileTap={sending ? {} : { scale: 0.98 }}
              className="group flex items-center gap-3 bg-maiba-red/10 border border-maiba-red/30 text-maiba-red px-8 py-4 rounded-sm hover:bg-maiba-red/20 transition-colors w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm tracking-widest uppercase">Sending...</span>
                </>
              ) : (
                <>
                  <svg width="16" height="24" viewBox="0 0 16 24" fill="none" className="group-hover:drop-shadow-[0_0_6px_#f23d3d]">
                    <ellipse cx="8" cy="4" rx="3" ry="4" fill="#ff8c00" opacity="0.8">
                      <animate attributeName="ry" values="4;3.5;4.5;4" dur="0.8s" repeatCount="indefinite" />
                    </ellipse>
                    <rect x="6" y="7" width="4" height="16" rx="1" fill="#e8e0d4" opacity="0.3" />
                  </svg>
                  <span className="text-sm tracking-widest uppercase">Light the Candle</span>
                </>
              )}
            </motion.button>

            {RECAPTCHA_SITE_KEY && (
              <p className="text-malamaya-border/60 text-[10px] text-center leading-relaxed">
                Protected by reCAPTCHA.{" "}
                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-malamaya transition-colors">Privacy</a>
                {" & "}
                <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="underline hover:text-malamaya transition-colors">Terms</a>
              </p>
            )}
          </motion.form>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-20 pt-12 border-t border-malamaya-border"
        >
          <p className="text-malamaya text-xs tracking-widest uppercase mb-6 text-center">
            Find us in the periphery
          </p>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-8">
            {content.socialLinks.map((link, i) => (
              <a
                key={`${link.label}-${i}`}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-malamaya text-sm hover:text-maiba-red transition-colors duration-300"
              >
                <SocialIconRenderer
                  iconId={link.iconId || ""}
                  customIconUrl={link.icon}
                  size={16}
                />
                {link.label}
              </a>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
