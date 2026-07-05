import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { phone, referralCode } = await req.json();
    
    await dbConnect();
    
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updates: any = {};
    updates.profileCompleted = true;
    
    if (phone && phone.trim() !== "") {
      updates.phone = phone.trim();
    }

    if (referralCode && referralCode.trim() !== "" && !user.referredBy) {
      // Find the user who owns this referral code
      const referrer = await User.findOne({ referralCode: referralCode.trim().toUpperCase() });
      if (referrer && referrer._id.toString() !== user._id.toString()) {
        updates.referredBy = referrer._id;
        updates.referralRewardPaid = false; // explicitly set to false, paid out after 10 games
      }
    }

    if (Object.keys(updates).length > 0) {
      await User.findByIdAndUpdate(user._id, { $set: updates });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Complete profile error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
