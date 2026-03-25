import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export async function GET() {
  try {
    const keys = await redis.keys('visitors:*');
    const rows = [];

    for (const key of keys) {
      const scriptName = key.replace('visitors:', '');
      const visitorCount = await redis.scard(key);
      rows.push({ script_name: scriptName, visitors: visitorCount });
    }

    rows.sort((a, b) => a.script_name.localeCompare(b.script_name));

    const tableRows = rows.map(row => `
      <tr>
        <td>${escapeHtml(row.script_name)}</td>
        <td>${row.visitors}</td>
      </tr>
    `).join('');

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Script Unique Visitors</title>
          <style>
            body { font-family: sans-serif; margin: 2rem; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <h1>Script Unique Visitors</h1>
          <table>
            <thead>
              <tr><th>Script File</th><th>Unique Visitors</th></tr>
            </thead>
            <tbody>
              ${tableRows || '<tr><td colspan="2">No data yet</td></tr>'}
            </tbody>
          </table>
        </body>
      </html>
    `;

    return new Response(html, {
      headers: { 'Content-Type': 'text/html' },
    });
  } catch (error) {
    console.error('Error fetching visitor data:', error);
    return new Response('Error loading visitor data', { status: 500 });
  }
}

function escapeHtml(str) {
  return str.replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
}