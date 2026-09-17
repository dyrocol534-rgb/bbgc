import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import GuestSession from "@/models/GuestSession";
import UsersTabs from "@/components/admin/UsersTabs";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  await dbConnect();

  // Fetch all registered users
  const usersRaw = await User.find({}).sort({ lastActiveAt: -1, createdAt: -1 }).lean();

  // Fetch all guest sessions
  const guestsRaw = await GuestSession.find({}).sort({ lastActiveAt: -1, updatedAt: -1 }).lean();

  // Serialize MongoDB object IDs and dates to plain JSON
  const users = JSON.parse(JSON.stringify(usersRaw));
  const guests = JSON.parse(JSON.stringify(guestsRaw));

  return (
    <div className="space-y-4 max-w-[1400px] mx-auto">
      <UsersTabs users={users} guests={guests} />
    </div>
  );
}
