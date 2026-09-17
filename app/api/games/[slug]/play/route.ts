import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import dbConnect from "@/lib/mongodb";
import Game from "@/models/Game";
import User from "@/models/User";
import PlayEvent from "@/models/PlayEvent";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    await dbConnect();
    
    // Increment global play count for the game
    const game = await Game.findOneAndUpdate(
      { slug },
      { $inc: { playCount: 1 } },
      { new: true }
    ).lean();
    
    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    const userAgent = request.headers.get("user-agent") || "";
    let deviceType: "mobile" | "desktop" | "tablet" | "unknown" = "desktop";
    
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(userAgent)) {
      deviceType = "tablet";
    } else if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(userAgent)) {
      deviceType = "mobile";
    }

    // Log the play event asynchronously for time-series analytics (non-blocking)
    PlayEvent.create({ gameSlug: slug, deviceType }).catch((err) =>
      console.error("Async play event log error:", err)
    );

    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || request.headers.get("cf-connecting-ip") || "Unknown";

    // Update user's recentlyPlayed history if logged in
    const session = await getServerSession(authOptions);
    let xpAwarded = 0;
    
    if (session?.user?.email) {
      // First, remove the game if it already exists to avoid duplicates
      await User.updateOne(
        { email: session.user.email },
        { $pull: { recentlyPlayed: slug } }
      );
      
      const { XP_CONFIG, awardXP } = await import("@/lib/xp");
      
      // Push it to front, update activity, add 1 XP, increment games played
      const updatedUser = await User.findOneAndUpdate(
        { email: session.user.email },
        { 
          $push: { 
            recentlyPlayed: { 
              $each: [slug], 
              $position: 0, 
              $slice: 12 
            } 
          },
          $set: { lastActiveAt: new Date(), lastIp: ip },
          $inc: { 
            xp: XP_CONFIG.PLAY_GAME, 
            lifetimeXp: XP_CONFIG.PLAY_GAME,
            gamesPlayedCount: 1 
          }
        },
        { new: true }
      );
      
      xpAwarded = XP_CONFIG.PLAY_GAME;
      
      // Referral Logic Check
      if (
        updatedUser && 
        updatedUser.gamesPlayedCount === XP_CONFIG.GAMES_REQUIRED_FOR_REFERRAL &&
        updatedUser.referredBy &&
        !updatedUser.referralRewardPaid
      ) {
        // Award the referrer 50 XP
        await awardXP(updatedUser.referredBy.toString(), XP_CONFIG.REFERRAL_REWARD);
        // Award the current user an extra 50 XP
        await User.findByIdAndUpdate(updatedUser._id, {
          $inc: { xp: XP_CONFIG.REFERRAL_REWARD, lifetimeXp: XP_CONFIG.REFERRAL_REWARD },
          $set: { referralRewardPaid: true }
        });
        xpAwarded += XP_CONFIG.REFERRAL_REWARD;
      }
      
    } else {
      // Track anonymous user via guestId cookie
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
      
      // Pull previous entry of this slug if present, then atomically prepend with max slice 12
      await GuestSession.updateOne(
        { guestId },
        { $pull: { recentlyPlayed: slug } }
      );
      await GuestSession.updateOne(
        { guestId },
        { 
          $push: { recentlyPlayed: { $each: [slug], $position: 0, $slice: 12 } },
          $set: { lastActiveAt: new Date(), updatedAt: new Date(), lastIp: ip },
          $inc: { gamesPlayedCount: 1 },
          $setOnInsert: { guestId, playtimeSeconds: 0, createdAt: new Date() }
        },
        { upsert: true }
      );
    }
      
      return NextResponse.json({ success: true, playCount: game.playCount, xpAwarded });
  } catch (error) {
    console.error("Error incrementing play count:", error);
    return NextResponse.json({ error: "Failed to increment play count" }, { status: 500 });
  }
}
