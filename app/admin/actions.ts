'use server'

import { cookies } from 'next/headers';

export async function unlockAdmin(password: string) {
  const adminPassword = process.env.ADMIN_PASSWORD || '123456';
  
  if (password === adminPassword) {
    const cookieStore = await cookies();
    cookieStore.set('admin_unlocked', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/admin',
      // No maxAge or expires provided, so this acts as a session cookie (clears on browser close)
    });
    return { success: true };
  }
  
  return { success: false, error: 'Incorrect password' };
}
