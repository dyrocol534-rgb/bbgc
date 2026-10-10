/**
 * Centralized Application & Site Configuration
 * Use this everywhere instead of repeating process.env fallbacks.
 */
export const SITE_CONFIG = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || "Bluebuff Games",
  shortName: "Bluebuff",
  description: "Play 1000+ free online games instantly – no download, no install required.",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://games.bluebuff.in").replace(/\/+$/, ""),
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "crew.bluebuffofficial@gmail.com",
  adminEmail: process.env.ADMIN_EMAIL || "tusharkantanayak713@gmail.com",
} as const;

export default SITE_CONFIG;
