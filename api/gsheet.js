import { kv } from '@vercel/kv';

const DEPT_IDS = ['__management__', 'cs', 'legal', 'hr', 'finance', 'marketing', 'operations', 'supply', 'design', 'rnd', 'sales'];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const action = req.query.action || 'config';

  // ── /api/gsheet?action=config  (was /api/gsheet-url) ──────────────────────
  if (action === 'config') {
    if (req.method === 'GET') {
      try {
        const entries = await Promise.all(
          DEPT_IDS.map(id =>
            kv.get(`gsheet-config:${id}`)
              .then(v => [id, v || {}])
              .catch(() => [id, {}])
          )
        );
        return res.status(200).json(Object.fromEntries(entries));
      } catch (err) {
        return res.status(500).json({ error: 'Failed to load config.' });
      }
    }
    if (req.method === 'POST') {
      try {
        const { dept, link, webhook } = req.body || {};
        if (!dept) return res.status(400).json({ error: 'dept required' });
        await kv.set(`gsheet-config:${dept}`, { link: link || '', webhook: webhook || '' });
        return res.status(200).json({ success: true });
      } catch (err) {
        return res.status(500).json({ error: 'Failed to save config.' });
      }
    }
  }

  // ── /api/gsheet?action=sync  (was /api/gsheet-sync) ───────────────────────
  if (action === 'sync') {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    try {
      const { dept, deptName, rows } = req.body || {};
      if (!rows || !Array.isArray(rows)) return res.status(400).json({ error: 'rows required' });
      const deptKey = dept || '__management__';
      const cfg = await kv.get(`gsheet-config:${deptKey}`);
      const webhook = (cfg || {}).webhook;
      if (!webhook) return res.status(200).json({ skipped: true, reason: 'No webhook configured' });
      const response = await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dept: deptKey, deptName: deptName || deptKey, rows }),
        signal: AbortSignal.timeout(15000),
      });
      const text = await response.text();
      return res.status(200).json({ ok: true, upstream: text });
    } catch (err) {
      return res.status(500).json({ error: 'Sync failed: ' + err.message });
    }
  }

  return res.status(400).json({ error: 'Unknown action' });
}
