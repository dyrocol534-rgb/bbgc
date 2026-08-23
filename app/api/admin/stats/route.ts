import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Game from "@/models/Game";
import User from "@/models/User";
import Subscriber from "@/models/Subscriber";
import GuestSession from "@/models/GuestSession";
import PlayEvent from "@/models/PlayEvent";
import Feedback from "@/models/Feedback";
import AppInstall from "@/models/AppInstall";
import PushSubscription from "@/models/PushSubscription";

export const dynamic = "force-dynamic";

let cachedStats: any = null;
let lastCacheTime = 0;
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user?.email !== (process.env.ADMIN_EMAIL || "tusharkantanayak713@gmail.com")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const forceRefresh = req.nextUrl.searchParams.get("refresh") === "true";

  if (!forceRefresh && cachedStats && Date.now() - lastCacheTime < CACHE_TTL) {
    return NextResponse.json(cachedStats);
  }

  try {
    await dbConnect();
    
    const now = new Date();
    const ago24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const ago7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const ago30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Lifetime / Baseline Data
    const [
      totalUsers,
      totalGuests,
      totalGames,
      totalSubscribers,
      totalPwaInstalls,
      totalPushSubscribers,
      games,
      guestSessionsWithPlays,
      recentFeedback,
      recentPwaInstalls,
      pwaDeviceStats
    ] = await Promise.all([
      User.countDocuments(),
      GuestSession.countDocuments(),
      Game.countDocuments({ status: "published" }),
      Subscriber.countDocuments(),
      AppInstall.countDocuments(),
      PushSubscription.countDocuments(),
      Game.find({}, "playCount title slug likes dislikes").lean(),
      GuestSession.find({ recentlyPlayed: { $exists: true, $not: { $size: 0 } } }, "recentlyPlayed").lean(),
      Feedback.find().sort({ createdAt: -1 }).limit(10).lean(),
      AppInstall.find().sort({ installedAt: -1 }).limit(8).lean(),
      AppInstall.aggregate([
        { $group: { _id: "$deviceType", count: { $sum: 1 } } }
      ])
    ]);

    const pwaDevices = { Mobile: 0, Desktop: 0, Tablet: 0 };
    pwaDeviceStats.forEach((d: any) => {
      if (d._id === "Mobile" || d._id === "mobile") pwaDevices.Mobile += d.count;
      else if (d._id === "Tablet" || d._id === "tablet") pwaDevices.Tablet += d.count;
      else pwaDevices.Desktop += d.count;
    });

    const gameMap = new Map(games.map((g: any) => [g.slug, g.title]));
    const totalPlays = games.reduce((sum: number, game: any) => sum + (game.playCount || 0), 0);

    // Top Rated Games (Lifetime based on like ratio)
    const topRatedGames = [...games]
      .filter((g: any) => (g.likes?.length || 0) + (g.dislikes?.length || 0) > 0)
      .map((g: any) => {
        const l = g.likes?.length || 0;
        const d = g.dislikes?.length || 0;
        const ratio = l / (l + d);
        return { slug: g.slug, title: g.title, ratio: Math.round(ratio * 100), totalVotes: l + d };
      })
      .sort((a, b) => b.ratio - a.ratio || b.totalVotes - a.totalVotes)
      .slice(0, 5);

    // 24h Stats
    const [newUsers24h, newGuests24h, activeUsers24h, activeGuests24h, newSubs24h, newGames24h, newPlays24h, pwaInstalls24h, pushSubs24h] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: ago24h } }),
      GuestSession.countDocuments({ createdAt: { $gte: ago24h } }),
      User.countDocuments({ lastActiveAt: { $gte: ago24h } }),
      GuestSession.countDocuments({ lastActiveAt: { $gte: ago24h } }),
      Subscriber.countDocuments({ createdAt: { $gte: ago24h } }),
      Game.countDocuments({ status: "published", createdAt: { $gte: ago24h } }),
      PlayEvent.countDocuments({ createdAt: { $gte: ago24h } }),
      AppInstall.countDocuments({ installedAt: { $gte: ago24h } }),
      PushSubscription.countDocuments({ createdAt: { $gte: ago24h } })
    ]);

    // 7d Stats
    const [newUsers7d, newGuests7d, activeUsers7d, activeGuests7d, newSubs7d, newGames7d, newPlays7d, pwaInstalls7d, pushSubs7d] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: ago7d } }),
      GuestSession.countDocuments({ createdAt: { $gte: ago7d } }),
      User.countDocuments({ lastActiveAt: { $gte: ago7d } }),
      GuestSession.countDocuments({ lastActiveAt: { $gte: ago7d } }),
      Subscriber.countDocuments({ createdAt: { $gte: ago7d } }),
      Game.countDocuments({ status: "published", createdAt: { $gte: ago7d } }),
      PlayEvent.countDocuments({ createdAt: { $gte: ago7d } }),
      AppInstall.countDocuments({ installedAt: { $gte: ago7d } }),
      PushSubscription.countDocuments({ createdAt: { $gte: ago7d } })
    ]);

    // 30d Stats
    const [newUsers30d, newGuests30d, activeUsers30d, activeGuests30d, newSubs30d, newGames30d, newPlays30d, pwaInstalls30d, pushSubs30d] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: ago30d } }),
      GuestSession.countDocuments({ createdAt: { $gte: ago30d } }),
      User.countDocuments({ lastActiveAt: { $gte: ago30d } }),
      GuestSession.countDocuments({ lastActiveAt: { $gte: ago30d } }),
      Subscriber.countDocuments({ createdAt: { $gte: ago30d } }),
      Game.countDocuments({ status: "published", createdAt: { $gte: ago30d } }),
      PlayEvent.countDocuments({ createdAt: { $gte: ago30d } }),
      AppInstall.countDocuments({ installedAt: { $gte: ago30d } }),
      PushSubscription.countDocuments({ createdAt: { $gte: ago30d } })
    ]);

    // Engagement & Retention (7d based)
    const oldUsersCount = await User.countDocuments({ createdAt: { $lt: ago7d } });
    const oldUsersActive7d = await User.countDocuments({ createdAt: { $lt: ago7d }, lastActiveAt: { $gte: ago7d } });
    const retentionRate = oldUsersCount > 0 ? Math.round((oldUsersActive7d / oldUsersCount) * 100) : 0;

    // Helper functions for timeframe top games and device split
    const getTopGames = async (since: Date) => {
      const topPlays = await PlayEvent.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: "$gameSlug", playCount: { $sum: 1 } } },
        { $sort: { playCount: -1 } },
        { $limit: 10 }
      ]);
      return topPlays.map(p => ({ slug: p._id, title: gameMap.get(p._id) || p._id, playCount: p.playCount }));
    };

    const getDeviceSplit = async (since: Date) => {
      const splits = await PlayEvent.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: "$deviceType", count: { $sum: 1 } } }
      ]);
      const result = { mobile: 0, desktop: 0, tablet: 0, unknown: 0 };
      splits.forEach(s => {
        if (result.hasOwnProperty(s._id)) {
          result[s._id as keyof typeof result] = s.count;
        } else {
          result.unknown += s.count;
        }
      });
      return result;
    };

    const getTopGuestGames = async (since: Date) => {
      const activeGuests = await GuestSession.find({ lastActiveAt: { $gte: since }, recentlyPlayed: { $exists: true, $not: { $size: 0 } } }, "recentlyPlayed").lean();
      const slugCountMap: Record<string, number> = {};
      for (const gs of activeGuests) {
        for (const slug of (gs as any).recentlyPlayed || []) {
          slugCountMap[slug] = (slugCountMap[slug] || 0) + 1;
        }
      }
      return Object.entries(slugCountMap).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([slug, count]) => ({ slug, title: gameMap.get(slug) || slug, count }));
    };

    // Calculate Top Games and Device Split per timeframe
    const [
      topGames24h, topGuestGames24h, devices24h,
      topGames7d, topGuestGames7d, devices7d,
      topGames30d, topGuestGames30d, devices30d,
      devicesLifetime
    ] = await Promise.all([
      getTopGames(ago24h), getTopGuestGames(ago24h), getDeviceSplit(ago24h),
      getTopGames(ago7d), getTopGuestGames(ago7d), getDeviceSplit(ago7d),
      getTopGames(ago30d), getTopGuestGames(ago30d), getDeviceSplit(ago30d),
      getDeviceSplit(new Date(0)) // all time
    ]);

    // Top Games (Lifetime)
    const topGamesLifetime = [...games]
      .sort((a, b) => (b.playCount || 0) - (a.playCount || 0))
      .slice(0, 10)
      .map(g => ({ slug: g.slug, title: g.title, playCount: g.playCount || 0 }));

    const lifetimeSlugCountMap: Record<string, number> = {};
    for (const gs of guestSessionsWithPlays) {
      for (const slug of (gs as any).recentlyPlayed || []) {
        lifetimeSlugCountMap[slug] = (lifetimeSlugCountMap[slug] || 0) + 1;
      }
    }
    const topGuestGamesLifetime = Object.entries(lifetimeSlugCountMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([slug, count]) => ({
        slug,
        title: (gameMap.get(slug) as string) || slug,
        count,
      }));

    // Recharts Data (30 days trend)
    const recentUsersDocs = await User.find({ createdAt: { $gte: ago30d } }, "createdAt").lean();
    const recentGuestsDocs = await GuestSession.find({ createdAt: { $gte: ago30d } }, "createdAt").lean();
    
    const signupsTrend = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      
      const uCount = recentUsersDocs.filter((u: any) => {
        const ud = new Date(u.createdAt);
        return ud.getDate() === d.getDate() && ud.getMonth() === d.getMonth();
      }).length;

      const gCount = recentGuestsDocs.filter((g: any) => {
        const gd = new Date(g.createdAt);
        return gd.getDate() === d.getDate() && gd.getMonth() === d.getMonth();
      }).length;

      signupsTrend.push({ date: dateStr, users: uCount, guests: gCount });
    }

    const newStats = {
      "24h": {
        newUsers: newUsers24h,
        newGuests: newGuests24h,
        activeUsers: activeUsers24h,
        activeGuests: activeGuests24h,
        newSubscribers: newSubs24h,
        totalGames: newGames24h,
        totalPlays: newPlays24h,
        pwaInstalls: pwaInstalls24h,
        pushSubscribers: pushSubs24h,
        topGames: topGames24h,
        topGuestGames: topGuestGames24h,
        deviceSplit: devices24h,
        avgPlaysPerActive: (activeUsers24h + activeGuests24h) > 0 ? (newPlays24h / (activeUsers24h + activeGuests24h)).toFixed(1) : 0
      },
      "7d": {
        newUsers: newUsers7d,
        newGuests: newGuests7d,
        activeUsers: activeUsers7d,
        activeGuests: activeGuests7d,
        newSubscribers: newSubs7d,
        totalGames: newGames7d,
        totalPlays: newPlays7d,
        pwaInstalls: pwaInstalls7d,
        pushSubscribers: pushSubs7d,
        topGames: topGames7d,
        topGuestGames: topGuestGames7d,
        deviceSplit: devices7d,
        avgPlaysPerActive: (activeUsers7d + activeGuests7d) > 0 ? (newPlays7d / (activeUsers7d + activeGuests7d)).toFixed(1) : 0
      },
      "30d": {
        newUsers: newUsers30d,
        newGuests: newGuests30d,
        activeUsers: activeUsers30d,
        activeGuests: activeGuests30d,
        newSubscribers: newSubs30d,
        totalGames: newGames30d,
        totalPlays: newPlays30d,
        pwaInstalls: pwaInstalls30d,
        pushSubscribers: pushSubs30d,
        topGames: topGames30d,
        topGuestGames: topGuestGames30d,
        deviceSplit: devices30d,
        avgPlaysPerActive: (activeUsers30d + activeGuests30d) > 0 ? (newPlays30d / (activeUsers30d + activeGuests30d)).toFixed(1) : 0
      },
      lifetime: {
        newUsers: totalUsers,
        newGuests: totalGuests,
        activeUsers: totalUsers,
        activeGuests: totalGuests,
        newSubscribers: totalSubscribers,
        totalGames,
        totalPlays,
        pwaInstalls: totalPwaInstalls,
        pushSubscribers: totalPushSubscribers,
        pwaDevices,
        recentPwaInstalls: recentPwaInstalls.map((inst: any) => ({
          deviceType: inst.deviceType,
          installedAt: new Date(inst.installedAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          })
        })),
        topGames: topGamesLifetime,
        topGuestGames: topGuestGamesLifetime,
        deviceSplit: devicesLifetime,
        avgPlaysPerActive: (totalUsers + totalGuests) > 0 ? (totalPlays / (totalUsers + totalGuests)).toFixed(1) : 0,
        retentionRate,
        topRatedGames,
        recentFeedback: recentFeedback.map((f: any) => ({
          gameSlug: f.gameSlug,
          userEmail: f.userEmail,
          message: f.message,
          status: f.status,
          date: new Date(f.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
        }))
      },
      signupsTrend
    };

    cachedStats = newStats;
    lastCacheTime = Date.now();

    return NextResponse.json(newStats);

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}