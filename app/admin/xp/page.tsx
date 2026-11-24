import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import XpTransaction from "@/models/XpTransaction";
import RewardClaim from "@/models/RewardClaim";
import ActivityLog from "@/models/ActivityLog";
import AdminXpClient from "./AdminXpClient";

export const dynamic = "force-dynamic";

export default async function AdminXpPage() {
  let initialUsers: any[] = [];
  let initialTransactions: any[] = [];
  let dedupedActivities: any[] = [];

  try {
    await dbConnect();

    // Load registered users, XP transactions, and dedicated ActivityLog events
    const [rawUsers, rawTransactions, rawActivityLogs, rawClaims] = await Promise.all([
      User.find({})
        .select("name email image xp lifetimeXp currentStreak lastActiveAt createdAt")
        .sort({ xp: -1 })
        .limit(100)
        .lean()
        .catch((err) => {
          console.error("Error fetching users for admin XP:", err);
          return [];
        }),
      XpTransaction.find({})
        .sort({ createdAt: -1 })
        .limit(200)
        .lean()
        .catch((err) => {
          console.error("Error fetching XP transactions:", err);
          return [];
        }),
      ActivityLog.find({})
        .sort({ createdAt: -1 })
        .limit(200)
        .lean()
        .catch((err) => {
          console.error("Error fetching activity logs:", err);
          return [];
        }),
      RewardClaim.find({})
        .sort({ claimedAt: -1, createdAt: -1 })
        .limit(50)
        .lean()
        .catch((err) => {
          console.error("Error fetching reward claims for XP ledger:", err);
          return [];
        }),
    ]);

    initialUsers = JSON.parse(JSON.stringify(rawUsers || []));
    initialTransactions = JSON.parse(JSON.stringify(rawTransactions || []));
    const savedActivities = JSON.parse(JSON.stringify(rawActivityLogs || []));
    const initialClaims = JSON.parse(JSON.stringify(rawClaims || []));

    // Synthesize unified activity log feed
    const activityLogs: any[] = savedActivities.map((act: any) => ({
      ...act,
      category: act.category || act.type || "general",
      title: act.title || "User Activity",
      description: act.description || "",
      userEmail: act.userEmail || "",
      userName: act.userName || "Player",
      createdAt: act.createdAt || new Date().toISOString(),
    }));

    // If there are older transactions not in ActivityLog, merge them seamlessly
    initialTransactions.forEach((tx: any) => {
      activityLogs.push({
        _id: `tx-${tx._id}`,
        type: "xp_transaction",
        category: tx.type || "admin_adjustment",
        title: `${(tx.amount || 0) > 0 ? "+" : ""}${tx.amount ?? 0} XP • ${tx.userName || "Player"}`,
        description: tx.description || "",
        userEmail: tx.userEmail || "",
        userName: tx.userName || "Player",
        meta: {
          amount: tx.amount,
          balanceAfter: tx.balanceAfter,
          adminEmail: tx.adminEmail,
        },
        createdAt: tx.createdAt || new Date().toISOString(),
      });
    });

    // Merge reward claim events
    initialClaims.forEach((claim: any) => {
      const statusStr = String(claim.status || "pending").toUpperCase();
      activityLogs.push({
        _id: `claim-${claim._id}`,
        type: "reward_claim",
        category: claim.status || "pending",
        title: `Redeemed ${claim.rewardTitle || "Reward"}${claim.game ? ` (${claim.game})` : ""}`,
        description: `Player UID: ${claim.playerId || "N/A"}${claim.zoneId ? ` (Zone: ${claim.zoneId})` : ""} • Status: ${statusStr}`,
        userEmail: claim.userEmail || "",
        userName: claim.userName || "Player",
        meta: {
          requiredXp: claim.requiredXp,
          status: claim.status || "pending",
          voucherCode: claim.voucherCode,
        },
        createdAt: claim.claimedAt || claim.createdAt || new Date().toISOString(),
      });
    });

    // Sort unified activities chronologically descending
    activityLogs.sort((a, b) => {
      const timeA = new Date(a.createdAt || 0).getTime() || 0;
      const timeB = new Date(b.createdAt || 0).getTime() || 0;
      return timeB - timeA;
    });

    // Deduplicate by unique fingerprint
    const seen = new Set();
    dedupedActivities = activityLogs.filter((item) => {
      const timeVal = new Date(item.createdAt || 0).getTime() || 0;
      const key = `${item.userEmail || "anon"}-${item.type || "act"}-${timeVal}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  } catch (error) {
    console.error("Critical error in AdminXpPage:", error);
  }

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
