import { kv } from '@vercel/kv';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export default async function handler(req, res) {
  // Extract filename from original URL (Vercel rewrite keeps the original path)
  const filename = decodeURIComponent(req.url.split('/raw/')[1] || '');
  
  if (!filename || !filename.endsWith('.js')) {
    return res.status(404).send('Not found');
  }

  const filePath = path.join(process.cwd(), 'raw', filename);

  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    return res.status(404).send('Script not found');
  }

  // === UNIQUE VISITOR TRACKING ===
  // Parse cookies manually (no extra dependencies)
  const cookieHeader = req.headers.cookie || '';
  const cookies = cookieHeader.split(';').reduce((acc, c) => {
    const [key, value] = c.trim().split('=');
    if (key) acc[key] = value;
    return acc;
  }, {});

  let visitorId = cookies.visitor_id;

  // If no visitor cookie yet, create a new anonymous UUID and set it (1-year expiry)
  if (!visitorId) {
    visitorId = crypto.randomUUID();
    res.setHeader(
      'Set-Cookie',
      `visitor_id=${visitorId}; Path=/; Max-Age=31536000; SameSite=Strict; Secure; HttpOnly=false`
    );
  }

  // Add visitor to this specific script's set (Redis Set automatically deduplicates)
  // Same person refreshing or visiting the same .js again = no extra count
  const visitorsKey = `visitors:${filename}`;
  try {
    await kv.sadd(visitorsKey, visitorId);
  } catch (err) {
    // KV error should never block serving the script
    console.error('KV error (tracking skipped):', err);
  }

  // === SERVE THE SCRIPT EXACTLY AS BEFORE ===
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');

  res.status(200).send(content);
}