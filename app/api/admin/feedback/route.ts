import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Feedback from "@/models/Feedback";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user?.email !== (process.env.ADMIN_EMAIL || "tusharkantanayak713@gmail.com")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    const feedbacks = await Feedback.find({}).sort({ createdAt: -1 });
    return NextResponse.json(feedbacks);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch feedback" }, { status: 500 });
  }
}
