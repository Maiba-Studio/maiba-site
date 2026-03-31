# Maiba Studio

**Deviant Made. Culture-coded. Artist-led.**

The official website for Maiba Studio — a ritual, a rebellion, a creative sanctuary.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS v4
- **Animations:** Framer Motion
- **Typography:** DM Serif Display (headers), Inter (body), Playfair Display (accent italic)
- **Deployment:** Vercel-ready

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing — moth animation, hero, scroll cue |
| `/about` | Origin story, The Eye, Founder, Studio Ethos |
| `/archive` | Field Notes — broken grid journal entries |
| `/contact` | Join the Cult — contact form with candle submit |
| `/ritual` | Secret manifesto (unlocked via Konami code in footer) |

## Features

- Dark mode first (#141414 Midnight Black, #f23d3d Maiba Red)
- Grain texture overlay + vignette
- Moth cursor trail
- Moth Mode toggle (accessibility: reduced contrast, indigo hue)
- Konami code easter egg (↑↑↓↓←→←→) in footer
- Flickering candle scroll cue
- EL Bonuan ↔ Gamotwox identity switch

## Fonts

The display font defaults to DM Serif Display (Google Fonts). To use Recoleta Bold:

1. Place `Recoleta-Bold.woff2` in `src/fonts/`
2. Uncomment the `localFont` import in `src/app/layout.tsx`
3. Replace `displayFont` with `recoleta`
