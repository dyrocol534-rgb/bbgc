import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import RewardClaim from "@/models/RewardClaim";
import User from "@/models/User";

export const dynamic = "force-dynamic";

function isAdmin(session: any) {
  return (
    session &&
    session.user?.email ===
      (process.env.ADMIN_EMAIL )
  );
}

// GET all reward claims for Admin order fulfillment dashboard
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    const status = req.nextUrl.searchParams.get("status");
    const query: any = {};
    if (status && status !== "all") {
      query.status = status;
    }

    const claims = await RewardClaim.find(query)
      .sort({ claimedAt: -1 })
      .lean();

    return NextResponse.json({ claims });
  } catch (error: any) {
    console.error("Error fetching admin claims:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch claims" },
      { status: 500 }
    );
  }
}

// PATCH update status, voucher code, notes, or refund on reject
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { claimId, status, voucherCode, adminNotes, refundUser } = body;

    if (!claimId || !status) {
      return NextResponse.json(
        { error: "claimId and status are required." },
        { status: 400 }
      );
    }

    await dbConnect();

    const claim = await RewardClaim.findById(claimId);
    if (!claim) {
      return NextResponse.json({ error: "Claim order not found" }, { status: 404 });
    }

    const previousStatus = claim.status;
    claim.status = status;
    if (voucherCode !== undefined) claim.voucherCode = voucherCode;
    if (adminNotes !== undefined) claim.adminNotes = adminNotes;
    if (status === "completed" && !claim.fulfilledAt) {
      claim.fulfilledAt = new Date();
    }

    // If rejected and refund is requested (or changing from pending/processing to rejected)
    if (status === "rejected" && refundUser && previousStatus !== "rejected") {
      const refundedUser = await User.findByIdAndUpdate(
        claim.userId,
        { $inc: { xp: claim.requiredXp } },
        { new: true }
      );
      claim.adminNotes = (claim.adminNotes ? claim.adminNotes + " | " : "") + "XP refunded to user.";

      try {
        const XpTransaction = (await import("@/models/XpTransaction")).default;
        await XpTransaction.create({
          userId: claim.userId,
          userEmail: claim.userEmail,
          userName: claim.userName,
          amount: claim.requiredXp,
          type: "reward_refund",
          description: `Refund for rejected claim: ${claim.rewardTitle}`,
          balanceAfter: refundedUser?.xp ?? 0,
          adminEmail: session?.user?.email || "admin",
          referenceId: claim._id.toString(),
        });
      } catch (txErr) {
        console.error("Failed to log XP refund transaction:", txErr);
      }
    }

    await claim.save();

    return NextResponse.json({ success: true, claim });
  } catch (error: any) {
    console.error("Error updating claim status:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update claim order" },
      { status: 500 }
    );
  }
}
