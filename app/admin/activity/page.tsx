import dbConnect from "@/lib/mongodb";
import ActivityLog from "@/models/ActivityLog";
import XpTransaction from "@/models/XpTransaction";
import RewardClaim from "@/models/RewardClaim";
import AdminActivityClient, { IActivityLogItem } from "./AdminActivityClient";

export const dynamic = "force-dynamic";

export default async function AdminActivityPage() {
  let dedupedActivities: IActivityLogItem[] = [];

  try {
    await dbConnect();

    // Fetch live system ActivityLogs, supplemented with recent XP transactions and Reward claims
    const [rawActivityLogs, rawTransactions, rawClaims] = await Promise.all([
      ActivityLog.find({})
        .select("_id type category title description userEmail userName meta createdAt")
        .sort({ createdAt: -1 })
        .limit(100)
        .lean()
        .catch((err) => {
          console.error("Error fetching activity logs:", err);
          return [];
        }),
      XpTransaction.find({})
        .select("_id amount userName description userEmail adminEmail createdAt type balanceAfter")
        .sort({ createdAt: -1 })
        .limit(50)
        .lean()
        .catch((err) => {
          console.error("Error fetching XP transactions for activity feed:", err);
          return [];
        }),
      RewardClaim.find({})
        .select("_id rewardTitle game playerId zoneId status requiredXp voucherCode claimedAt createdAt userEmail userName")
        .sort({ claimedAt: -1, createdAt: -1 })
        .limit(30)
        .lean()
        .catch((err) => {
          console.error("Error fetching reward claims for activity feed:", err);
          return [];
        }),
    ]);

    const savedActivities = JSON.parse(JSON.stringify(rawActivityLogs || []));
    const initialTransactions = JSON.parse(JSON.stringify(rawTransactions || []));
    const initialClaims = JSON.parse(JSON.stringify(rawClaims || []));

    // Synthesize unified activity log feed
    const activityLogs: IActivityLogItem[] = savedActivities.map((act: any) => ({
      _id: act._id ? act._id.toString() : `act-${Math.random()}`,
      type: act.type || "activity",
      category: act.category || act.type || "general",
      title: act.title || "User Activity",
      description: act.description || "",
      userEmail: act.userEmail || "",
      userName: act.userName || "Player",
      meta: act.meta || {},
      createdAt: act.createdAt || new Date().toISOString(),
    }));

    // If there are transactions, merge them seamlessly
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

    // Merge reward claims
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
    console.error("Critical error in AdminActivityPage:", error);
  }

  return (
    <div className="w-full space-y-4">
      <AdminActivityClient initialActivities={dedupedActivities.slice(0, 300)} />
    </div>
  );
}
