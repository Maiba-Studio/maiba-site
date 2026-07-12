"use client";

import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MothModeToggle from "./MothModeToggle";

const links = [
  { href: "#home", label: "Home" },
  { href: "#about", label: "About" },
  { href: "#who", label: "Who" },
  { href: "#archive", label: "Field Notes" },
  { href: "#contact", label: "Join the Cult" },
];

export default function Navigation() {
  const router = useRouter();
  const pathname = usePathname();
  const [activeSection, setActiveSection] = useState("#home");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const sectionIds = links.map((l) => l.href.slice(1));
    const handleScroll = () => {
      setScrolled(window.scrollY > 60);

      const scrollY = window.scrollY + window.innerHeight * 0.35;

      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(sectionIds[i]);
        if (el && el.offsetTop <= scrollY) {
          setActiveSection(`#${sectionIds[i]}`);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = useCallback((href: string) => {
    if (pathname !== "/") {
      router.push(`/${href}`);
      setMobileOpen(false);
      return;
    }

    const el = document.getElementById(href.slice(1));
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
    setMobileOpen(false);
  }, [pathname, router]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
        scrolled
          ? "bg-midnight/80 backdrop-blur-md border-b border-malamaya-border/20"
          : ""
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <a
          href="https://www.maiba.studio/"
          aria-label="Go to Maiba Studio home"
          className="hover:opacity-80 transition-opacity duration-500"
        >
          <Image
            src="/logo-light.png"
            alt="Maiba Studio"
            width={142}
            height={64}
            className="h-8 w-auto"
            priority
          />
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <button
              key={link.href}
              onClick={() => scrollTo(link.href)}
              className={`text-sm tracking-widest uppercase transition-colors duration-500 ${
                activeSection === link.href
                  ? "text-maiba-red"
                  : "text-malamaya-light hover:text-foreground"
              }`}
            >
              {link.label}
            </button>
          ))}
          <MothModeToggle />
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-foreground p-2"
          aria-label="Toggle menu"
        >
          <div className="space-y-1.5">
            <motion.div
              animate={mobileOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
              className="w-6 h-0.5 bg-foreground"
            />
            <motion.div
              animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }}
              className="w-6 h-0.5 bg-foreground"
            />
            <motion.div
              animate={mobileOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
              className="w-6 h-0.5 bg-foreground"
            />
          </div>
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-midnight/95 backdrop-blur-md border-t border-malamaya-border"
          >
            <div className="px-6 py-8 flex flex-col gap-6">
              {links.map((link) => (
                <button
                  key={link.href}
                  onClick={() => scrollTo(link.href)}
                  className={`text-lg tracking-widest uppercase text-left ${
                    activeSection === link.href
                      ? "text-maiba-red"
                      : "text-malamaya-light"
                  }`}
                >
                  {link.label}
                </button>
              ))}
              <MothModeToggle />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
