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

    // Log the play event for time-series analytics (24h/7d/30d)
    await PlayEvent.create({ gameSlug: slug, deviceType });

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
              $slice: 3 
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
      const guestIdCookie = cookieStore.get('guestId');
      if (guestIdCookie?.value) {
        // Since we cannot easily $pull and $push in an upsert without conflicts if the doc doesn't exist,
        // we'll do a findOneAndUpdate which handles it cleanly or create it.
        const guestId = guestIdCookie.value;
        const GuestSession = (await import('@/models/GuestSession')).default;
        
        let guestSession = await GuestSession.findOne({ guestId });
        if (!guestSession) {
          await GuestSession.create({
            guestId,
            recentlyPlayed: [slug],
            lastActiveAt: new Date(),
            gamesPlayedCount: 1,
            lastIp: ip
          });
        } else {
          // Remove if exists, then push to front
          await GuestSession.updateOne(
            { guestId },
            { $pull: { recentlyPlayed: slug } }
          );
          await GuestSession.updateOne(
            { guestId },
            { 
              $push: { recentlyPlayed: { $each: [slug], $position: 0, $slice: 3 } },
              $set: { lastActiveAt: new Date(), updatedAt: new Date(), lastIp: ip },
              $inc: { gamesPlayedCount: 1 }
            }
          );
        }
      }
    }
      
    return NextResponse.json({ success: true, playCount: game.playCount, xpAwarded });
  } catch (error) {
    console.error("Error incrementing play count:", error);
    return NextResponse.json({ error: "Failed to increment play count" }, { status: 500 });
  }
}
