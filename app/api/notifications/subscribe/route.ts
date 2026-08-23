import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import PushSubscription from '@/models/PushSubscription';

export async function POST(req: Request) {
  try {
    const { subscription, deviceType, userAgent } = await req.json();

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return NextResponse.json({ error: 'Invalid subscription object' }, { status: 400 });
    }

    await dbConnect();

    // Check if user is logged in
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id || null;

    // Upsert subscription
    await PushSubscription.findOneAndUpdate(
      { endpoint: subscription.endpoint },
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        },
        userId: userId || undefined,
        deviceType: deviceType || 'Desktop',
        userAgent: userAgent || '',
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({ success: true, message: 'Push subscription saved' });
  } catch (error: any) {
    console.error('Push subscribe error:', error);
    return NextResponse.json({ error: error.message || 'Failed to save subscription' }, { status: 500 });
  }
}
