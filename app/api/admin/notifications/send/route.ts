import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import PushSubscription from '@/models/PushSubscription';
import { sendWebPush, PushPayload } from '@/lib/push';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.email !== (process.env.ADMIN_EMAIL || 'tusharkantanayak713@gmail.com')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, body, icon, image, url, target, testSubscription } = await req.json();

    if (!title || !body) {
      return NextResponse.json({ error: 'Title and body are required' }, { status: 400 });
    }

    const payload: PushPayload = {
      title,
      body,
      icon: icon || '/logo.png',
      image: image || undefined,
      url: url || '/',
    };

    // If target is test, send only to test subscription
    if (target === 'test') {
      if (!testSubscription || !testSubscription.endpoint) {
        return NextResponse.json({ error: 'Test subscription is required for test send' }, { status: 400 });
      }

      try {
        await sendWebPush(testSubscription, payload);
        return NextResponse.json({ success: true, message: 'Test notification sent successfully!' });
      } catch (err: any) {
        console.error('Test push send error:', err);
        return NextResponse.json({ error: `Failed to send test push: ${err.message || err.statusCode}` }, { status: 500 });
      }
    }

    // Otherwise, broadcast to all subscribers in MongoDB
    await dbConnect();
    const subscriptions = await PushSubscription.find().lean();

    if (subscriptions.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No subscribers to notify yet.',
        total: 0,
        successCount: 0,
        failureCount: 0,
        removedDead: 0,
      });
    }

    let successCount = 0;
    let failureCount = 0;
    const deadEndpoints: string[] = [];

    await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          await sendWebPush(
            {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.keys.p256dh,
                auth: sub.keys.auth,
              },
            },
            payload
          );
          successCount++;
        } catch (error: any) {
          failureCount++;
          // HTTP 404 or 410 means subscription is expired / revoked by user
          if (error.statusCode === 404 || error.statusCode === 410) {
            deadEndpoints.push(sub.endpoint);
          }
        }
      })
    );

    // Clean up dead subscriptions
    if (deadEndpoints.length > 0) {
      await PushSubscription.deleteMany({ endpoint: { $in: deadEndpoints } });
    }

    return NextResponse.json({
      success: true,
      message: `Push broadcast sent to ${successCount} devices.`,
      total: subscriptions.length,
      successCount,
      failureCount,
      removedDead: deadEndpoints.length,
    });
  } catch (error: any) {
    console.error('Push broadcast error:', error);
    return NextResponse.json({ error: error.message || 'Failed to send notifications' }, { status: 500 });
  }
}
