import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Reward from "@/models/Reward";

export const dynamic = "force-dynamic";

function isAdmin(session: any) {
  return (
    session &&
    session.user?.email ===
      (process.env.ADMIN_EMAIL || "tusharkantanayak713@gmail.com")
  );
}

// PATCH update reward
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();

    await dbConnect();
    const updatedReward = await Reward.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!updatedReward) {
      return NextResponse.json({ error: "Reward not found" }, { status: 404 });
    }

    return NextResponse.json({ reward: updatedReward });
  } catch (error: any) {
    console.error("Error updating reward:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update reward" },
      { status: 500 }
    );
  }
}

// DELETE reward
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    await dbConnect();

    const deletedReward = await Reward.findByIdAndDelete(id);
    if (!deletedReward) {
      return NextResponse.json({ error: "Reward not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Reward deleted" });
  } catch (error: any) {
    console.error("Error deleting reward:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete reward" },
      { status: 500 }
    );
  }
}
