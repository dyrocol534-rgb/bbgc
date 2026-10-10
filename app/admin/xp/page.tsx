import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import XpTransaction from "@/models/XpTransaction";
import AdminXpClient from "./AdminXpClient";

export const dynamic = "force-dynamic";

export default async function AdminXpPage() {
  await dbConnect();

  const [rawUsers, rawTransactions] = await Promise.all([
    User.find({})
      .select("name email image xp lifetimeXp currentStreak lastActiveAt createdAt")
      .sort({ xp: -1 })
      .limit(100)
      .lean(),
    XpTransaction.find({})
      .sort({ createdAt: -1 })
      .limit(100)
      .lean(),
  ]);

  const initialUsers = JSON.parse(JSON.stringify(rawUsers));
  const initialTransactions = JSON.parse(JSON.stringify(rawTransactions));

  return (
    <div className="w-full space-y-4">
      <AdminXpClient
        initialUsers={initialUsers}
        initialTransactions={initialTransactions}
      />
    </div>
  );
}
