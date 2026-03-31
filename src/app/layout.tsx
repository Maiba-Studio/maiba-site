import type { Metadata } from "next";
import { Inter, Playfair_Display, DM_Serif_Display } from "next/font/google";
import "./globals.css";
import SiteChrome from "@/components/SiteChrome";

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
  metadataBase: new URL("https://maiba.studio"),
  title: {
    default: "Maiba Studio — Deviant Made. Culture-coded. Artist-led.",
    template: "%s | Maiba Studio",
  },
  description:
    "Maiba Studio is a cultural deviant creative studio working across art, AI, Web3, and interior space. Founded by EL Bonuan — a ritual, a rebellion, a creative sanctuary.",
  keywords: [
    "Maiba Studio",
    "creative studio",
    "art direction",
    "AI art",
    "Web3",
    "cultural deviant",
    "EL Bonuan",
    "Gamotwox",
    "digital art",
    "creative technology",
    "interior design",
    "Maiba",
  ],
  authors: [{ name: "EL Bonuan", url: "https://maiba.studio" }],
  creator: "Maiba Studio",
  publisher: "Maiba Studio",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://maiba.studio",
    siteName: "Maiba Studio",
    title: "Maiba Studio — Deviant Made. Culture-coded. Artist-led.",
    description:
      "A cultural deviant creative studio working across art, AI, Web3, and interior space. Founded by EL Bonuan.",
    images: [
      {
        url: "/images/og-image-placeholder.svg",
        width: 1200,
        height: 630,
        alt: "Maiba Studio — Deviant Made. Culture-coded. Artist-led.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Maiba Studio — Deviant Made. Culture-coded. Artist-led.",
    description:
      "A cultural deviant creative studio working across art, AI, Web3, and interior space.",
    images: ["/images/og-image-placeholder.svg"],
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.svg",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
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
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
