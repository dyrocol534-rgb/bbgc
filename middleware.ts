import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Pass the request to the next handler
  const response = NextResponse.next();
  
  // Exclude static files, Next.js internals, and images from generating guest IDs to save resources
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/api') || 
    request.nextUrl.pathname.includes('.')
  ) {
    return response;
  }
  
  // If no guestId cookie exists, set one
  if (!request.cookies.has('guestId')) {
    response.cookies.set('guestId', crypto.randomUUID(), {
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
  }
  
  return response;
}
