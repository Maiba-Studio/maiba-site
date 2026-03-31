"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import GrainOverlay from "@/components/GrainOverlay";
import CursorTrail from "@/components/CursorTrail";

export default function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <main className="flex-1">{children}</main>;
  }

  return (
    <>
      <GrainOverlay />
      <CursorTrail />
      <Navigation />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
