import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { awardXP, XP_CONFIG } from "@/lib/xp";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    
    // We expect a ping every 60 seconds
    const body = await req.json();
    const { elapsedSeconds } = body; // should be roughly 60
    
    if (typeof elapsedSeconds !== 'number' || elapsedSeconds > 120 || elapsedSeconds < 0) {
      return NextResponse.json({ error: "Invalid playtime ping" }, { status: 400 });
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const newPlaytime = (user.playtimeSeconds || 0) + elapsedSeconds;
    
    // Check if we hit a 3600 second (1 hour) milestone
    const oldHours = Math.floor((user.playtimeSeconds || 0) / 3600);
    const newHours = Math.floor(newPlaytime / 3600);
    
    let xpAwarded = 0;
    
    if (newHours > oldHours) {
      // Award 5 XP for every new hour boundary crossed
      const hoursCrossed = newHours - oldHours;
      xpAwarded = hoursCrossed * XP_CONFIG.PLAYTIME_PER_HOUR;
      
      await User.findByIdAndUpdate(user._id, {
        $set: { playtimeSeconds: newPlaytime },
        $inc: { xp: xpAwarded, lifetimeXp: xpAwarded }
      });
    } else {
      await User.findByIdAndUpdate(user._id, {
        $set: { playtimeSeconds: newPlaytime }
      });
    }

    return NextResponse.json({ success: true, newPlaytime, xpAwarded });
  } catch (error) {
    console.error("Playtime tracking error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
