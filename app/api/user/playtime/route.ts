import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { awardXP, XP_CONFIG } from "@/lib/xp";

export async function POST(req: NextRequest) {
  try {
    // We expect a ping every 120 seconds (2 minutes)
    const body = await req.json();
    const { elapsedSeconds } = body; // 120 seconds
    
    if (typeof elapsedSeconds !== 'number' || elapsedSeconds > 240 || elapsedSeconds < 0) {
      return NextResponse.json({ error: "Invalid playtime ping" }, { status: 400 });
    }

    await dbConnect();
    
    const session = await getServerSession(authOptions);
    
    if (session?.user?.email) {
      // User tracking
      const user = await User.findOne({ email: session.user.email });
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const now = new Date();
      // Rate Limit / Frequency throttling: reject pings if user pinged too recently (< 90s ago for 2-min interval)
      if (user.lastActiveAt) {
        const secondsSinceLastPing = (now.getTime() - new Date(user.lastActiveAt).getTime()) / 1000;
        if (secondsSinceLastPing < 90) {
          return NextResponse.json({ error: "Ping throttled", success: true }, { status: 429 });
        }
      }

      const newPlaytime = (user.playtimeSeconds || 0) + elapsedSeconds;
      const oldHours = Math.floor((user.playtimeSeconds || 0) / 3600);
      const newHours = Math.floor(newPlaytime / 3600);
      
      const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || req.headers.get("cf-connecting-ip") || "Unknown";
      
      let xpAwarded = 0;
      
      if (newHours > oldHours) {
        const hoursCrossed = newHours - oldHours;
        xpAwarded = hoursCrossed * XP_CONFIG.PLAYTIME_PER_HOUR;
        
        await User.findByIdAndUpdate(user._id, {
          $set: { playtimeSeconds: newPlaytime, lastActiveAt: now, lastIp: ip },
          $inc: { xp: xpAwarded, lifetimeXp: xpAwarded }
        });
      } else {
        await User.findByIdAndUpdate(user._id, {
          $set: { playtimeSeconds: newPlaytime, lastActiveAt: now, lastIp: ip }
        });
      }

      return NextResponse.json({ success: true, newPlaytime, xpAwarded });
    } else {
      // Guest tracking
      const cookieStore = await cookies();
      let guestId = cookieStore.get('guestId')?.value;
      if (!guestId) {
        guestId = crypto.randomUUID();
        cookieStore.set('guestId', guestId, {
          maxAge: 60 * 60 * 24 * 365,
          path: '/',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
        });
      }
      
      const GuestSession = (await import('@/models/GuestSession')).default;
      const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || req.headers.get("cf-connecting-ip") || "Unknown";
      
      const updatedGuest = await GuestSession.findOneAndUpdate(
        { guestId },
        {
          $inc: { playtimeSeconds: elapsedSeconds },
          $set: { lastActiveAt: new Date(), updatedAt: new Date(), lastIp: ip },
          $setOnInsert: { guestId, recentlyPlayed: [], gamesPlayedCount: 0, createdAt: new Date() }
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      ).lean();
      
      return NextResponse.json({
        success: true,
        newPlaytime: updatedGuest?.playtimeSeconds || elapsedSeconds,
        xpAwarded: 0
      });
    }
  } catch (error) {
    console.error("Playtime tracking error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
