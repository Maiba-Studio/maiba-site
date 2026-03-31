"use client";

import { motion } from "framer-motion";
import { useState, useEffect, FormEvent } from "react";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.8, ease: "easeOut" as const },
};

interface ContactContent {
  title: string;
  subtitle: string;
  socialLinks: { label: string; href: string; icon: string }[];
}

const defaults: ContactContent = {
  title: "Join the Cult",
  subtitle: "Want to build something deviant?\nLeave a trace. Light a candle.",
  socialLinks: [
    { label: "Twitter", href: "https://twitter.com", icon: "" },
    { label: "LinkedIn", href: "https://linkedin.com", icon: "" },
    { label: "Farcaster", href: "https://warpcast.com", icon: "" },
    { label: "Email", href: "mailto:hello@maiba.studio", icon: "" },
  ],
};

export default function ContactSection() {
  const [submitted, setSubmitted] = useState(false);
  const [content, setContent] = useState<ContactContent>(defaults);

  useEffect(() => {
    fetch("/api/site-content")
      .then((r) => r.json())
      .then((data) => {
        if (data.contact) setContent({ ...defaults, ...data.contact });
      })
      .catch(() => {});
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
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
            <div className="text-4xl mb-6">🕯️</div>
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
                required
                className="w-full bg-transparent border-b border-malamaya-border px-0 py-3 text-foreground focus:border-maiba-red focus:outline-none transition-colors placeholder:text-malamaya-border"
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
                required
                className="w-full bg-transparent border-b border-malamaya-border px-0 py-3 text-foreground focus:border-maiba-red focus:outline-none transition-colors placeholder:text-malamaya-border"
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
                required
                className="w-full bg-transparent border-b border-malamaya-border px-0 py-3 text-foreground focus:border-maiba-red focus:outline-none transition-colors resize-none placeholder:text-malamaya-border"
                placeholder="What are you building? What keeps you up at night?"
              />
            </div>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group flex items-center gap-3 bg-maiba-red/10 border border-maiba-red/30 text-maiba-red px-8 py-4 rounded-sm hover:bg-maiba-red/20 transition-colors w-full justify-center"
            >
              <svg width="16" height="24" viewBox="0 0 16 24" fill="none" className="group-hover:drop-shadow-[0_0_6px_#f23d3d]">
                <ellipse cx="8" cy="4" rx="3" ry="4" fill="#ff8c00" opacity="0.8">
                  <animate attributeName="ry" values="4;3.5;4.5;4" dur="0.8s" repeatCount="indefinite" />
                </ellipse>
                <rect x="6" y="7" width="4" height="16" rx="1" fill="#e8e0d4" opacity="0.3" />
              </svg>
              <span className="text-sm tracking-widest uppercase">Light the Candle</span>
            </motion.button>
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
          <div className="flex justify-center gap-8">
            {content.socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-malamaya text-sm hover:text-maiba-red transition-colors duration-300"
              >
                {link.icon && (
                  <img src={link.icon} alt="" className="w-4 h-4 rounded-sm object-contain" />
                )}
                {link.label}
              </a>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
