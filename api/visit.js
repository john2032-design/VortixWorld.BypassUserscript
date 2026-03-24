import { kv } from '@vercel/kv';
import fs from 'node:fs';
import path from 'node:path';

export default async function handler(req, res) {
  const rawDir = path.join(process.cwd(), 'raw');

  let files = [];
  try {
    files = fs.readdirSync(rawDir).filter(f => f.endsWith('.js'));
  } catch (err) {
    // No raw folder yet
  }

  const counts = {};
  for (const file of files) {
    const key = `visitors:${file}`;
    try {
      counts[file] = await kv.scard(key);
    } catch (err) {
      counts[file] = 0;
    }
  }

  // Build a nice HTML page
  let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Visit Stats</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 40px; background: #f8f9fa; }
    h1 { color: #333; }
    table { width: 100%; max-width: 800px; border-collapse: collapse; background: white; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    th, td { padding: 12px 16px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background: #f1f1f1; }
    tr:hover { background: #f8f9fa; }
    a { color: #0066cc; text-decoration: none; }
    a:hover { text-decoration: underline; }
    .note { font-size: 0.9em; color: #666; margin-bottom: 20px; }
  </style>
</head>
<body>
  <h1>📊 Unique Visitors for /raw/ Scripts</h1>
  <p class="note">
    • Counts are <strong>unique per script</strong> (same browser = same person).<br>
    • Refreshes or repeated visits to the same file do <strong>NOT</strong> increase the count.<br>
    • Tracking uses an anonymous cookie (no personal data stored).
  </p>
  <table>
    <tr>
      <th>Script File</th>
      <th>Unique Visitors</th>
    </tr>`;

  // Sort alphabetically
  Object.keys(counts)
    .sort()
    .forEach(file => {
      html += `
    <tr>
      <td><a href="/raw/${encodeURIComponent(file)}" target="_blank">${file}</a></td>
      <td><strong>${counts[file]}</strong></td>
    </tr>`;
    });

  html += `
  </table>
  <p style="margin-top:30px; font-size:0.85em; color:#666;">
    Total scripts tracked: ${files.length}
  </p>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(html);
}