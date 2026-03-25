// middleware.js
import { Redis } from '@upstash/redis';

export const config = {
  matcher: '/raw/:path*',
};

const redis = Redis.fromEnv();

export default async function middleware(request) {
  const url = new URL(request.url);
  const path = url.pathname;

  if (path.endsWith('.js') || path.endsWith('.user.js')) {
    const scriptName = path.replace('/raw/', '');
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    const key = `visitors:${scriptName}`;

    try {
      await redis.sadd(key, ip);
    } catch (error) {
      console.error('Failed to record visit:', error);
    }
  }

  return;
}