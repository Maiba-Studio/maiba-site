"use client";

import { motion } from "framer-motion";

interface MothSvgProps {
  className?: string;
  size?: number;
  color?: string;
  animate?: boolean;
}

export default function MothSvg({
  className = "",
  size = 120,
  color = "#f23d3d",
  animate = true,
}: MothSvgProps) {
  const svg = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M50 45 C35 20, 10 15, 8 40 C6 55, 25 55, 50 48Z" fill={color} opacity="0.15" stroke={color} strokeWidth="0.5" />
      <path d="M50 45 C65 20, 90 15, 92 40 C94 55, 75 55, 50 48Z" fill={color} opacity="0.15" stroke={color} strokeWidth="0.5" />
      <path d="M50 52 C30 50, 15 65, 22 78 C28 88, 42 75, 50 55Z" fill={color} opacity="0.1" stroke={color} strokeWidth="0.5" />
      <path d="M50 52 C70 50, 85 65, 78 78 C72 88, 58 75, 50 55Z" fill={color} opacity="0.1" stroke={color} strokeWidth="0.5" />
      <ellipse cx="50" cy="50" rx="2" ry="10" fill={color} opacity="0.4" />
      <path d="M49 40 C45 30, 38 25, 35 22" stroke={color} strokeWidth="0.5" opacity="0.5" fill="none" />
      <path d="M51 40 C55 30, 62 25, 65 22" stroke={color} strokeWidth="0.5" opacity="0.5" fill="none" />
      <circle cx="50" cy="44" r="2" fill={color} opacity="0.6" />
    </svg>
  );

  if (!animate) {
    return <div className={className}>{svg}</div>;
  }

  return (
    <motion.div
      className={className}
      animate={{
        scaleX: [1, 0.88, 1, 0.9, 1],
        y: [0, -4, -6, -2, 0],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut" as const,
      }}
    >
      {svg}
    </motion.div>
  );
}
