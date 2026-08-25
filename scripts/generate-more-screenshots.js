const sharp = require('sharp');
const fs = require('fs');

async function generateMoreScreenshots() {
  if (!fs.existsSync('public/screenshots')) {
    fs.mkdirSync('public/screenshots', { recursive: true });
  }

  // 1. Leaderboard Screenshot (750x1334)
  const leaderboardSvg = Buffer.from(`
    <svg width="750" height="1334" viewBox="0 0 750 1334" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#09090b" />
          <stop offset="50%" stop-color="#12101f" />
          <stop offset="100%" stop-color="#09090b" />
        </linearGradient>
        <linearGradient id="top1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fbbf24" />
          <stop offset="100%" stop-color="#d97706" />
        </linearGradient>
      </defs>

      <rect width="750" height="1334" fill="url(#bg)" />

      <!-- Top Bar -->
      <rect width="750" height="100" fill="#18181b" opacity="0.95" />
      <text x="40" y="64" font-family="sans-serif" font-size="28" font-weight="bold" fill="#818cf8">🏆 GLOBAL LEADERBOARD</text>

      <!-- Banner Header -->
      <g transform="translate(40, 130)">
        <rect width="670" height="220" rx="24" fill="url(#top1)" opacity="0.9" />
        <text x="40" y="65" font-family="sans-serif" font-size="34" font-weight="900" fill="#000000">👑 Top Champions</text>
        <text x="40" y="105" font-family="sans-serif" font-size="18" font-weight="600" fill="#451a03">Compete with thousands of players worldwide!</text>
        
        <rect x="40" y="135" width="220" height="50" rx="14" fill="#000000" />
        <text x="80" y="167" font-family="sans-serif" font-size="18" font-weight="bold" fill="#fbbf24">Season 1 Active</text>
      </g>

      <!-- Rankings List -->
      <g transform="translate(40, 380)">
        <!-- Rank 1 -->
        <rect width="670" height="110" rx="20" fill="#1f1d2e" stroke="#fbbf24" stroke-width="2" />
        <text x="35" y="68" font-family="sans-serif" font-size="28" font-weight="bold" fill="#fbbf24">🥇 1</text>
        <circle cx="150" cy="55" r="32" fill="#d97706" />
        <text x="142" y="63" font-family="sans-serif" font-size="24" font-weight="bold" fill="#ffffff">A</text>
        <text x="205" y="52" font-family="sans-serif" font-size="22" font-weight="bold" fill="#ffffff">Alex_ProGamer</text>
        <text x="205" y="80" font-family="sans-serif" font-size="16" fill="#9ca3af">🔥 45 Day Streak</text>
        <text x="530" y="64" font-family="sans-serif" font-size="20" font-weight="bold" fill="#fbbf24">124,500 XP</text>

        <!-- Rank 2 -->
        <g transform="translate(0, 130)">
          <rect width="670" height="110" rx="20" fill="#18181b" stroke="#3f3f46" stroke-width="1.5" />
          <text x="35" y="68" font-family="sans-serif" font-size="28" font-weight="bold" fill="#e2e8f0">🥈 2</text>
          <circle cx="150" cy="55" r="32" fill="#4f46e5" />
          <text x="142" y="63" font-family="sans-serif" font-size="24" font-weight="bold" fill="#ffffff">S</text>
          <text x="205" y="52" font-family="sans-serif" font-size="22" font-weight="bold" fill="#ffffff">ShadowKnight</text>
          <text x="205" y="80" font-family="sans-serif" font-size="16" fill="#9ca3af">🔥 32 Day Streak</text>
          <text x="530" y="64" font-family="sans-serif" font-size="20" font-weight="bold" fill="#818cf8">98,200 XP</text>
        </g>

        <!-- Rank 3 -->
        <g transform="translate(0, 260)">
          <rect width="670" height="110" rx="20" fill="#18181b" stroke="#3f3f46" stroke-width="1.5" />
          <text x="35" y="68" font-family="sans-serif" font-size="28" font-weight="bold" fill="#ca8a04">🥉 3</text>
          <circle cx="150" cy="55" r="32" fill="#059669" />
          <text x="142" y="63" font-family="sans-serif" font-size="24" font-weight="bold" fill="#ffffff">V</text>
          <text x="205" y="52" font-family="sans-serif" font-size="22" font-weight="bold" fill="#ffffff">ViperStrike</text>
          <text x="205" y="80" font-family="sans-serif" font-size="16" fill="#9ca3af">🔥 28 Day Streak</text>
          <text x="530" y="64" font-family="sans-serif" font-size="20" font-weight="bold" fill="#34d399">87,400 XP</text>
        </g>

        <!-- Rank 4 -->
        <g transform="translate(0, 390)">
          <rect width="670" height="110" rx="20" fill="#18181b" stroke="#27272a" />
          <text x="38" y="68" font-family="sans-serif" font-size="26" font-weight="bold" fill="#71717a">#4</text>
          <circle cx="150" cy="55" r="32" fill="#7c3aed" />
          <text x="142" y="63" font-family="sans-serif" font-size="24" font-weight="bold" fill="#ffffff">N</text>
          <text x="205" y="52" font-family="sans-serif" font-size="22" font-weight="bold" fill="#ffffff">NeonRider</text>
          <text x="205" y="80" font-family="sans-serif" font-size="16" fill="#9ca3af">🔥 19 Day Streak</text>
          <text x="530" y="64" font-family="sans-serif" font-size="20" font-weight="bold" fill="#c084fc">74,100 XP</text>
        </g>

        <!-- Rank 5 -->
        <g transform="translate(0, 520)">
          <rect width="670" height="110" rx="20" fill="#18181b" stroke="#27272a" />
          <text x="38" y="68" font-family="sans-serif" font-size="26" font-weight="bold" fill="#71717a">#5</text>
          <circle cx="150" cy="55" r="32" fill="#db2777" />
          <text x="142" y="63" font-family="sans-serif" font-size="24" font-weight="bold" fill="#ffffff">K</text>
          <text x="205" y="52" font-family="sans-serif" font-size="22" font-weight="bold" fill="#ffffff">KingLegend</text>
          <text x="205" y="80" font-family="sans-serif" font-size="16" fill="#9ca3af">🔥 15 Day Streak</text>
          <text x="530" y="64" font-family="sans-serif" font-size="20" font-weight="bold" fill="#f472b6">62,900 XP</text>
        </g>
      </g>
    </svg>
  `);

  await sharp(leaderboardSvg).png().toFile('public/screenshots/screenshot-leaderboard.png');

  // 2. Daily Rewards & Streaks Screenshot (750x1334)
  const rewardsSvg = Buffer.from(`
    <svg width="750" height="1334" viewBox="0 0 750 1334" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#09090b" />
          <stop offset="50%" stop-color="#191024" />
          <stop offset="100%" stop-color="#09090b" />
        </linearGradient>
        <linearGradient id="streakGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ea580c" />
          <stop offset="100%" stop-color="#f97316" />
        </linearGradient>
      </defs>

      <rect width="750" height="1334" fill="url(#bg2)" />

      <!-- Top Bar -->
      <rect width="750" height="100" fill="#18181b" opacity="0.95" />
      <text x="40" y="64" font-family="sans-serif" font-size="28" font-weight="bold" fill="#f97316">🔥 DAILY STREAK &amp; REWARDS</text>

      <!-- Streak Header -->
      <g transform="translate(40, 130)">
        <rect width="670" height="260" rx="24" fill="url(#streakGrad)" />
        <text x="40" y="70" font-family="sans-serif" font-size="36" font-weight="900" fill="#ffffff">7-Day Streak Active! 🔥</text>
        <text x="40" y="110" font-family="sans-serif" font-size="18" fill="#ffedd5">Play daily to earn bonus XP, multiplier boosts &amp; exclusive badges!</text>
        
        <rect x="40" y="160" width="300" height="60" rx="16" fill="#ffffff" />
        <text x="75" y="198" font-family="sans-serif" font-size="20" font-weight="bold" fill="#ea580c">Claim +250 XP Today</text>
      </g>

      <!-- Weekly Calendar Matrix -->
      <text x="40" y="440" font-family="sans-serif" font-size="26" font-weight="bold" fill="#ffffff">Weekly Rewards Roadmap</text>

      <g transform="translate(40, 470)">
        <!-- Mon -->
        <rect x="0" y="0" width="85" height="120" rx="16" fill="#1e1b4b" stroke="#6366f1" stroke-width="1.5" />
        <text x="25" y="40" font-family="sans-serif" font-size="18" fill="#a5b4fc">Mon</text>
        <text x="32" y="75" font-family="sans-serif" font-size="22">✅</text>
        <text x="18" y="105" font-family="sans-serif" font-size="14" font-weight="bold" fill="#818cf8">+50XP</text>

        <!-- Tue -->
        <rect x="97" y="0" width="85" height="120" rx="16" fill="#1e1b4b" stroke="#6366f1" stroke-width="1.5" />
        <text x="122" y="40" font-family="sans-serif" font-size="18" fill="#a5b4fc">Tue</text>
        <text x="129" y="75" font-family="sans-serif" font-size="22">✅</text>
        <text x="110" y="105" font-family="sans-serif" font-size="14" font-weight="bold" fill="#818cf8">+100XP</text>

        <!-- Wed -->
        <rect x="194" y="0" width="85" height="120" rx="16" fill="#1e1b4b" stroke="#6366f1" stroke-width="1.5" />
        <text x="216" y="40" font-family="sans-serif" font-size="18" fill="#a5b4fc">Wed</text>
        <text x="226" y="75" font-family="sans-serif" font-size="22">✅</text>
        <text x="207" y="105" font-family="sans-serif" font-size="14" font-weight="bold" fill="#818cf8">+150XP</text>

        <!-- Thu -->
        <rect x="291" y="0" width="85" height="120" rx="16" fill="#31135e" stroke="#c084fc" stroke-width="2" />
        <text x="316" y="40" font-family="sans-serif" font-size="18" font-weight="bold" fill="#f0abfc">Today</text>
        <text x="323" y="75" font-family="sans-serif" font-size="22">🎁</text>
        <text x="304" y="105" font-family="sans-serif" font-size="14" font-weight="bold" fill="#e879f9">+250XP</text>

        <!-- Fri -->
        <rect x="388" y="0" width="85" height="120" rx="16" fill="#18181b" stroke="#27272a" />
        <text x="415" y="40" font-family="sans-serif" font-size="18" fill="#71717a">Fri</text>
        <text x="420" y="75" font-family="sans-serif" font-size="22">🔒</text>
        <text x="401" y="105" font-family="sans-serif" font-size="14" fill="#71717a">+300XP</text>

        <!-- Sat -->
        <rect x="485" y="0" width="85" height="120" rx="16" fill="#18181b" stroke="#27272a" />
        <text x="511" y="40" font-family="sans-serif" font-size="18" fill="#71717a">Sat</text>
        <text x="517" y="75" font-family="sans-serif" font-size="22">🔒</text>
        <text x="498" y="105" font-family="sans-serif" font-size="14" fill="#71717a">+400XP</text>

        <!-- Sun -->
        <rect x="582" y="0" width="88" height="120" rx="16" fill="#18181b" stroke="#fbbf24" />
        <text x="607" y="40" font-family="sans-serif" font-size="18" font-weight="bold" fill="#fbbf24">Sun</text>
        <text x="613" y="75" font-family="sans-serif" font-size="22">👑</text>
        <text x="592" y="105" font-family="sans-serif" font-size="14" font-weight="bold" fill="#fbbf24">+1000XP</text>
      </g>

      <!-- Achievement Cards -->
      <text x="40" y="650" font-family="sans-serif" font-size="26" font-weight="bold" fill="#ffffff">Unlockable Achievements</text>

      <g transform="translate(40, 680)">
        <rect width="670" height="140" rx="20" fill="#18181b" stroke="#27272a" />
        <circle cx="80" cy="70" r="40" fill="#312e81" />
        <text x="65" y="78" font-family="sans-serif" font-size="30">🚀</text>
        <text x="145" y="55" font-family="sans-serif" font-size="22" font-weight="bold" fill="#ffffff">Speed Demon</text>
        <text x="145" y="85" font-family="sans-serif" font-size="16" fill="#9ca3af">Play 10 different Racing Games in a day</text>
        <text x="145" y="115" font-family="sans-serif" font-size="14" font-weight="bold" fill="#818cf8">Progress: 8/10 games</text>

        <g transform="translate(0, 160)">
          <rect width="670" height="140" rx="20" fill="#18181b" stroke="#27272a" />
          <circle cx="80" cy="70" r="40" fill="#831843" />
          <text x="65" y="78" font-family="sans-serif" font-size="30">🎯</text>
          <text x="145" y="55" font-family="sans-serif" font-size="22" font-weight="bold" fill="#ffffff">Sharpshooter</text>
          <text x="145" y="85" font-family="sans-serif" font-size="16" fill="#9ca3af">Score 5,000+ points in any Shooter game</text>
          <text x="145" y="115" font-family="sans-serif" font-size="14" font-weight="bold" fill="#f472b6">Completed! (+500 XP)</text>
        </g>
      </g>
    </svg>
  `);

  await sharp(rewardsSvg).png().toFile('public/screenshots/screenshot-rewards.png');

  console.log('Extra screenshots generated in public/screenshots/');
}

generateMoreScreenshots().catch(console.error);
