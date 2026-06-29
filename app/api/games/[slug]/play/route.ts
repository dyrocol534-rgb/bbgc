import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import dbConnect from "@/lib/mongodb";
import Game from "@/models/Game";
import User from "@/models/User";
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

    // Update user's recentlyPlayed history if logged in
    const session = await getServerSession(authOptions);
    if (session?.user?.email) {
      // First, remove the game if it already exists to avoid duplicates
      await User.updateOne(
        { email: session.user.email },
        { $pull: { recentlyPlayed: slug } }
      );
      // Then, push it to the front and keep only the last 3
      await User.updateOne(
        { email: session.user.email },
        { 
          $push: { 
            recentlyPlayed: { 
              $each: [slug], 
              $position: 0, 
              $slice: 3 
            } 
          },
          $set: { lastActiveAt: new Date() }
        }
      );
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
            lastActiveAt: new Date()
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
              $set: { lastActiveAt: new Date(), updatedAt: new Date() }
            }
          );
        }
      }
    }
      
    return NextResponse.json({ success: true, playCount: game.playCount });
  } catch (error) {
    console.error("Error incrementing play count:", error);
    return NextResponse.json({ error: "Failed to increment play count" }, { status: 500 });
  }
}
