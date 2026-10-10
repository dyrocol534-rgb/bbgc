import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import XpTransaction from "@/models/XpTransaction";

export const dynamic = "force-dynamic";

function isAdmin(session: any) {
  return (
    session &&
    session.user?.email ===
      (process.env.ADMIN_EMAIL || "tusharkantanayak713@gmail.com")
  );
}

// GET: Fetch users with XP balances & recent transactions
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const filterUserId = searchParams.get("userId");

    // Fetch transactions
    const txQuery: any = {};
    if (filterUserId) {
      txQuery.userId = filterUserId;
    }
    const transactions = await XpTransaction.find(txQuery)
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    // Fetch users with XP stats
    const userQuery: any = {};
    if (search) {
      userQuery.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(userQuery)
      .select("name email image xp lifetimeXp currentStreak lastActiveAt createdAt")
      .sort({ xp: -1 })
      .limit(100)
      .lean();

    return NextResponse.json({
      users,
      transactions,
    });
  } catch (error: any) {
    console.error("Error fetching XP data:", error);
    return NextResponse.json(
      { error: error.message || "Failed to load XP ledger" },
      { status: 500 }
    );
  }
}

// POST: Add, Deduct, or Set XP for a user
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { userId, action, amount, reason } = body;
    // action: "add" | "remove" | "set"

    if (!userId || !action || amount === undefined || amount === null) {
      return NextResponse.json(
        { error: "User ID, action ('add', 'remove', 'set'), and amount are required." },
        { status: 400 }
      );
    }

    const numAmount = Math.abs(Number(amount));
    if (isNaN(numAmount) || numAmount < 0) {
      return NextResponse.json({ error: "Amount must be a valid non-negative number." }, { status: 400 });
    }

    await dbConnect();
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const currentXp = user.xp || 0;
    let newXp = currentXp;
    let delta = 0;

    if (action === "add") {
      delta = numAmount;
      newXp = currentXp + numAmount;
      user.xp = newXp;
      user.lifetimeXp = (user.lifetimeXp || 0) + numAmount;
    } else if (action === "remove") {
      delta = -numAmount;
      newXp = Math.max(0, currentXp - numAmount);
      user.xp = newXp;
    } else if (action === "set") {
      delta = numAmount - currentXp;
      newXp = numAmount;
      user.xp = newXp;
      if (numAmount > (user.lifetimeXp || 0)) {
        user.lifetimeXp = numAmount;
      }
    } else {
      return NextResponse.json({ error: "Invalid action. Use 'add', 'remove', or 'set'." }, { status: 400 });
    }

    await user.save();

    // Create XP transaction record
    const descriptionText =
      reason?.trim() ||
      `Manual Admin adjustment (${action === "add" ? "+" : action === "remove" ? "-" : "="}${numAmount} XP)`;

    const tx = await XpTransaction.create({
      userId: user._id,
      userEmail: user.email,
      userName: user.name || "Player",
      amount: delta,
      type: "admin_adjustment",
      description: descriptionText,
      balanceAfter: newXp,
      adminEmail: session?.user?.email || "admin",
    });

    return NextResponse.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        xp: user.xp,
        lifetimeXp: user.lifetimeXp,
      },
      transaction: tx,
    });
  } catch (error: any) {
    console.error("Error modifying XP:", error);
    return NextResponse.json(
      { error: error.message || "Failed to adjust XP" },
      { status: 500 }
    );
  }
}
