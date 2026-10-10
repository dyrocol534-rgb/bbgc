import dbConnect from "@/lib/mongodb";
import Reward from "@/models/Reward";
import AdminRewardsClient from "./AdminRewardsClient";

export const dynamic = "force-dynamic";

export default async function AdminRewardsPage() {
  await dbConnect();

  // If no rewards exist yet, seed default BGMI and MLBB items so admin sees them immediately
  const count = await Reward.countDocuments();
  if (count === 0) {
    await Reward.insertMany([
      {
        title: "60 BGMI UC",
        game: "Battlegrounds Mobile India",
        requiredXp: 50,
        badge: "Hot Demand",
        description: "Instant 60 Unknown Cash voucher delivered directly via Character ID.",
        stockStatus: "in_stock",
        isComingSoon: true,
        iconUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200&auto=format&fit=crop&q=80",
        active: true,
        sortOrder: 1,
      },
      {
        title: "MLBB Weekly Diamond Pass",
        game: "Mobile Legends: Bang Bang (Indian Server)",
        requiredXp: 111,
        badge: "Best Value",
        description: "7-day diamond delivery with daily pass bonus claimed via User ID + Zone ID.",
        stockStatus: "in_stock",
        isComingSoon: true,
        iconUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=200&auto=format&fit=crop&q=80",
        active: true,
        sortOrder: 2,
      },
    ]);
  }

  const rawRewards = await Reward.find({}).sort({ sortOrder: 1, createdAt: -1 }).lean();
  const initialRewards = JSON.parse(JSON.stringify(rawRewards));

  return (
    <div className="w-full space-y-6">
      <AdminRewardsClient initialRewards={initialRewards} />
    </div>
  );
}
