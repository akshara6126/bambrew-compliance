import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method === 'GET') {
    try {
      const history = await kv.get('missed-history') || {};
      return res.status(200).json(history);
    } catch (err) {
      return res.status(500).json({ error: 'Failed to load missed history.' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { period, missed } = req.body || {};
      if (!period) return res.status(400).json({ error: 'period required' });
      const history = (await kv.get('missed-history')) || {};
      history[period] = missed || [];
      // Keep last 24 periods max
      const keys = Object.keys(history).sort();
      if (keys.length > 24) keys.slice(0, keys.length - 24).forEach(k => delete history[k]);
      await kv.set('missed-history', history);
      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to save missed history.' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
