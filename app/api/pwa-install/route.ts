import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import AppInstall from "@/models/AppInstall";

export async function POST(req: NextRequest) {
  try {
    const { deviceType, userAgent } = await req.json();
    
    await dbConnect();
    
    await AppInstall.create({
      deviceType: deviceType || "Unknown",
      userAgent: userAgent || "Unknown",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to log PWA install", error);
    return NextResponse.json({ error: "Failed to log PWA install" }, { status: 500 });
  }
}
