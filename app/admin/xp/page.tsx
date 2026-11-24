import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import XpTransaction from "@/models/XpTransaction";
import AdminXpClient from "./AdminXpClient";

export const dynamic = "force-dynamic";

export default async function AdminXpPage() {
  let initialUsers: any[] = [];
  let initialTransactions: any[] = [];

  try {
    await dbConnect();

    // Load registered users and XP transactions
    const [rawUsers, rawTransactions] = await Promise.all([
      User.find({})
        .select("name email image xp lifetimeXp currentStreak lastActiveAt createdAt")
        .sort({ xp: -1 })
        .limit(60)
        .lean()
        .catch((err) => {
          console.error("Error fetching users for admin XP:", err);
          return [];
        }),
      XpTransaction.find({})
        .select("amount userName userEmail description adminEmail createdAt type balanceAfter")
        .sort({ createdAt: -1 })
        .limit(100)
        .lean()
        .catch((err) => {
          console.error("Error fetching XP transactions:", err);
          return [];
        }),
    ]);

    initialUsers = JSON.parse(JSON.stringify(rawUsers || []));
    initialTransactions = JSON.parse(JSON.stringify(rawTransactions || []));
  } catch (error) {
    console.error("Critical error in AdminXpPage:", error);
  }

  return (
    <div className="w-full space-y-4">
      <AdminXpClient
        initialUsers={initialUsers}
        initialTransactions={initialTransactions}
      />
    </div>
  );
}
