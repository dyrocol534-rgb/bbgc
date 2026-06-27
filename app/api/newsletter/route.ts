import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Subscriber from '@/models/Subscriber';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    await dbConnect();

    // Check if already subscribed
    const existing = await Subscriber.findOne({ email });
    if (existing) {
      return NextResponse.json({ message: 'Already subscribed!' }, { status: 200 });
    }

    // Save new subscriber
    await Subscriber.create({ email });

    return NextResponse.json({ message: 'Successfully subscribed!' }, { status: 201 });
  } catch (error) {
    console.error('Newsletter error:', error);
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }
}
