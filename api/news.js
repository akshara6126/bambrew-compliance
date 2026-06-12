import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const data = await kv.get('whats-new-data');
    if (!data) return res.status(200).json({ news: [], compliances: [], refreshedAt: null });
    return res.status(200).json(data);
  } catch (err) {
    console.error('news GET error:', err);
    return res.status(500).json({ error: 'Failed to load news.' });
  }
}
