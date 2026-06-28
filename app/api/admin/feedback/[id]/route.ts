import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Feedback from "@/models/Feedback";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user?.email !== (process.env.ADMIN_EMAIL || "tusharkantanayak713@gmail.com")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    
    await dbConnect();
    const updatedFeedback = await Feedback.findByIdAndUpdate(
      id,
      { $set: { status: body.status } },
      { new: true }
    );
    
    if (!updatedFeedback) {
      return NextResponse.json({ error: "Feedback not found" }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, feedback: updatedFeedback });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update feedback" }, { status: 500 });
  }
}
