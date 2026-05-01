"use client";

import HeroSection from "@/components/sections/HeroSection";
import AboutSection from "@/components/sections/AboutSection";
import ArchiveSection from "@/components/sections/ArchiveSection";
import ContactSection from "@/components/sections/ContactSection";

export default function Home() {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Maiba Studio",
    url: "https://maiba.studio",
    logo: "https://maiba.studio/logo.svg",
    founder: {
      "@type": "Person",
      name: "EL Bonuan",
    },
    description:
      "A cultural deviant creative studio working across art, AI, Web3, and interior space.",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <HeroSection />
      <AboutSection />
      <ArchiveSection />
      <ContactSection />
    </>
  );
}
