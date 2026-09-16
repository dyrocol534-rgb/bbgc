import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Otp from "@/models/Otp";
import { sendOtpEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Valid email address is required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Rate-limiting check: 60-second cooldown
    const recentOtp = await Otp.findOne({ email: normalizedEmail }).sort({ createdAt: -1 });
    if (recentOtp) {
      const timeSinceCreation = (Date.now() - new Date(recentOtp.createdAt).getTime()) / 1000;
      if (timeSinceCreation < 60) {
        const remainingSeconds = Math.ceil(60 - timeSinceCreation);
        return NextResponse.json(
          { error: `Please wait ${remainingSeconds}s before requesting a new code` },
          { status: 429 }
        );
      }
    }

    // Generate secure 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Remove any previous OTPs for this email and save the new one
    await Otp.deleteMany({ email: normalizedEmail });
    await Otp.create({
      email: normalizedEmail,
      otp,
      expiresAt,
      attempts: 0,
      createdAt: new Date(),
    });

    // Send the email via Gmail SMTP
    await sendOtpEmail({ to: normalizedEmail, otp });

    return NextResponse.json({
      success: true,
      message: "Verification code sent to your email",
    });
  } catch (error: any) {
    console.error("Error sending OTP:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to send verification code. Please try again." },
      { status: 500 }
    );
  }
}
