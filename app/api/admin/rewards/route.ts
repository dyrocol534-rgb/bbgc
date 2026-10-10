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

// GET all rewards for Admin view
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    const rewards = await Reward.find({}).sort({ sortOrder: 1, createdAt: -1 });
    return NextResponse.json({ rewards });
  } catch (error: any) {
    console.error("Error fetching admin rewards:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch rewards" },
      { status: 500 }
    );
  }
}

// POST create new reward
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      title,
      game,
      requiredXp,
      iconUrl,
      description,
      stockStatus,
      isComingSoon,
      badge,
      active,
      sortOrder,
    } = body;

    if (!title || !game || requiredXp === undefined) {
      return NextResponse.json(
        { error: "Title, game name, and required XP are required." },
        { status: 400 }
      );
    }

    await dbConnect();

    const newReward = await Reward.create({
      title: title.trim(),
      game: game.trim(),
      requiredXp: Number(requiredXp),
      iconUrl: (iconUrl || "").trim(),
      description: (description || "").trim(),
      stockStatus: stockStatus === "out_of_stock" ? "out_of_stock" : "in_stock",
      isComingSoon: Boolean(isComingSoon),
      badge: (badge || "").trim(),
      active: active !== undefined ? Boolean(active) : true,
      sortOrder: Number(sortOrder) || 0,
    });

    return NextResponse.json({ reward: newReward }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating reward:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create reward" },
      { status: 500 }
    );
  }
}
