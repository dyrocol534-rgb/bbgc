import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Subscriber from "@/models/Subscriber";
import GuestSession from "@/models/GuestSession";
import UsersTabs from "@/components/admin/UsersTabs";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  await dbConnect();

  // Fetch all registered users
  const usersRaw = await User.find({}).sort({ createdAt: -1 }).lean();
  
  // Fetch all newsletter subscribers
  const subscribersRaw = await Subscriber.find({}).sort({ subscribedAt: -1 }).lean();

  // Fetch all guest sessions
  const guestsRaw = await GuestSession.find({}).sort({ lastActiveAt: -1 }).lean();

  // Serialize MongoDB object IDs and dates to plain JSON
  const users = JSON.parse(JSON.stringify(usersRaw));
  const subscribers = JSON.parse(JSON.stringify(subscribersRaw));
  const guests = JSON.parse(JSON.stringify(guestsRaw));

  return (
    <div className="space-y-4 max-w-[1400px] mx-auto">
      <div className="flex items-center gap-2">
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Users &amp; Subscribers</h1>
      </div>
      <UsersTabs users={users} subscribers={subscribers} guests={guests} />
    </div>
  );
}
