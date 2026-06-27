import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Subscriber from "@/models/Subscriber";
import UsersTabs from "@/components/admin/UsersTabs";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  await dbConnect();

  // Fetch all registered users
  const usersRaw = await User.find({}).sort({ createdAt: -1 }).lean();
  
  // Fetch all newsletter subscribers
  const subscribersRaw = await Subscriber.find({}).sort({ subscribedAt: -1 }).lean();

  // Serialize MongoDB object IDs and dates to plain JSON
  const users = JSON.parse(JSON.stringify(usersRaw));
  const subscribers = JSON.parse(JSON.stringify(subscribersRaw));

  return (
    <div>
      <h2 className="text-2xl font-bold text-text-main mb-6">Users & Subscribers</h2>
      <UsersTabs users={users} subscribers={subscribers} />
    </div>
  );
}
