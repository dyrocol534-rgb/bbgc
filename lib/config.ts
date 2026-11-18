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

  // Feature Flags
  // Controls visibility of the "Daily Rewards & Drops" notification prompt pill
  showNotificationPrompt: process.env.NEXT_PUBLIC_SHOW_NOTIFICATION_PROMPT === "true" || false,

  // Advertising Configuration (Managed directly here, no env variables needed)
  ads: {
    enabled: true,
    aadsSidebarUnitId: "2462468",
    aadsBannerUnitId: "2462468",
    fallbackText: "A Product from",
    fallbackUrl: "https://bluebuff.in",
  },
} as const;

export default SITE_CONFIG;
