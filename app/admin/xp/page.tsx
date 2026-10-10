import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import XpTransaction from "@/models/XpTransaction";
import RewardClaim from "@/models/RewardClaim";
import AdminXpClient from "./AdminXpClient";

export const dynamic = "force-dynamic";

export default async function AdminXpPage() {
  await dbConnect();

  // Load registered users, XP transactions, and reward claim redemptions
  const [rawUsers, rawTransactions, rawClaims] = await Promise.all([
    User.find({})
      .select("name email image xp lifetimeXp currentStreak lastActiveAt createdAt")
      .sort({ xp: -1 })
      .limit(100)
      .lean(),
    XpTransaction.find({})
      .sort({ createdAt: -1 })
      .limit(200)
      .lean(),
    RewardClaim.find({})
      .sort({ claimedAt: -1 })
      .limit(100)
      .lean(),
  ]);

  const initialUsers = JSON.parse(JSON.stringify(rawUsers));
  const initialTransactions = JSON.parse(JSON.stringify(rawTransactions));
  const initialClaims = JSON.parse(JSON.stringify(rawClaims));

  // Synthesize unified activity log items
  const activityLogs: any[] = [];

  // Add all transactions to activity
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

  // Add all reward claim events to activity
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

  // Add recent user signups
  initialUsers.slice(0, 50).forEach((user: any) => {
    activityLogs.push({
      _id: `user-${user._id}`,
      type: "user_signup",
      category: "registration",
      title: `New Player Joined • ${user.name}`,
      description: `Registered with ${user.email} (Streak: ${user.currentStreak || 0}d)`,
      userEmail: user.email,
      userName: user.name,
      meta: {
        xp: user.xp || 0,
      },
      createdAt: user.createdAt,
    });
  });

  // Sort unified activities chronologically
  activityLogs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="w-full space-y-4">
      <AdminXpClient
        initialUsers={initialUsers}
        initialTransactions={initialTransactions}
        initialActivities={activityLogs}
      />
    </div>
  );
}
