import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { awardXP, XP_CONFIG } from "@/lib/xp";

export async function POST(req: NextRequest) {
  try {
    // We expect a ping every 60 seconds
    const body = await req.json();
    const { elapsedSeconds } = body; // should be roughly 60
    
    if (typeof elapsedSeconds !== 'number' || elapsedSeconds > 120 || elapsedSeconds < 0) {
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

      const newPlaytime = (user.playtimeSeconds || 0) + elapsedSeconds;
      const oldHours = Math.floor((user.playtimeSeconds || 0) / 3600);
      const newHours = Math.floor(newPlaytime / 3600);
      
      const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || req.headers.get("cf-connecting-ip") || "Unknown";
      
      let xpAwarded = 0;
      
      if (newHours > oldHours) {
        const hoursCrossed = newHours - oldHours;
        xpAwarded = hoursCrossed * XP_CONFIG.PLAYTIME_PER_HOUR;
        
        await User.findByIdAndUpdate(user._id, {
          $set: { playtimeSeconds: newPlaytime, lastActiveAt: new Date(), lastIp: ip },
          $inc: { xp: xpAwarded, lifetimeXp: xpAwarded }
        });
      } else {
        await User.findByIdAndUpdate(user._id, {
          $set: { playtimeSeconds: newPlaytime, lastActiveAt: new Date(), lastIp: ip }
        });
      }

      return NextResponse.json({ success: true, newPlaytime, xpAwarded });
    } else {
      // Guest tracking
      const cookieStore = await cookies();
      const guestIdCookie = cookieStore.get('guestId');
      
      if (guestIdCookie?.value) {
        const guestId = guestIdCookie.value;
        const GuestSession = (await import('@/models/GuestSession')).default;
        
        const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || req.headers.get("cf-connecting-ip") || "Unknown";
        
        let guestSession = await GuestSession.findOne({ guestId });
        
        if (!guestSession) {
          guestSession = await GuestSession.create({
            guestId,
            playtimeSeconds: elapsedSeconds,
            lastActiveAt: new Date(),
            updatedAt: new Date(),
            lastIp: ip
          });
        } else {
          await GuestSession.updateOne(
            { guestId },
            { 
              $inc: { playtimeSeconds: elapsedSeconds },
              $set: { lastActiveAt: new Date(), updatedAt: new Date(), lastIp: ip }
            }
          );
        }
        
        return NextResponse.json({ success: true, newPlaytime: (guestSession.playtimeSeconds || 0) + elapsedSeconds, xpAwarded: 0 });
      }

      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } catch (error) {
    console.error("Playtime tracking error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
