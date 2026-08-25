const sharp = require('sharp');
const fs = require('fs');

async function fixAdaptiveIcons() {
  // Adaptive icon dimensions (Total canvas vs safe-zone inner logo)
  const foregroundSizes = {
    'android/app/src/main/res/mipmap-mdpi/ic_launcher_foreground.png': [108, 72],
    'android/app/src/main/res/mipmap-hdpi/ic_launcher_foreground.png': [162, 108],
    'android/app/src/main/res/mipmap-xhdpi/ic_launcher_foreground.png': [216, 144],
    'android/app/src/main/res/mipmap-xxhdpi/ic_launcher_foreground.png': [324, 216],
    'android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_foreground.png': [432, 288],
  };

  const legacySizes = {
    'android/app/src/main/res/mipmap-mdpi': 48,
    'android/app/src/main/res/mipmap-hdpi': 72,
    'android/app/src/main/res/mipmap-xhdpi': 96,
    'android/app/src/main/res/mipmap-xxhdpi': 144,
    'android/app/src/main/res/mipmap-xxxhdpi': 192,
  };

  // 1. Generate foreground adaptive icons (with safe-zone centering)
  for (const [filePath, [canvasSize, innerSize]] of Object.entries(foregroundSizes)) {
    const resizedLogo = await sharp('public/logo.png')
      .resize(innerSize, innerSize, { fit: 'contain' })
      .png()
      .toBuffer();

    await sharp({
      create: {
        width: canvasSize,
        height: canvasSize,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
    .composite([{ input: resizedLogo, gravity: 'center' }])
    .png()
    .toFile(filePath);
  }

  // 2. Generate standard launcher and round launcher icons
  for (const [folder, size] of Object.entries(legacySizes)) {
    await sharp('public/logo.png')
      .resize(size, size, { fit: 'contain', background: { r: 9, g: 9, b: 11, alpha: 1 } })
      .png()
      .toFile(folder + '/ic_launcher.png');

    await sharp('public/logo.png')
      .resize(size, size, { fit: 'contain', background: { r: 9, g: 9, b: 11, alpha: 1 } })
      .png()
      .toFile(folder + '/ic_launcher_round.png');
  }

  // 3. Remove old vector drawable-v24/ic_launcher_foreground.xml so Android uses our mipmap foregrounds
  const oldVector = 'android/app/src/main/res/drawable-v24/ic_launcher_foreground.xml';
  if (fs.existsSync(oldVector)) {
    fs.unlinkSync(oldVector);
    console.log('Removed old vector ic_launcher_foreground.xml');
  }

  console.log('All Android Adaptive and Legacy icons updated to Bluebuff Games logo successfully!');
}

fixAdaptiveIcons().catch(console.error);
