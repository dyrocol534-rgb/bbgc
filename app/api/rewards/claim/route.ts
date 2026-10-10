import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Reward from "@/models/Reward";
import RewardClaim from "@/models/RewardClaim";

export const dynamic = "force-dynamic";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

// POST: Claim a reward
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json(
      { error: "You must be signed in to redeem rewards." },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { rewardId, playerId, zoneId, contactInfo, userNote } = body;

    if (!rewardId || !playerId || !playerId.trim()) {
      return NextResponse.json(
        { error: "Please enter your Player Character/User ID." },
        { status: 400 }
      );
    }

    await dbConnect();

    // 1. Fetch user from DB
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User account not found." }, { status: 404 });
    }

    // 2. Fetch reward from DB
    const reward = await Reward.findById(rewardId);
    if (!reward || !reward.active) {
      return NextResponse.json({ error: "Reward item not available." }, { status: 404 });
    }

    if (reward.isComingSoon) {
      return NextResponse.json(
        { error: "This item is coming soon and cannot be redeemed yet." },
        { status: 400 }
      );
    }

    if (reward.stockStatus === "out_of_stock") {
      return NextResponse.json(
        { error: "This reward is currently out of stock." },
        { status: 400 }
      );
    }

    // 3. Verify user XP balance
    if ((user.xp || 0) < reward.requiredXp) {
      return NextResponse.json(
        {
          error: `Insufficient XP. You need ${reward.requiredXp} XP, but you currently have ${user.xp || 0} XP.`,
        },
        { status: 400 }
      );
    }

    // 4. Check 7-day cooldown rule for this specific reward item
    // "each item let one user claim or reedm once in a 7 day after 7 day again he can"
    const lastClaim = await RewardClaim.findOne({
      userId: user._id,
      rewardId: reward._id,
      status: { $ne: "rejected" }, // If admin rejected it previously, don't lock them out
    }).sort({ claimedAt: -1 });

    if (lastClaim) {
      const elapsed = Date.now() - new Date(lastClaim.claimedAt).getTime();
      if (elapsed < SEVEN_DAYS_MS) {
        const remainingDays = Math.ceil((SEVEN_DAYS_MS - elapsed) / (1000 * 60 * 60 * 24));
        return NextResponse.json(
          {
            error: `Cooldown active: You can redeem ${reward.title} once every 7 days. Please try again in ${remainingDays} day(s).`,
          },
          { status: 429 }
        );
      }
    }

    // 5. Deduct XP from user balance (atomic decrement with condition check)
    const updatedUser = await User.findOneAndUpdate(
      { _id: user._id, xp: { $gte: reward.requiredXp } },
      { $inc: { xp: -reward.requiredXp } },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { error: "Insufficient XP or XP balance changed. Please try again." },
        { status: 400 }
      );
    }

    // 6. Create claim record
    const claim = await RewardClaim.create({
      userId: user._id,
      userEmail: user.email,
      userName: user.name || "Player",
      rewardId: reward._id,
      rewardTitle: reward.title,
      game: reward.game,
      requiredXp: reward.requiredXp,
      iconUrl: reward.iconUrl || "",
      playerId: playerId.trim(),
      zoneId: (zoneId || "").trim(),
      contactInfo: (contactInfo || "").trim(),
      userNote: (userNote || "").trim(),
      status: "pending",
      claimedAt: new Date(),
    });

    // 7. Log transaction
    try {
      const XpTransaction = (await import("@/models/XpTransaction")).default;
      await XpTransaction.create({
        userId: user._id,
        userEmail: user.email,
        userName: user.name || "Player",
        amount: -reward.requiredXp,
        type: "reward_redemption",
        description: `Redeemed ${reward.title} (${reward.game})`,
        balanceAfter: updatedUser.xp,
        referenceId: claim._id.toString(),
      });
    } catch (txErr) {
      console.error("Failed to log XP redemption transaction:", txErr);
    }

    return NextResponse.json({
      success: true,
      claim,
      remainingXp: updatedUser?.xp ?? 0,
      message: "Order placed successfully! Expected fulfillment in 30 to 60 minutes.",
    });
  } catch (error: any) {
    console.error("Error claiming reward:", error);
    return NextResponse.json(
      { error: error.message || "Failed to submit reward claim." },
      { status: 500 }
    );
  }
}

// GET: User's redemption history & active cooldowns
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ claims: [], cooldowns: {} });
    }

    const claims = await RewardClaim.find({ userId: user._id })
      .sort({ claimedAt: -1 })
      .lean();

    // Compute cooldowns per rewardId
    const now = Date.now();
    const cooldowns: Record<string, { availableAt: string; daysLeft: number }> = {};

    claims.forEach((c) => {
      const rewardIdStr = c.rewardId.toString();
      if (!cooldowns[rewardIdStr] && c.status !== "rejected") {
        const elapsed = now - new Date(c.claimedAt).getTime();
        if (elapsed < SEVEN_DAYS_MS) {
          const availableAt = new Date(new Date(c.claimedAt).getTime() + SEVEN_DAYS_MS);
          const daysLeft = Math.ceil((SEVEN_DAYS_MS - elapsed) / (1000 * 60 * 60 * 24));
          cooldowns[rewardIdStr] = {
            availableAt: availableAt.toISOString(),
            daysLeft,
          };
        }
      }
    });

    return NextResponse.json({
      claims,
      cooldowns,
      userXp: user.xp || 0,
    });
  } catch (error: any) {
    console.error("Error fetching claims:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch claims" },
      { status: 500 }
    );
  }
}
