"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LAMP_QUOTES } from "@/data/lamp-quotes";

function renderQuote(text: string) {
  const parts = text.split(/(\*'[^']*'\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("*'") && part.endsWith("'*")) {
      return (
        <em key={i} className="text-maiba-red">
          {part.slice(2, -2)}
        </em>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export default function Lamp() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || checking) return;

    setChecking(true);

    try {
      const res = await fetch("/api/auth/lamp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: input.trim() }),
      });
      const data = await res.json();

      if (data.valid && data.link) {
        setIsAdmin(true);
        setResponse("The light recognizes you. Welcome home, keeper.");
        setInput("");
        setTimeout(() => {
          const link = data.link as string;
          if (link.startsWith("http://") || link.startsWith("https://")) {
            window.location.href = link;
          } else {
            router.push(link);
          }
        }, 2000);
      } else {
        setIsAdmin(false);
        const idx = Math.floor(Math.random() * LAMP_QUOTES.length);
        setResponse(LAMP_QUOTES[idx]);
        setInput("");
      }
    } catch {
      setResponse("The flame flickers... try again.");
      setInput("");
    } finally {
      setChecking(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setResponse(null);
    setIsAdmin(false);
    setInput("");
  };

  return (
    <>
      {/* Lamp button */}
      <button
        onClick={() => setOpen(true)}
        className="group flex items-center gap-2 text-malamaya-border hover:text-maiba-red transition-colors duration-500"
      >
        <svg
          width="14"
          height="18"
          viewBox="0 0 14 18"
          fill="none"
          className="opacity-50 group-hover:opacity-100 transition-opacity"
        >
          <path
            d="M7 0C4 0 1.5 2.5 1.5 5.5C1.5 7.5 2.5 9.2 4 10.2V13C4 13.6 4.4 14 5 14H9C9.6 14 10 13.6 10 13V10.2C11.5 9.2 12.5 7.5 12.5 5.5C12.5 2.5 10 0 7 0Z"
            fill="currentColor"
            opacity="0.4"
          />
          <rect x="5" y="15" width="4" height="1" rx="0.5" fill="currentColor" opacity="0.3" />
          <rect x="5.5" y="17" width="3" height="1" rx="0.5" fill="currentColor" opacity="0.2" />
        </svg>
        <span className="text-[10px] tracking-[0.3em] uppercase">Lamp</span>
      </button>

      {/* Popup overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm flex items-center justify-center p-6"
            onClick={(e) => {
              if (e.target === e.currentTarget) handleClose();
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.4, ease: "easeOut" as const }}
              className="relative w-full max-w-md"
            >
              <button
                onClick={handleClose}
                className="absolute -top-8 right-0 text-malamaya hover:text-maiba-red text-xs tracking-widest uppercase transition-colors"
              >
                ✕ Close
              </button>

              <div className="border border-malamaya-border/40 bg-midnight/80 backdrop-blur-md rounded-sm p-8">
                <motion.div
                  className="absolute -top-16 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full pointer-events-none"
                  style={{
                    background: "radial-gradient(circle, #f23d3d11, transparent 70%)",
                  }}
                  animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.1, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" as const }}
                />

                <p className="font-display text-xl md:text-2xl text-center mb-8 text-foreground">
                  Do you know the light?
                </p>

                <form onSubmit={handleSubmit} className="mb-6">
                  <div className="relative">
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      disabled={checking || isAdmin}
                      className="w-full bg-transparent border-b border-malamaya-border px-0 py-3 text-foreground focus:border-maiba-red focus:outline-none transition-colors placeholder:text-malamaya-border/60 text-center disabled:opacity-50"
                      placeholder="Speak..."
                      autoComplete="off"
                    />
                  </div>
                  <motion.button
                    type="submit"
                    disabled={checking || isAdmin}
                    whileHover={!checking && !isAdmin ? { scale: 1.02 } : {}}
                    whileTap={!checking && !isAdmin ? { scale: 0.98 } : {}}
                    className="mt-6 w-full text-xs tracking-[0.3em] uppercase text-malamaya hover:text-maiba-red transition-colors py-3 border border-malamaya-border/30 rounded-sm hover:border-maiba-red/30 disabled:opacity-50"
                  >
                    {checking ? "Reading the flame..." : "Offer your answer"}
                  </motion.button>
                </form>

                <AnimatePresence mode="wait">
                  {response && (
                    <motion.div
                      key={response}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.6 }}
                      className={`pt-6 border-t border-malamaya-border/20 ${
                        isAdmin ? "text-center" : ""
                      }`}
                    >
                      {isAdmin ? (
                        <div>
                          <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.8, ease: "easeOut" as const }}
                            className="text-maiba-red text-3xl mb-4"
                          >
                            🕯️
                          </motion.div>
                          <p className="font-display text-lg text-maiba-red mb-2">
                            {response}
                          </p>
                          <p className="text-malamaya text-xs tracking-widest uppercase mt-4">
                            Entering the sanctum...
                          </p>
                        </div>
                      ) : (
                        <p className="text-malamaya-light text-sm leading-7 font-accent italic">
                          {renderQuote(response)}
                        </p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
