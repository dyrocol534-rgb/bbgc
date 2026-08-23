import { NextResponse } from 'next/server';

export async function GET() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BICpScIz-3HP8lngqryopgt9bjp6Obavx9t32UT8Ji9EbOQsMQXNGbhLWXnH9ajA7HX4Mvk0I3rEMlafCoFVXy8';
  return NextResponse.json({ publicKey });
}
