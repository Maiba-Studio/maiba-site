"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback, useRef } from "react";

interface ProjectCard {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  thumbnail?: string;
}

interface PageContent {
  title: string;
  subtitle: string;
}

const INTERVAL = 5200;
const POLL_INTERVAL = 15000;

const defaultPage: PageContent = {
  title: "Projects",
  subtitle:
    "Selected works from Maiba Studio — products, experiments, and worlds in progress.",
};

export default function ProjectsSection() {
  const [projects, setProjects] = useState<ProjectCard[]>([]);
  const [content, setContent] = useState<PageContent>(defaultPage);
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchProjects = useCallback(() => {
    fetch("/api/projects", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setProjects(data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchProjects();
    const poll = setInterval(fetchProjects, POLL_INTERVAL);
    return () => clearInterval(poll);
  }, [fetchProjects]);

  useEffect(() => {
    fetch("/api/projects/page", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (data && !data.error) {
          setContent({
            title: data.title || defaultPage.title,
            subtitle: data.subtitle || defaultPage.subtitle,
          });
        }
      })
      .catch(() => {});
  }, []);

  const count = projects.length;

  const advance = useCallback(() => {
    if (count <= 1) return;
    setDirection(1);
    setCurrent((prev) => (prev + 1) % count);
  }, [count]);

  const goBack = useCallback(() => {
    if (count <= 1) return;
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + count) % count);
  }, [count]);

  const goTo = useCallback(
    (idx: number) => {
      setDirection(idx > current ? 1 : -1);
      setCurrent(idx);
    },
    [current]
  );

  useEffect(() => {
    if (current >= count && count > 0) setCurrent(0);
  }, [count, current]);

  useEffect(() => {
    if (paused || count <= 1) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
      return;
    }
    timerRef.current = setInterval(advance, INTERVAL);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [paused, count, advance]);

  const project = projects[current];

  const variants = {
    enter: (d: number) => ({
      x: d > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({
      x: d > 0 ? -300 : 300,
      opacity: 0,
    }),
  };

  return (
    <section id="home-projects" className="relative py-32">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px bg-gradient-to-r from-transparent via-malamaya-border to-transparent" />

      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" as const }}
          className="mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl mb-6">
            {content.title}
          </h2>
          {content.subtitle && (
            <p className="font-accent italic text-malamaya-light text-lg max-w-lg whitespace-pre-line">
              {content.subtitle}
            </p>
          )}
        </motion.div>

        {count > 0 && project ? (
          <div
            className="relative"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            {count > 1 && (
              <>
                <button
                  onClick={goBack}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-8 z-20 w-10 h-10 flex items-center justify-center rounded-full border border-malamaya-border/40 text-malamaya hover:text-maiba-red hover:border-maiba-red/40 transition-colors bg-midnight/60 backdrop-blur-sm"
                  aria-label="Previous project"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M10 3L5 8L10 13"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <button
                  onClick={advance}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-8 z-20 w-10 h-10 flex items-center justify-center rounded-full border border-malamaya-border/40 text-malamaya hover:text-maiba-red hover:border-maiba-red/40 transition-colors bg-midnight/60 backdrop-blur-sm"
                  aria-label="Next project"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M6 3L11 8L6 13"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </>
            )}

            <div className="overflow-hidden relative min-h-[280px] md:min-h-[240px]">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={project.id + "-" + current}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.45, ease: "easeInOut" }}
                  className="w-full"
                >
                  <Link
                    href={`/projects/${project.slug}`}
                    className="block group"
                  >
                    <div className="border border-malamaya-border/30 rounded-sm bg-midnight/50 p-6 md:p-8 relative overflow-hidden">
                      <motion.div
                        className="absolute inset-0 bg-maiba-red/[0.02]"
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      />

                      <div className="relative z-10 flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
                        {project.thumbnail && (
                          <div className="w-full sm:w-28 h-40 sm:h-28 md:w-36 md:h-36 flex-shrink-0 rounded-sm overflow-hidden bg-malamaya-border/20">
                            <Image
                              src={project.thumbnail}
                              alt=""
                              width={300}
                              height={300}
                              unoptimized={project.thumbnail.startsWith("http")}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-maiba-red text-xs tracking-widest uppercase mb-3">
                            Project
                          </p>
                          <h3 className="font-display text-xl md:text-2xl mb-3 group-hover:text-maiba-red transition-colors duration-500">
                            {project.title}
                          </h3>
                          <p className="text-malamaya text-sm leading-relaxed line-clamp-3 max-w-xl">
                            {project.excerpt}
                          </p>
                          <span className="inline-block mt-4 text-[10px] tracking-[0.3em] uppercase text-malamaya-border group-hover:text-maiba-red transition-colors">
                            View project →
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              </AnimatePresence>
            </div>

            {count > 1 && (
              <div className="mt-6 flex flex-col items-center gap-3">
                <div className="flex gap-2">
                  {projects.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => goTo(i)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        i === current
                          ? "bg-maiba-red w-6"
                          : "bg-malamaya-border hover:bg-malamaya"
                      }`}
                      aria-label={`Go to project ${i + 1}`}
                    />
                  ))}
                </div>

                {!paused && (
                  <div className="w-32 h-px bg-malamaya-border/30 overflow-hidden rounded-full">
                    <motion.div
                      key={`progress-${current}`}
                      className="h-full bg-maiba-red/50"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: INTERVAL / 1000, ease: "linear" }}
                    />
                  </div>
                )}

                <p className="text-malamaya-border text-[10px] tracking-widest">
                  {current + 1} / {count}
                </p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-malamaya text-sm text-center py-12">
            No projects published yet. The archive is gathering.
          </p>
        )}

        {count > 0 && (
          <div className="mt-10 text-center">
            <Link
              href="/projects"
              className="text-xs tracking-widest uppercase text-malamaya hover:text-maiba-red transition-colors"
            >
              View all projects →
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
