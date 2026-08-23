import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import PushSubscription from '@/models/PushSubscription';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.email !== (process.env.ADMIN_EMAIL || 'tusharkantanayak713@gmail.com')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const [totalSubscribers, mobileCount, desktopCount, tabletCount, recentSubscribers] = await Promise.all([
      PushSubscription.countDocuments(),
      PushSubscription.countDocuments({ deviceType: 'Mobile' }),
      PushSubscription.countDocuments({ deviceType: 'Desktop' }),
      PushSubscription.countDocuments({ deviceType: 'Tablet' }),
      PushSubscription.find().sort({ createdAt: -1 }).limit(10).lean(),
    ]);

    return NextResponse.json({
      total: totalSubscribers,
      devices: {
        mobile: mobileCount,
        desktop: desktopCount,
        tablet: tabletCount,
      },
      recent: recentSubscribers,
    });
  } catch (error: any) {
    console.error('Admin push stats error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch push stats' }, { status: 500 });
  }
}
