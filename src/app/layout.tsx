import type { Metadata } from "next";
import { Inter, Playfair_Display, DM_Serif_Display } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import GrainOverlay from "@/components/GrainOverlay";
import CursorTrail from "@/components/CursorTrail";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

// Fallback for Recoleta Bold — swap to localFont once you have Recoleta-Bold.woff2
// import localFont from "next/font/local";
// const recoleta = localFont({
//   src: "../fonts/Recoleta-Bold.woff2",
//   variable: "--font-recoleta",
//   display: "swap",
//   weight: "700",
// });
const displayFont = DM_Serif_Display({
  variable: "--font-recoleta",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Maiba Studio — Deviant Made. Culture-coded. Artist-led.",
  description:
    "Maiba Studio is a ritual, a rebellion, a creative sanctuary. A cultural deviant studio working across art, AI, Web3, and interior space.",
  keywords: ["Maiba Studio", "creative studio", "art", "AI", "Web3", "deviant", "culture"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} ${displayFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-midnight text-foreground">
        <GrainOverlay />
        <CursorTrail />
        <Navigation />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
