const sharp = require('sharp');
const fs = require('fs');

async function generateScreenshots() {
  if (!fs.existsSync('public/screenshots')) {
    fs.mkdirSync('public/screenshots', { recursive: true });
  }

  // Desktop SVG mockup (1280x720)
  const desktopSvg = Buffer.from(`
    <svg width="1280" height="720" viewBox="0 0 1280 720" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#09090b" />
          <stop offset="50%" stop-color="#13111c" />
          <stop offset="100%" stop-color="#09090b" />
        </linearGradient>
        <linearGradient id="cardGlow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#6366f1" />
          <stop offset="100%" stop-color="#a855f7" />
        </linearGradient>
      </defs>
      
      <rect width="1280" height="720" fill="url(#bg)" />
      
      <rect width="1280" height="64" fill="#18181b" opacity="0.9" />
      <line x1="0" y1="64" x2="1280" y2="64" stroke="#27272a" stroke-width="1" />
      
      <text x="48" y="40" font-family="sans-serif" font-size="20" font-weight="bold" fill="#818cf8">⚡ BLUEBUFF GAMES</text>
      
      <rect x="350" y="16" width="580" height="36" rx="10" fill="#27272a" />
      <text x="380" y="39" font-family="sans-serif" font-size="13" fill="#71717a">Search 1000+ free online games...</text>
      
      <rect x="48" y="90" width="1184" height="220" rx="20" fill="url(#cardGlow)" opacity="0.9" />
      <text x="88" y="160" font-family="sans-serif" font-size="36" font-weight="bold" fill="#ffffff">Play Instant Free Games</text>
      <text x="88" y="195" font-family="sans-serif" font-size="16" fill="#e0e7ff">No Downloads • Instant Play • Play on PC, Mobile &amp; Tablet</text>
      <rect x="88" y="225" width="150" height="44" rx="12" fill="#ffffff" />
      <text x="122" y="252" font-family="sans-serif" font-size="15" font-weight="bold" fill="#4f46e5">Play Now</text>
      
      <text x="48" y="350" font-family="sans-serif" font-size="20" font-weight="bold" fill="#ffffff">Featured Games</text>
      
      <g transform="translate(48, 370)">
        <rect x="0" y="0" width="180" height="240" rx="16" fill="#1f1f23" stroke="#27272a" />
        <rect x="12" y="12" width="156" height="140" rx="12" fill="#312e81" />
        <text x="16" y="180" font-family="sans-serif" font-size="14" font-weight="bold" fill="#ffffff">Action Rush</text>
        <text x="16" y="200" font-family="sans-serif" font-size="11" fill="#9ca3af">★ 4.9 • Action</text>
        
        <rect x="200" y="0" width="180" height="240" rx="16" fill="#1f1f23" stroke="#27272a" />
        <rect x="212" y="12" width="156" height="140" rx="12" fill="#581c87" />
        <text x="216" y="180" font-family="sans-serif" font-size="14" font-weight="bold" fill="#ffffff">Speed Racer 3D</text>
        <text x="216" y="200" font-family="sans-serif" font-size="11" fill="#9ca3af">★ 4.8 • Racing</text>

        <rect x="400" y="0" width="180" height="240" rx="16" fill="#1f1f23" stroke="#27272a" />
        <rect x="412" y="12" width="156" height="140" rx="12" fill="#065f46" />
        <text x="416" y="180" font-family="sans-serif" font-size="14" font-weight="bold" fill="#ffffff">Puzzle Quest</text>
        <text x="416" y="200" font-family="sans-serif" font-size="11" fill="#9ca3af">★ 4.7 • Puzzle</text>

        <rect x="600" y="0" width="180" height="240" rx="16" fill="#1f1f23" stroke="#27272a" />
        <rect x="612" y="12" width="156" height="140" rx="12" fill="#9a3412" />
        <text x="616" y="180" font-family="sans-serif" font-size="14" font-weight="bold" fill="#ffffff">Sniper Strike</text>
        <text x="616" y="200" font-family="sans-serif" font-size="11" fill="#9ca3af">★ 4.9 • Shooter</text>

        <rect x="800" y="0" width="180" height="240" rx="16" fill="#1f1f23" stroke="#27272a" />
        <rect x="812" y="12" width="156" height="140" rx="12" fill="#1e1b4b" />
        <text x="816" y="180" font-family="sans-serif" font-size="14" font-weight="bold" fill="#ffffff">Space Odyssey</text>
        <text x="816" y="200" font-family="sans-serif" font-size="11" fill="#9ca3af">★ 4.6 • Arcade</text>

        <rect x="1000" y="0" width="180" height="240" rx="16" fill="#1f1f23" stroke="#27272a" />
        <rect x="1012" y="12" width="156" height="140" rx="12" fill="#831843" />
        <text x="1016" y="180" font-family="sans-serif" font-size="14" font-weight="bold" fill="#ffffff">Kingdom Clash</text>
        <text x="1016" y="200" font-family="sans-serif" font-size="11" fill="#9ca3af">★ 4.8 • Strategy</text>
      </g>
    </svg>
  `);

  await sharp(desktopSvg).png().toFile('public/screenshots/desktop.png');

  // Mobile SVG mockup (750x1334)
  const mobileSvg = Buffer.from(`
    <svg width="750" height="1334" viewBox="0 0 750 1334" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="mobileBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#09090b" />
          <stop offset="50%" stop-color="#13111c" />
          <stop offset="100%" stop-color="#09090b" />
        </linearGradient>
        <linearGradient id="heroGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#4f46e5" />
          <stop offset="100%" stop-color="#9333ea" />
        </linearGradient>
      </defs>

      <rect width="750" height="1334" fill="url(#mobileBg)" />

      <rect width="750" height="100" fill="#18181b" opacity="0.95" />
      <text x="32" y="62" font-family="sans-serif" font-size="28" font-weight="bold" fill="#818cf8">⚡ BLUEBUFF</text>

      <rect x="32" y="130" width="686" height="280" rx="24" fill="url(#heroGrad)" />
      <text x="64" y="210" font-family="sans-serif" font-size="36" font-weight="bold" fill="#ffffff">Play 1000+ Free Games</text>
      <text x="64" y="250" font-family="sans-serif" font-size="20" fill="#e0e7ff">Instant Browser Play • No Download</text>
      <rect x="64" y="290" width="200" height="60" rx="16" fill="#ffffff" />
      <text x="110" y="328" font-family="sans-serif" font-size="20" font-weight="bold" fill="#4f46e5">Start Playing</text>

      <text x="32" y="460" font-family="sans-serif" font-size="28" font-weight="bold" fill="#ffffff">Popular Categories</text>
      
      <g transform="translate(32, 490)">
        <rect x="0" y="0" width="150" height="50" rx="25" fill="#312e81" />
        <text x="40" y="32" font-family="sans-serif" font-size="18" font-weight="bold" fill="#ffffff">Action</text>

        <rect x="170" y="0" width="150" height="50" rx="25" fill="#1f2937" />
        <text x="210" y="32" font-family="sans-serif" font-size="18" font-weight="bold" fill="#d1d5db">Racing</text>

        <rect x="340" y="0" width="150" height="50" rx="25" fill="#1f2937" />
        <text x="380" y="32" font-family="sans-serif" font-size="18" font-weight="bold" fill="#d1d5db">Puzzle</text>

        <rect x="510" y="0" width="150" height="50" rx="25" fill="#1f2937" />
        <text x="545" y="32" font-family="sans-serif" font-size="18" font-weight="bold" fill="#d1d5db">Shooter</text>
      </g>

      <text x="32" y="590" font-family="sans-serif" font-size="28" font-weight="bold" fill="#ffffff">Featured Games</text>

      <g transform="translate(32, 620)">
        <rect x="0" y="0" width="325" height="300" rx="20" fill="#18181b" stroke="#27272a" />
        <rect x="16" y="16" width="293" height="190" rx="16" fill="#3730a3" />
        <text x="24" y="240" font-family="sans-serif" font-size="22" font-weight="bold" fill="#ffffff">Action Rush</text>
        <text x="24" y="270" font-family="sans-serif" font-size="16" fill="#9ca3af">★ 4.9 • Action</text>

        <rect x="361" y="0" width="325" height="300" rx="20" fill="#18181b" stroke="#27272a" />
        <rect x="377" y="16" width="293" height="190" rx="16" fill="#581c87" />
        <text x="385" y="240" font-family="sans-serif" font-size="22" font-weight="bold" fill="#ffffff">Speed Racer 3D</text>
        <text x="385" y="270" font-family="sans-serif" font-size="16" fill="#9ca3af">★ 4.8 • Racing</text>

        <rect x="0" y="330" width="325" height="300" rx="20" fill="#18181b" stroke="#27272a" />
        <rect x="16" y="346" width="293" height="190" rx="16" fill="#065f46" />
        <text x="24" y="570" font-family="sans-serif" font-size="22" font-weight="bold" fill="#ffffff">Puzzle Quest</text>
        <text x="24" y="600" font-family="sans-serif" font-size="16" fill="#9ca3af">★ 4.7 • Puzzle</text>

        <rect x="361" y="330" width="325" height="300" rx="20" fill="#18181b" stroke="#27272a" />
        <rect x="377" y="346" width="293" height="190" rx="16" fill="#9a3412" />
        <text x="385" y="570" font-family="sans-serif" font-size="22" font-weight="bold" fill="#ffffff">Sniper Strike</text>
        <text x="385" y="600" font-family="sans-serif" font-size="16" fill="#9ca3af">★ 4.9 • Shooter</text>
      </g>
    </svg>
  `);

  await sharp(mobileSvg).png().toFile('public/screenshots/mobile.png');

  console.log('Screenshots generated successfully');
}

generateScreenshots().catch(console.error);
