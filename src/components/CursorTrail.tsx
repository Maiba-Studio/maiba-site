"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Particle {
  id: number;
  x: number;
  y: number;
}

export default function CursorTrail() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    let lastTime = 0;
    const handleMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastTime < 50) return;
      lastTime = now;

      setCounter((c) => c + 1);
      setParticles((prev) => {
        const next = [
          ...prev.slice(-8),
          { id: counter + now, x: e.clientX, y: e.clientY },
        ];
        return next;
      });
    };

    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [counter]);

  useEffect(() => {
    const interval = setInterval(() => {
      setParticles((prev) => prev.slice(1));
    }, 120);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[9997]" aria-hidden="true">
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0.6, scale: 1 }}
            animate={{ opacity: 0, scale: 0.3 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute w-3 h-3 rounded-full"
            style={{
              left: p.x - 6,
              top: p.y - 6,
              background: "radial-gradient(circle, #f23d3d44, transparent)",
              boxShadow: "0 0 8px #f23d3d33",
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
