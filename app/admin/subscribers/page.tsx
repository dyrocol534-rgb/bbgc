import dbConnect from "@/lib/mongodb";
import Subscriber from "@/models/Subscriber";
import SubscribersView from "@/components/admin/SubscribersView";

export const dynamic = "force-dynamic";

export default async function AdminSubscribersPage() {
  await dbConnect();

  const subscribersRaw = await Subscriber.find({}).sort({ subscribedAt: -1 }).lean();
  const subscribers = JSON.parse(JSON.stringify(subscribersRaw));

  return (
    <div className="space-y-4 max-w-[1400px] mx-auto">
      <SubscribersView subscribers={subscribers} />
    </div>
  );
}
