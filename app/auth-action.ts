'use server';

import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = 'auth_session';

export async function isPersistentMode() {
  return process.env.PERSISTENT_CONNECTION !== 'false';
}

export async function loginAction(usernameInput: string, passwordInput: string) {
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminUsername || !adminPassword) {
    console.error('ADMIN_USERNAME or ADMIN_PASSWORD not set in environment variables');
    return { success: false, message: 'Server configuration error' };
  }

  if (usernameInput === adminUsername && passwordInput === adminPassword) {
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });
    return { success: true };
  }

  return { success: false, message: 'Invalid username or password' };
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  return { success: true };
}

export async function isAuthenticated() {
  if (process.env.PERSISTENT_CONNECTION === 'false') return true;
  
  const cookieStore = await cookies();
  return cookieStore.has(SESSION_COOKIE_NAME);
}
