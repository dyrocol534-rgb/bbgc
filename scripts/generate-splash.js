const sharp = require('sharp');
const fs = require('fs');

async function createSplashScreens() {
  const portraitSizes = {
    'android/app/src/main/res/drawable/splash.png': [1080, 1920],
    'android/app/src/main/res/drawable-port-mdpi/splash.png': [320, 480],
    'android/app/src/main/res/drawable-port-hdpi/splash.png': [480, 800],
    'android/app/src/main/res/drawable-port-xhdpi/splash.png': [720, 1280],
    'android/app/src/main/res/drawable-port-xxhdpi/splash.png': [1080, 1920],
    'android/app/src/main/res/drawable-port-xxxhdpi/splash.png': [1440, 2560],
  };

  const landscapeSizes = {
    'android/app/src/main/res/drawable-land-mdpi/splash.png': [480, 320],
    'android/app/src/main/res/drawable-land-hdpi/splash.png': [800, 480],
    'android/app/src/main/res/drawable-land-xhdpi/splash.png': [1280, 720],
    'android/app/src/main/res/drawable-land-xxhdpi/splash.png': [1920, 1080],
    'android/app/src/main/res/drawable-land-xxxhdpi/splash.png': [2560, 1440],
  };

  // Generate Portrait Splashes
  for (const [filePath, [w, h]] of Object.entries(portraitSizes)) {
    const logoSize = Math.min(Math.round(w * 0.38), 320);
    const resizedLogo = await sharp('public/logo.png')
      .resize(logoSize, logoSize, { fit: 'contain' })
      .png()
      .toBuffer();

    const titleY = Math.round(h * 0.5 + logoSize * 0.65);
    const subY = titleY + Math.max(Math.round(w * 0.04), 16);
    const titleSize = Math.max(Math.round(w * 0.05), 18);
    const subSize = Math.max(Math.round(w * 0.026), 11);

    const svgText = Buffer.from(`
      <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="glow" cx="50%" cy="46%" r="35%">
            <stop offset="0%" stop-color="#4f46e5" stop-opacity="0.2" />
            <stop offset="100%" stop-color="#09090b" stop-opacity="0" />
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="#09090b" />
        <rect width="100%" height="100%" fill="url(#glow)" />
        <text x="50%" y="${titleY}" 
              font-family="system-ui, -apple-system, sans-serif" 
              font-size="${titleSize}" 
              font-weight="900" 
              letter-spacing="3" 
              fill="#ffffff" 
              text-anchor="middle">BLUEBUFF GAMES</text>
        <text x="50%" y="${subY}" 
              font-family="system-ui, -apple-system, sans-serif" 
              font-size="${subSize}" 
              font-weight="600" 
              letter-spacing="1.5" 
              fill="#818cf8" 
              text-anchor="middle">PLAY 1000+ FREE GAMES</text>
      </svg>
    `);

    const dir = filePath.substring(0, filePath.lastIndexOf('/'));
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    await sharp(svgText)
      .composite([{ input: resizedLogo, gravity: 'center' }])
      .png()
      .toFile(filePath);
  }

  // Generate Landscape Splashes
  for (const [filePath, [w, h]] of Object.entries(landscapeSizes)) {
    const logoSize = Math.min(Math.round(h * 0.35), 260);
    const resizedLogo = await sharp('public/logo.png')
      .resize(logoSize, logoSize, { fit: 'contain' })
      .png()
      .toBuffer();

    const titleY = Math.round(h * 0.5 + logoSize * 0.65);
    const titleSize = Math.max(Math.round(h * 0.06), 16);

    const svgText = Buffer.from(`
      <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="glow" cx="50%" cy="44%" r="35%">
            <stop offset="0%" stop-color="#4f46e5" stop-opacity="0.2" />
            <stop offset="100%" stop-color="#09090b" stop-opacity="0" />
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="#09090b" />
        <rect width="100%" height="100%" fill="url(#glow)" />
        <text x="50%" y="${titleY}" 
              font-family="system-ui, -apple-system, sans-serif" 
              font-size="${titleSize}" 
              font-weight="900" 
              letter-spacing="3" 
              fill="#ffffff" 
              text-anchor="middle">BLUEBUFF GAMES</text>
      </svg>
    `);

    const dir = filePath.substring(0, filePath.lastIndexOf('/'));
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    await sharp(svgText)
      .composite([{ input: resizedLogo, gravity: 'center' }])
      .png()
      .toFile(filePath);
  }

  console.log('All custom splash screens replaced successfully');
}

createSplashScreens().catch(console.error);
