const sharp = require('sharp');

async function generateFeatureGraphic() {
  const svg = Buffer.from(`
    <svg width="1024" height="500" viewBox="0 0 1024 500" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0f0c20" />
          <stop offset="50%" stop-color="#1e1b4b" />
          <stop offset="100%" stop-color="#09090b" />
        </linearGradient>
        <linearGradient id="glow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#6366f1" />
          <stop offset="100%" stop-color="#a855f7" />
        </linearGradient>
      </defs>
      
      <rect width="1024" height="500" fill="url(#bg)" />
      
      <circle cx="150" cy="100" r="180" fill="#4f46e5" opacity="0.15" filter="blur(40px)" />
      <circle cx="850" cy="400" r="220" fill="#9333ea" opacity="0.18" filter="blur(50px)" />

      <!-- Center Logo & Title -->
      <g transform="translate(512, 190)" text-anchor="middle">
        <text y="0" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="52" font-weight="900" fill="#ffffff" letter-spacing="2">BLUEBUFF GAMES</text>
        <text y="45" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="22" font-weight="600" fill="#818cf8" letter-spacing="1">1000+ FREE ONLINE BROWSER GAMES</text>
        <text y="85" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="16" font-weight="400" fill="#a1a1aa">Instant Play • No Downloads • Action, Racing, Puzzle &amp; IO Games</text>
      </g>

      <!-- Badges -->
      <g transform="translate(262, 340)">
        <rect x="0" y="0" width="150" height="44" rx="22" fill="#18181b" stroke="#3730a3" stroke-width="1.5" />
        <text x="75" y="27" font-family="sans-serif" font-size="15" font-weight="bold" fill="#c7d2fe" text-anchor="middle">⚡ Instant Play</text>

        <rect x="175" y="0" width="150" height="44" rx="22" fill="#18181b" stroke="#3730a3" stroke-width="1.5" />
        <text x="250" y="27" font-family="sans-serif" font-size="15" font-weight="bold" fill="#c7d2fe" text-anchor="middle">🔥 Daily XP</text>

        <rect x="350" y="0" width="150" height="44" rx="22" fill="#18181b" stroke="#3730a3" stroke-width="1.5" />
        <text x="425" y="27" font-family="sans-serif" font-size="15" font-weight="bold" fill="#c7d2fe" text-anchor="middle">🏆 Leaderboards</text>
      </g>
    </svg>
  `);

  await sharp(svg).png().toFile('public/feature-graphic.png');
  console.log('Feature graphic generated at public/feature-graphic.png');
}

generateFeatureGraphic().catch(console.error);
