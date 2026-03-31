"use client";

import { useState, useEffect } from "react";

export default function MothModeToggle() {
  const [mothMode, setMothMode] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("moth-mode", mothMode);
  }, [mothMode]);

  return (
    <button
      onClick={() => setMothMode(!mothMode)}
      className="text-xs tracking-widest uppercase text-malamaya hover:text-maiba-red transition-colors duration-300 flex items-center gap-2"
      aria-label="Toggle moth mode"
      title="Moth Mode: reduced contrast for light sensitivity"
    >
      <svg width="14" height="14" viewBox="0 0 100 100" fill="none" className="opacity-60">
        <path d="M50 45 C35 20, 10 15, 8 40 C6 55, 25 55, 50 48Z" fill="currentColor" />
        <path d="M50 45 C65 20, 90 15, 92 40 C94 55, 75 55, 50 48Z" fill="currentColor" />
        <ellipse cx="50" cy="50" rx="2" ry="10" fill="currentColor" />
      </svg>
      {mothMode ? "Moth" : "Dark"}
    </button>
  );
}
