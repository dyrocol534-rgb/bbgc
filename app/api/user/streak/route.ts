import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { processDailyLogin } from "@/lib/xp";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updatedUser = await processDailyLogin(user._id.toString());
    
    // Check if xp changed to determine if a reward was just given
    let xpAwarded = 0;
    if (updatedUser && user.xp !== updatedUser.xp) {
       xpAwarded = updatedUser.xp - user.xp;
    }

    return NextResponse.json({ 
      success: true, 
      xpAwarded,
      currentStreak: updatedUser?.currentStreak || user.currentStreak
    });
  } catch (error) {
    console.error("Streak tracking error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
