"use client";

import SiX from "@icons-pack/react-simple-icons/icons/SiX.mjs";
import SiInstagram from "@icons-pack/react-simple-icons/icons/SiInstagram.mjs";
import SiFacebook from "@icons-pack/react-simple-icons/icons/SiFacebook.mjs";
import SiGithub from "@icons-pack/react-simple-icons/icons/SiGithub.mjs";
import SiYoutube from "@icons-pack/react-simple-icons/icons/SiYoutube.mjs";
import SiTiktok from "@icons-pack/react-simple-icons/icons/SiTiktok.mjs";
import SiDiscord from "@icons-pack/react-simple-icons/icons/SiDiscord.mjs";
import SiTwitch from "@icons-pack/react-simple-icons/icons/SiTwitch.mjs";
import SiReddit from "@icons-pack/react-simple-icons/icons/SiReddit.mjs";
import SiPinterest from "@icons-pack/react-simple-icons/icons/SiPinterest.mjs";
import SiDribbble from "@icons-pack/react-simple-icons/icons/SiDribbble.mjs";
import SiBehance from "@icons-pack/react-simple-icons/icons/SiBehance.mjs";
import SiDevdotto from "@icons-pack/react-simple-icons/icons/SiDevdotto.mjs";
import SiMedium from "@icons-pack/react-simple-icons/icons/SiMedium.mjs";
import SiThreads from "@icons-pack/react-simple-icons/icons/SiThreads.mjs";
import SiBluesky from "@icons-pack/react-simple-icons/icons/SiBluesky.mjs";
import SiMastodon from "@icons-pack/react-simple-icons/icons/SiMastodon.mjs";
import SiTelegram from "@icons-pack/react-simple-icons/icons/SiTelegram.mjs";
import SiWhatsapp from "@icons-pack/react-simple-icons/icons/SiWhatsapp.mjs";
import SiSpotify from "@icons-pack/react-simple-icons/icons/SiSpotify.mjs";
import SiPatreon from "@icons-pack/react-simple-icons/icons/SiPatreon.mjs";
import SiFigma from "@icons-pack/react-simple-icons/icons/SiFigma.mjs";
import SiNotion from "@icons-pack/react-simple-icons/icons/SiNotion.mjs";
import SiSubstack from "@icons-pack/react-simple-icons/icons/SiSubstack.mjs";
import SiEtsy from "@icons-pack/react-simple-icons/icons/SiEtsy.mjs";
import SiGumroad from "@icons-pack/react-simple-icons/icons/SiGumroad.mjs";
import SiFarcaster from "@icons-pack/react-simple-icons/icons/SiFarcaster.mjs";
import { Mail, Globe, ExternalLink } from "lucide-react";

function LinkedInIcon({ size = 24, className, color }: { size?: number; className?: string; color?: string }) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={color || "currentColor"}
      className={className}
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

type IconComponent = React.ComponentType<{ size?: number; className?: string; color?: string }>;

export interface SocialIconDef {
  id: string;
  label: string;
  component: IconComponent;
}

export const SOCIAL_ICON_PRESETS: SocialIconDef[] = [
  { id: "x", label: "X (Twitter)", component: SiX },
  { id: "instagram", label: "Instagram", component: SiInstagram },
  { id: "facebook", label: "Facebook", component: SiFacebook },
  { id: "github", label: "GitHub", component: SiGithub },
  { id: "youtube", label: "YouTube", component: SiYoutube },
  { id: "tiktok", label: "TikTok", component: SiTiktok },
  { id: "discord", label: "Discord", component: SiDiscord },
  { id: "twitch", label: "Twitch", component: SiTwitch },
  { id: "reddit", label: "Reddit", component: SiReddit },
  { id: "pinterest", label: "Pinterest", component: SiPinterest },
  { id: "dribbble", label: "Dribbble", component: SiDribbble },
  { id: "behance", label: "Behance", component: SiBehance },
  { id: "devto", label: "DEV.to", component: SiDevdotto },
  { id: "medium", label: "Medium", component: SiMedium },
  { id: "threads", label: "Threads", component: SiThreads },
  { id: "bluesky", label: "Bluesky", component: SiBluesky },
  { id: "mastodon", label: "Mastodon", component: SiMastodon },
  { id: "farcaster", label: "Farcaster", component: SiFarcaster },
  { id: "telegram", label: "Telegram", component: SiTelegram },
  { id: "whatsapp", label: "WhatsApp", component: SiWhatsapp },
  { id: "spotify", label: "Spotify", component: SiSpotify },
  { id: "patreon", label: "Patreon", component: SiPatreon },
  { id: "figma", label: "Figma", component: SiFigma },
  { id: "notion", label: "Notion", component: SiNotion },
  { id: "substack", label: "Substack", component: SiSubstack },
  { id: "etsy", label: "Etsy", component: SiEtsy },
  { id: "gumroad", label: "Gumroad", component: SiGumroad },
  { id: "linkedin", label: "LinkedIn", component: LinkedInIcon },
  { id: "email", label: "Email", component: Mail as unknown as IconComponent },
  { id: "website", label: "Website", component: Globe as unknown as IconComponent },
];

export function getIconById(id: string): SocialIconDef | undefined {
  return SOCIAL_ICON_PRESETS.find((p) => p.id === id);
}

export function SocialIconRenderer({
  iconId,
  customIconUrl,
  size = 18,
  className,
}: {
  iconId: string;
  customIconUrl?: string;
  size?: number;
  className?: string;
}) {
  if (iconId === "custom" && customIconUrl) {
    return (
      <img
        src={customIconUrl}
        alt=""
        className={className}
        style={{ width: size, height: size }}
      />
    );
  }

  const preset = getIconById(iconId);
  if (preset) {
    const Icon = preset.component;
    return <Icon size={size} className={className} color="currentColor" />;
  }

  return <ExternalLink size={size} className={className} />;
}
