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
    const { code } = await req.json();
    
    if (!code || typeof code !== "string" || code.trim().length < 3 || code.trim().length > 15) {
      return NextResponse.json({ error: "Code must be between 3 and 15 characters" }, { status: 400 });
    }

    const sanitizedCode = code.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
    
    if (sanitizedCode.length < 3) {
      return NextResponse.json({ error: "Code must contain at least 3 alphanumeric characters" }, { status: 400 });
    }

    await dbConnect();
    
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user already has a code
    if (user.referralCode && user.referralCode.trim() !== "") {
      return NextResponse.json({ error: "You already have a referral code" }, { status: 400 });
    }

    // Check if code is taken
    const existing = await User.findOne({ referralCode: sanitizedCode });
    if (existing) {
      return NextResponse.json({ error: "This code is already taken. Try another." }, { status: 400 });
    }

    // Save the new code
    await User.findByIdAndUpdate(user._id, { $set: { referralCode: sanitizedCode } });

    return NextResponse.json({ success: true, code: sanitizedCode });
  } catch (error) {
    console.error("Generate referral code error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
