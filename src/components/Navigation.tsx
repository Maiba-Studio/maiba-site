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
  { href: "/projects", label: "Projects" },
  { href: "#archive", label: "Field Notes" },
  { href: "#contact", label: "Join the Cult" },
];

export default function Navigation() {
  const router = useRouter();
  const pathname = usePathname();
  const [activeSection, setActiveSection] = useState("#home");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const onProjects = pathname.startsWith("/projects");

  useEffect(() => {
    if (pathname !== "/") return;

    const sectionIds = links
      .filter((l) => l.href.startsWith("#"))
      .map((l) => l.href.slice(1));

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
  }, [pathname]);

  useEffect(() => {
    if (pathname !== "/") setScrolled(true);
  }, [pathname]);

  const go = useCallback(
    (href: string) => {
      if (href.startsWith("/")) {
        router.push(href);
        setMobileOpen(false);
        return;
      }

      if (pathname !== "/") {
        router.push(`/${href}`);
        setMobileOpen(false);
        return;
      }

      const el = document.getElementById(href.slice(1));
      if (el) el.scrollIntoView({ behavior: "smooth" });
      setMobileOpen(false);
    },
    [pathname, router]
  );

  const isActive = (href: string) => {
    if (href.startsWith("/")) return pathname.startsWith(href);
    if (onProjects) return false;
    return pathname === "/" && activeSection === href;
  };

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

        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <button
              key={link.href}
              onClick={() => go(link.href)}
              className={`text-sm tracking-widest uppercase transition-colors duration-500 ${
                isActive(link.href)
                  ? "text-maiba-red"
                  : "text-malamaya-light hover:text-foreground"
              }`}
            >
              {link.label}
            </button>
          ))}
          <MothModeToggle />
        </div>

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

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden bg-midnight/95 backdrop-blur-md border-b border-malamaya-border/20"
          >
            <div className="px-6 py-4 flex flex-col gap-4">
              {links.map((link) => (
                <button
                  key={link.href}
                  onClick={() => go(link.href)}
                  className={`text-left text-sm tracking-widest uppercase transition-colors ${
                    isActive(link.href) ? "text-maiba-red" : "text-malamaya-light"
                  }`}
                >
                  {link.label}
                </button>
              ))}
              <div className="pt-2">
                <MothModeToggle />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
