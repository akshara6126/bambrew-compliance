import { del } from '@vercel/blob';
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method === 'GET') {
    const { compId } = req.query || {};
    if (!compId) return res.status(400).json({ error: 'compId required' });
    const docs = (await kv.get(`docs:${compId}`)) || [];
    return res.status(200).json(docs);
  }

  if (req.method === 'DELETE') {
    const { compId, url } = req.body || {};
    if (!compId || !url) return res.status(400).json({ error: 'compId and url required' });
    try { await del(url); } catch {}
    let docs = (await kv.get(`docs:${compId}`)) || [];
    docs = docs.filter(d => d.url !== url);
    await kv.set(`docs:${compId}`, docs);
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
