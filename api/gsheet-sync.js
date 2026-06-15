import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { dept, deptName, rows } = req.body || {};
    if (!rows || !Array.isArray(rows)) return res.status(400).json({ error: 'rows required' });

    const deptKey = dept || '__management__';
    const cfg = await kv.get(`gsheet-config:${deptKey}`);
    const webhook = (cfg || {}).webhook;

    if (!webhook) {
      return res.status(200).json({ skipped: true, reason: 'No webhook configured for this dept' });
    }

    const response = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dept: deptKey, deptName: deptName || deptKey, rows }),
      signal: AbortSignal.timeout(15000),
    });

    const text = await response.text();
    return res.status(200).json({ ok: true, upstream: text });
  } catch (err) {
    console.error('gsheet-sync error:', err);
    return res.status(500).json({ error: 'Sync failed: ' + err.message });
  }
}
