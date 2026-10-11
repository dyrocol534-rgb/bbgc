import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import XpTransaction from "@/models/XpTransaction";
import RewardClaim from "@/models/RewardClaim";
import ActivityLog from "@/models/ActivityLog";
import AdminXpClient from "./AdminXpClient";

export const dynamic = "force-dynamic";

export default async function AdminXpPage() {
  await dbConnect();

  // Load registered users, XP transactions, and dedicated ActivityLog events
  const [rawUsers, rawTransactions, rawActivityLogs, rawClaims] = await Promise.all([
    User.find({})
      .select("name email image xp lifetimeXp currentStreak lastActiveAt createdAt")
      .sort({ xp: -1 })
      .limit(100)
      .lean(),
    XpTransaction.find({})
      .sort({ createdAt: -1 })
      .limit(200)
      .lean(),
    ActivityLog.find({})
      .sort({ createdAt: -1 })
      .limit(200)
      .lean(),
    RewardClaim.find({})
      .sort({ claimedAt: -1 })
      .limit(50)
      .lean(),
  ]);

  const initialUsers = JSON.parse(JSON.stringify(rawUsers));
  const initialTransactions = JSON.parse(JSON.stringify(rawTransactions));
  const savedActivities = JSON.parse(JSON.stringify(rawActivityLogs));
  const initialClaims = JSON.parse(JSON.stringify(rawClaims));

  // Synthesize unified activity log feed
  const activityLogs: any[] = [...savedActivities];

  // If there are older transactions not in ActivityLog, merge them seamlessly
  initialTransactions.forEach((tx: any) => {
    activityLogs.push({
      _id: `tx-${tx._id}`,
      type: "xp_transaction",
      category: tx.type,
      title: `${tx.amount > 0 ? "+" : ""}${tx.amount} XP • ${tx.userName}`,
      description: tx.description,
      userEmail: tx.userEmail,
      userName: tx.userName,
      meta: {
        amount: tx.amount,
        balanceAfter: tx.balanceAfter,
        adminEmail: tx.adminEmail,
      },
      createdAt: tx.createdAt,
    });
  });

  // Merge reward claim events
  initialClaims.forEach((claim: any) => {
    activityLogs.push({
      _id: `claim-${claim._id}`,
      type: "reward_claim",
      category: claim.status,
      title: `Redeemed ${claim.rewardTitle} (${claim.game})`,
      description: `Player UID: ${claim.playerId}${claim.zoneId ? ` (Zone: ${claim.zoneId})` : ""} • Status: ${claim.status.toUpperCase()}`,
      userEmail: claim.userEmail,
      userName: claim.userName,
      meta: {
        requiredXp: claim.requiredXp,
        status: claim.status,
        voucherCode: claim.voucherCode,
      },
      createdAt: claim.claimedAt,
    });
  });

  // Sort unified activities chronologically descending
  activityLogs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Deduplicate by _id or unique fingerprint
  const seen = new Set();
  const dedupedActivities = activityLogs.filter((item) => {
    const key = `${item.userEmail}-${item.type}-${new Date(item.createdAt).getTime()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return (
    <div className="w-full space-y-4">
      <AdminXpClient
        initialUsers={initialUsers}
        initialTransactions={initialTransactions}
        initialActivities={dedupedActivities.slice(0, 250)}
      />
    </div>
  );
}
