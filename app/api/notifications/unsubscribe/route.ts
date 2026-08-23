import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import PushSubscription from '@/models/PushSubscription';

export async function POST(req: Request) {
  try {
    const { endpoint } = await req.json();

    if (!endpoint) {
      return NextResponse.json({ error: 'Endpoint is required' }, { status: 400 });
    }

    await dbConnect();
    await PushSubscription.deleteOne({ endpoint });

    return NextResponse.json({ success: true, message: 'Unsubscribed successfully' });
  } catch (error: any) {
    console.error('Push unsubscribe error:', error);
    return NextResponse.json({ error: error.message || 'Failed to unsubscribe' }, { status: 500 });
  }
}
